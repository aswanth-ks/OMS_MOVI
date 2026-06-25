import Report    from '../../models/Report.js';
import ReportRun from '../../models/ReportRun.js';
import User       from '../../models/User.js';
import Department from '../../models/Department.js';
import Role       from '../../models/Role.js';
import AuditLog   from '../../models/AuditLog.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

// ─── Seed data (runs once on first GET) ──────────────────────────────────────
const SEED_REPORTS = [
  {
    name: 'User Activity Report',
    description: 'Users created, deactivated, and logged in within a date range, grouped by department.',
    category: 'User Reports',
    type: 'system',
    schedule: 'Daily',
    dataSource: ['Users', 'Departments'],
    outputFormats: ['PDF', 'XLSX', 'CSV'],
    fileSizes: { pdf: '~1.2 MB', xlsx: '~0.4 MB', csv: '~100 KB' },
    parameters: 'Default: last 30 days, all departments',
    generatorKey: 'user-activity',
    filters: ['dateFrom', 'dateTo', 'department'],
    icon: 'Users',
  },
  {
    name: 'Department Summary',
    description: 'Headcount, active/inactive ratio, and role distribution per department.',
    category: 'Department Reports',
    type: 'system',
    schedule: 'Weekly',
    dataSource: ['Departments', 'Users'],
    outputFormats: ['PDF', 'XLSX', 'CSV'],
    fileSizes: { pdf: '~0.8 MB', xlsx: '~0.3 MB', csv: '~50 KB' },
    parameters: 'All departments',
    generatorKey: 'department-summary',
    filters: ['department'],
    icon: 'Building',
  },
  {
    name: 'Role & Permission Audit',
    description: 'Which roles have which permissions and how many users are assigned to each role.',
    category: 'Role Reports',
    type: 'system',
    schedule: 'Monthly',
    dataSource: ['Roles', 'Users', 'Permissions'],
    outputFormats: ['PDF', 'XLSX', 'CSV'],
    fileSizes: { pdf: '~0.5 MB', xlsx: '~0.2 MB', csv: '~30 KB' },
    parameters: 'All roles',
    generatorKey: 'role-permission-audit',
    filters: ['role'],
    icon: 'Shield',
  },
  {
    name: 'Login Activity Report',
    description: 'Login attempts, failures, and locked accounts within a date range.',
    category: 'Security Reports',
    type: 'system',
    schedule: 'Daily',
    dataSource: ['Audit Logs', 'Users'],
    outputFormats: ['PDF', 'XLSX', 'CSV'],
    fileSizes: { pdf: '~2.4 MB', xlsx: '~0.8 MB', csv: '~300 KB' },
    parameters: 'Default: last 30 days',
    generatorKey: 'login-activity',
    filters: ['dateFrom', 'dateTo'],
    icon: 'Lock',
  },
];

async function seedReports() {
  const count = await Report.countDocuments();
  if (count === 0) {
    const docs = SEED_REPORTS.map(r => ({ ...r, nextRun: calcNextRun(r.schedule) }));
    await Report.insertMany(docs);
  }
}

function calcNextRun(schedule) {
  const now = new Date();
  if (schedule === 'Daily') {
    const next = new Date(now);
    next.setHours(22, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
  if (schedule === 'Weekly') {
    const next = new Date(now);
    const day = next.getDay();
    const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
    next.setDate(next.getDate() + daysUntilMonday);
    next.setHours(8, 0, 0, 0);
    return next;
  }
  if (schedule === 'Monthly') {
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0);
  }
  return null;
}

// ─── GET /api/admin/reports ───────────────────────────────────────────────────
export const listReports = async (req, res, next) => {
  try {
    await seedReports();

    const { page = 1, limit = 12, search, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { isArchived: false };
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { category:    { $regex: search, $options: 'i' } },
        { dataSource:  { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const [reports, total] = await Promise.all([
      Report.find(query).sort({ createdAt: 1 }).skip(skip).limit(Number(limit)).lean(),
      Report.countDocuments(query),
    ]);

    // Attach run history to each report
    const enriched = await Promise.all(
      reports.map(async (r) => {
        const runs = await ReportRun.find({ report: r._id })
          .sort({ startedAt: -1 })
          .limit(10)
          .lean();

        const lastRun = runs[0]
          ? {
              executedAt:   runs[0].startedAt,
              status:       runs[0].status,
              recordCount:  runs[0].recordCount,
              fileSize:     runs[0].fileSize,
              duration:     runs[0].duration,
              errorMessage: runs[0].errorMessage,
            }
          : null;

        const runHistory = runs.map(run => ({
          executedAt:   run.startedAt,
          status:       run.status,
          duration:     run.duration || null,
          recordCount:  run.recordCount || 0,
          fileSize:     run.fileSize || null,
          errorMessage: run.errorMessage || null,
        }));

        return { ...r, lastRun, runHistory };
      })
    );

    // ── Stats ──
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [successLast24h, failedLast24h, allCount, scheduledTodayCount] = await Promise.all([
      ReportRun.countDocuments({ status: 'SUCCESS', startedAt: { $gte: dayAgo } }),
      ReportRun.countDocuments({ status: 'FAILED',  startedAt: { $gte: dayAgo } }),
      Report.countDocuments({ isArchived: false }),
      Report.countDocuments({
        isArchived: false,
        schedule: { $ne: 'Manual' },
        nextRun: { $gte: todayStart, $lt: todayEnd },
      }),
    ]);

    // Storage estimate from recent successful runs
    const recentRuns = await ReportRun.find({ status: 'SUCCESS' }).select('fileSize').lean();
    let totalBytes = 0;
    recentRuns.forEach(r => {
      const m = r.fileSize && r.fileSize.match(/([\d.]+)\s*(KB|MB|GB)/i);
      if (m) {
        const v = parseFloat(m[1]);
        const u = m[2].toUpperCase();
        if (u === 'KB') totalBytes += v * 1024;
        else if (u === 'MB') totalBytes += v * 1024 * 1024;
        else if (u === 'GB') totalBytes += v * 1024 * 1024 * 1024;
      }
    });
    const storageUsed = totalBytes >= 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(totalBytes / 1024).toFixed(1)} KB`;

    sendSuccess(res, {
      reports:    enriched,
      stats: {
        total:           allCount,
        successLast24h,
        failed:          failedLast24h,
        scheduledToday:  scheduledTodayCount,
        storageUsed:     totalBytes > 0 ? storageUsed : '0 KB',
      },
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/admin/reports/:id/run ─────────────────────────────────────────
export const triggerRun = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return sendError(res, 'Report not found', 404);

    const run = await ReportRun.create({
      report:    report._id,
      executedBy: req.user?._id,
      startedAt: new Date(),
    });

    // Async generation (simulated via setTimeout until job queue is added)
    setTimeout(async () => {
      const startMs = Date.now();
      try {
        const result  = await generateReport(report.generatorKey, {});
        const durationSec = Math.max(1, Math.round((Date.now() - startMs) / 1000));
        const rows    = result.rows?.length ?? 0;
        const csvBytes = Buffer.byteLength(buildCsv(report.name, {}, result), 'utf8');
        const fileSize = csvBytes >= 1024 * 1024
          ? `${(csvBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${(csvBytes / 1024).toFixed(1)} KB`;

        await ReportRun.findByIdAndUpdate(run._id, {
          status:      'SUCCESS',
          completedAt: new Date(),
          recordCount: rows,
          fileSize,
          duration:    `${durationSec}s`,
        });

        if (report.schedule !== 'Manual') {
          await Report.findByIdAndUpdate(report._id, { nextRun: calcNextRun(report.schedule) });
        }
      } catch (err) {
        const durationSec = Math.max(1, Math.round((Date.now() - startMs) / 1000));
        await ReportRun.findByIdAndUpdate(run._id, {
          status:       'FAILED',
          completedAt:  new Date(),
          errorMessage: err.message,
          duration:     `${durationSec}s`,
        });
      }
    }, 3000);

    sendSuccess(res, {
      runId:     run.runId,
      reportId:  report._id,
      status:    'PENDING',
      startedAt: run.startedAt,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/reports/:id/runs/:runId/status ────────────────────────────
export const getRunStatus = async (req, res, next) => {
  try {
    const run = await ReportRun.findOne({
      report: req.params.id,
      runId:  req.params.runId,
    });
    if (!run) return sendError(res, 'Run not found', 404);

    sendSuccess(res, {
      runId:       run.runId,
      status:      run.status,
      recordCount: run.recordCount,
      fileSize:    run.fileSize,
      duration:    run.duration,
      errorMessage: run.errorMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/reports/:id/export ───────────────────────────────────────
export const exportReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return sendError(res, 'Report not found', 404);

    const format = (req.query.format || 'csv').toLowerCase();
    const result = await generateReport(report.generatorKey, {});
    const csv    = buildCsv(report.name, {}, result);

    const exportedAt = new Date().toISOString().slice(0, 10);
    const safeName   = report.name.replace(/[^a-z0-9]+/gi, '_');
    const ext        = format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
    const filename   = `OWMS_${safeName}_${exportedAt}.${ext}`;

    const contentTypeMap = {
      pdf:  'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv:  'text/csv; charset=utf-8',
    };

    res.setHeader('Content-Type', contentTypeMap[format] || 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send('﻿' + csv); // BOM for Excel compatibility
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/admin/reports/:id ───────────────────────────────────────────
export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return sendError(res, 'Report not found', 404);
    await ReportRun.deleteMany({ report: req.params.id });
    sendSuccess(res, { message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/admin/reports/:id/archive ────────────────────────────────────
export const archiveReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    if (!report) return sendError(res, 'Report not found', 404);
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

// ─── Core report generator ────────────────────────────────────────────────────
async function generateReport(generatorKey, filters) {
  switch (generatorKey) {
    case 'user-activity':        return runUserActivity(filters);
    case 'department-summary':   return runDepartmentSummary(filters);
    case 'role-permission-audit': return runRolePermissionAudit(filters);
    case 'login-activity':       return runLoginActivity(filters);
    default: throw new Error(`No generator for key: ${generatorKey}`);
  }
}

// ── 1. User Activity ──────────────────────────────────────────────────────────
async function runUserActivity(filters) {
  const { dateFrom, dateTo, department } = filters;
  const dateFilter = buildDateFilter(dateFrom, dateTo);
  const userFilter = { deletedAt: { $exists: false } };
  if (department) userFilter.department = department;
  if (dateFilter) userFilter.createdAt = dateFilter;

  const [users, departments] = await Promise.all([
    User.find(userFilter)
      .populate('role', 'name slug')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    Department.find().select('name').lean(),
  ]);

  const total     = users.length;
  const active    = users.filter(u => u.status === 'Active').length;
  const inactive  = users.filter(u => u.status === 'Inactive').length;
  const suspended = users.filter(u => u.status === 'Suspended').length;

  const byDept = {};
  departments.forEach(d => {
    byDept[d._id.toString()] = { department: d.name, total: 0, active: 0, inactive: 0 };
  });
  byDept['__none__'] = { department: 'No Department', total: 0, active: 0, inactive: 0 };

  users.forEach(u => {
    const key = u.department?._id?.toString() || '__none__';
    if (!byDept[key]) byDept[key] = { department: u.department?.name || 'Unknown', total: 0, active: 0, inactive: 0 };
    byDept[key].total++;
    if (u.status === 'Active') byDept[key].active++;
    else byDept[key].inactive++;
  });

  const rows = users.map(u => ({
    name:           u.name,
    email:          u.email,
    employeeId:     u.employeeId,
    role:           u.role?.name || '—',
    department:     u.department?.name || '—',
    status:         u.status,
    employmentType: u.employmentType,
    joinDate:       u.joinDate ? new Date(u.joinDate).toLocaleDateString('en-US') : '—',
    createdAt:      u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US') : '—',
  }));

  return {
    summary: { total, active, inactive, suspended },
    groupedByDepartment: Object.values(byDept).filter(d => d.total > 0),
    rows,
    columns: ['Name', 'Email', 'Employee ID', 'Role', 'Department', 'Status', 'Employment Type', 'Join Date', 'Created At'],
  };
}

// ── 2. Department Summary ─────────────────────────────────────────────────────
async function runDepartmentSummary(filters) {
  const { department } = filters;
  const deptFilter = department ? { _id: department } : {};
  const departments = await Department.find(deptFilter).lean();

  const rows = await Promise.all(departments.map(async (dept) => {
    const [total, active, inactive] = await Promise.all([
      User.countDocuments({ department: dept._id, deletedAt: { $exists: false } }),
      User.countDocuments({ department: dept._id, status: 'Active', deletedAt: { $exists: false } }),
      User.countDocuments({ department: dept._id, status: 'Inactive', deletedAt: { $exists: false } }),
    ]);
    return {
      department:  dept.name,
      code:        dept.code || '—',
      status:      dept.status || 'Active',
      headcount:   total,
      active,
      inactive,
      activeRatio: total > 0 ? Math.round((active / total) * 100) + '%' : '0%',
    };
  }));

  const totalHeadcount = rows.reduce((s, r) => s + r.headcount, 0);
  const totalActive    = rows.reduce((s, r) => s + r.active, 0);

  return {
    summary: { totalDepartments: rows.length, totalHeadcount, totalActive, totalInactive: totalHeadcount - totalActive },
    rows,
    columns: ['Department', 'Code', 'Status', 'Headcount', 'Active', 'Inactive', 'Active Ratio'],
  };
}

// ── 3. Role & Permission Audit ────────────────────────────────────────────────
async function runRolePermissionAudit(filters) {
  const { role } = filters;
  const roleFilter = role ? { _id: role } : {};
  const roles = await Role.find(roleFilter).populate('permissions', 'name resource action status').lean();

  const rows = await Promise.all(roles.map(async (r) => {
    const userCount = await User.countDocuments({ role: r._id, deletedAt: { $exists: false } });
    const perms = (r.permissions || []).filter(p => p.status === 'Active');
    return {
      role:            r.name,
      slug:            r.slug,
      status:          r.status,
      userCount,
      permissionCount: perms.length,
      permissions:     perms.map(p => `${p.resource}:${p.action}`).join(', '),
    };
  }));

  const totalUsers = rows.reduce((s, r) => s + r.userCount, 0);
  const totalPerms = rows.reduce((s, r) => s + r.permissionCount, 0);

  return {
    summary: { totalRoles: rows.length, totalUsers, totalPermissions: totalPerms },
    rows,
    columns: ['Role', 'Slug', 'Status', 'Users Assigned', 'Active Permissions', 'Permissions'],
  };
}

// ── 4. Login Activity ─────────────────────────────────────────────────────────
async function runLoginActivity(filters) {
  const { dateFrom, dateTo } = filters;
  const dateFilter = buildDateFilter(dateFrom, dateTo);
  const logFilter  = { action: { $in: ['Login', 'Logout'] } };
  if (dateFilter) logFilter.createdAt = dateFilter;

  const logs = await AuditLog.find(logFilter)
    .populate({ path: 'user', select: 'name email employeeId', populate: { path: 'role', select: 'name' } })
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();

  const totalLogins   = logs.filter(l => l.action === 'Login').length;
  const successLogins = logs.filter(l => l.action === 'Login' && l.result === 'SUCCESS').length;
  const failedLogins  = logs.filter(l => l.action === 'Login' && l.result === 'FAILED').length;
  const lockedCount   = await User.countDocuments({ lockUntil: { $gt: new Date() }, deletedAt: { $exists: false } });

  const rows = logs.map(l => ({
    timestamp:  l.createdAt ? new Date(l.createdAt).toLocaleString('en-US') : '—',
    user:       l.user?.name || l.userName || 'Unknown',
    email:      l.user?.email || '—',
    role:       l.user?.role?.name || '—',
    action:     l.action,
    result:     l.result,
    ipAddress:  l.ipAddress || '—',
    device:     l.device || '—',
  }));

  return {
    summary: { totalEvents: logs.length, totalLogins, successLogins, failedLogins, lockedAccounts: lockedCount },
    rows,
    columns: ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Result', 'IP Address', 'Device'],
  };
}

// ─── CSV builder ──────────────────────────────────────────────────────────────
function buildCsv(title, filters, result) {
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const metaLines = [
    `"Report:","${title}"`,
    `"Generated At:","${new Date().toLocaleString('en-US')}"`,
  ];
  if (filters.dateFrom) metaLines.push(`"From:","${filters.dateFrom}"`);
  if (filters.dateTo)   metaLines.push(`"To:","${filters.dateTo}"`);
  metaLines.push('');

  const header   = result.columns.map(escape).join(',');
  const dataRows = result.rows.map(row =>
    result.columns.map(col => {
      const key = col.toLowerCase().replace(/[^a-z]/g, '');
      const val = Object.entries(row).find(([k]) => k.toLowerCase().replace(/[^a-z]/g, '') === key)?.[1];
      return escape(val ?? '');
    }).join(',')
  );

  return [...metaLines, header, ...dataRows].join('\n');
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function buildDateFilter(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return null;
  const f = {};
  if (dateFrom) f.$gte = new Date(dateFrom);
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    f.$lte = end;
  }
  return f;
}
