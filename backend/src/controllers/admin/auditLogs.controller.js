import AuditLog from '../../models/AuditLog.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse.js';
import { getPagination } from '../../utils/paginate.js';

/**
 * GET /api/admin/audit-logs
 * List all audit logs with pagination and filters.
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, user, module, action, result, dateFrom, dateTo, ipAddress } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { details: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    if (user) filter.user = user;
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (result) filter.result = result;
    if (ipAddress) filter.ipAddress = { $regex: ipAddress, $options: 'i' };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate({
          path: 'user',
          select: 'name employeeId role',
          populate: { path: 'role', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    sendPaginated(res, logs, {
      total, page, limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs/:id
 */
export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name employeeId role',
        populate: { path: 'role', select: 'name' },
      });

    if (!log) {
      return sendError(res, 'Audit log not found', 404);
    }

    sendSuccess(res, log);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs/export
 * Export filtered audit logs as CSV.
 */
export const exportAuditLogs = async (req, res, next) => {
  try {
    // Basic filter extraction similar to getAuditLogs
    const { module, action, result, dateFrom, dateTo } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (result) filter.result = result;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000); // Prevent massive memory dumps

    let csv = 'Date,User,Action,Module,Details,Result,IP Address\n';

    logs.forEach((log) => {
      const date = log.createdAt.toISOString();
      const user = `"${log.userName || 'System'}"`;
      const actionStr = `"${log.action}"`;
      const moduleStr = `"${log.module}"`;
      // Escape quotes in details
      const details = `"${(log.details || '').replace(/"/g, '""')}"`;
      const resultStr = log.result;
      const ip = log.ipAddress || '';

      csv += `${date},${user},${actionStr},${moduleStr},${details},${resultStr},${ip}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
