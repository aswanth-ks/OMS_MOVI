import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, Building2, Shield, AlertTriangle, UserCheck,
  Plus, LayoutGrid, History, Settings as SettingsIcon,
  RefreshCw, ChevronRight, Clock,
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { adminAPI } from '../../utils/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const actionBadge = (action = '') => {
  const a = action.toLowerCase();
  if (a.includes('create') || a.includes('login'))  return 'bg-blue-100 text-blue-700';
  if (a.includes('update') || a.includes('edit'))   return 'bg-amber-100 text-amber-700';
  if (a.includes('delete'))                         return 'bg-red-100 text-red-700';
  if (a.includes('export'))                         return 'bg-cyan-100 text-cyan-700';
  if (a.includes('logout'))                         return 'bg-gray-100 text-gray-500';
  return 'bg-slate-100 text-slate-600';
};

const resultDot = (result) => {
  if (result === 'SUCCESS') return 'bg-[#16A34A]';
  if (result === 'FAILED')  return 'bg-[#DC2626]';
  if (result === 'WARNING') return 'bg-[#D97706]';
  return 'bg-[#94A3B8]';
};

const ROLE_BAR = {
  'super-admin': 'bg-red-500',
  'admin':       'bg-orange-500',
  'hr-manager':  'bg-violet-500',
  'pmo-lead':    'bg-cyan-500',
  'employee':    'bg-blue-500',
  'intern':      'bg-emerald-500',
};

const MODULE_BAR = {
  'Users':       'bg-blue-500',
  'Departments': 'bg-violet-500',
  'Roles':       'bg-indigo-500',
  'Settings':    'bg-amber-500',
  'Reports':     'bg-cyan-500',
  'Audit Logs':  'bg-slate-500',
  'Auth':        'bg-green-500',
  'Projects':    'bg-emerald-500',
  'Tasks':       'bg-yellow-500',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, subRed, icon: Icon, topColor, iconBg, iconColor, loading, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md hover:border-[#CBD5E1]' : ''}`}
  >
    <div className={`h-1 ${topColor}`} />
    <div className="px-5 pt-4 pb-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider leading-none">
            {label}
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-[#F1F5F9] rounded-lg animate-pulse mt-2.5" />
          ) : (
            <p className="text-[30px] font-bold text-[#0F172A] leading-none mt-2">
              {value !== null && value !== undefined ? value : '—'}
            </p>
          )}
          {!loading && sub && (
            <p className={`text-[12px] mt-1.5 leading-snug ${subRed ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
              {sub}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
    </div>
  </div>
);

const Card = ({ title, action, onAction, children }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
    {(title || action) && (
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
        {title && (
          <h2 className="text-[15px] font-semibold text-[#0F172A]">{title}</h2>
        )}
        {action && (
          <button
            onClick={onAction}
            className="text-[12px] font-medium text-[#2563EB] hover:underline flex items-center gap-1 shrink-0"
          >
            {action}
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    )}
    {children}
  </div>
);

const Skeleton = ({ rows = 4, withBar = false }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i}>
        {withBar ? (
          <>
            <div className="flex justify-between mb-1.5">
              <div className="h-3 bg-[#E2E8F0] rounded w-24" />
              <div className="h-3 bg-[#E2E8F0] rounded w-8" />
            </div>
            <div className="h-2 bg-[#E2E8F0] rounded-full" />
          </>
        ) : (
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-[#E2E8F0] mt-1.5 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-[#E2E8F0] rounded w-3/4" />
              <div className="h-3 bg-[#E2E8F0] rounded w-1/2" />
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const [totalUsers, setTotalUsers]   = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles]             = useState([]);
  const [logs, setLogs]               = useState([]);
  const [failedTotal, setFailedTotal] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const canReadLogs = hasPermission('Audit Logs', 'read');
      const promises = [
        adminAPI.getUsers({ limit: 1 }),
        adminAPI.getUsers({ status: 'Active', limit: 1 }),
        adminAPI.getDepartments(),
        adminAPI.getRoles(),
      ];

      if (canReadLogs) {
        promises.push(adminAPI.getAuditLogs({ limit: 50 }));
        promises.push(adminAPI.getAuditLogs({ result: 'FAILED', limit: 1 }));
      }

      const results = await Promise.all(promises);

      const uRes = results[0];
      const aRes = results[1];
      const dRes = results[2];
      const rRes = results[3];

      setTotalUsers(uRes.data.pagination?.total ?? uRes.data.total ?? 0);
      setActiveUsers(aRes.data.pagination?.total ?? aRes.data.total ?? 0);
      setDepartments(dRes.data.data || []);
      setRoles(rRes.data.data || []);

      if (canReadLogs) {
        const lRes = results[4];
        const fRes = results[5];
        setLogs(lRes.data.data || []);
        setFailedTotal(fRes.data.pagination?.total ?? fRes.data.total ?? 0);
      } else {
        setLogs([]);
        setFailedTotal(0);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const canReadLogs = hasPermission('Audit Logs', 'read');

  const inactiveUsers = (totalUsers != null && activeUsers != null)
    ? totalUsers - activeUsers
    : null;

  const activePct = (totalUsers && activeUsers)
    ? Math.round((activeUsers / totalUsers) * 100)
    : null;

  const systemRoles = roles.filter(r => r.isSystem).length;

  // Top modules by event count from last 50 logs
  const moduleCounts = {};
  logs.forEach(l => {
    if (l.module) moduleCounts[l.module] = (moduleCounts[l.module] || 0) + 1;
  });
  const topModules = Object.entries(moduleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxModuleCount = topModules[0]?.[1] || 1;

  // Roles with assigned users only
  const rolesWithUsers = [...roles]
    .filter(r => (r.userCount || 0) > 0)
    .sort((a, b) => (b.userCount || 0) - (a.userCount || 0));
  const maxRoleCount = rolesWithUsers[0]?.userCount || 1;

  const timeline = logs.slice(0, 10);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  const hasAlerts = failedTotal != null && failedTotal > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full space-y-6 pb-10">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-5">
          <div>
            <p className="text-[12px] font-medium text-[#64748B] mb-0.5">{greeting}</p>
            <h1 className="text-[24px] font-semibold tracking-tight text-[#0F172A]">
              Administration Dashboard
            </h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {lastRefreshed && (
              <span className="text-[12px] text-[#94A3B8]">
                Updated {timeAgo(lastRefreshed)}
              </span>
            )}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="border border-[#E2E8F0] bg-white text-[#0F172A] px-3 py-1.5 rounded-lg text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Today's Summary Strip ───────────────────────────────────────────── */}
        {!loading && canReadLogs && logs.length > 0 && (() => {
          const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
          const todayLogs  = logs.filter(l => new Date(l.createdAt) >= todayStart);
          const todayFailed = todayLogs.filter(l => l.result === 'FAILED').length;
          const lastLog    = logs[0];
          if (todayLogs.length === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-white border border-[#E2E8F0] rounded-xl px-5 py-3 shadow-sm text-[13px]">
              <span className="font-semibold text-[#0F172A]">Today</span>
              <span className="text-[#64748B]">
                <span className="font-medium text-[#0F172A]">{todayLogs.length}</span> {todayLogs.length === 1 ? 'event' : 'events'}
              </span>
              {todayFailed > 0 && (
                <span className="text-[#DC2626]">
                  <span className="font-medium">{todayFailed}</span> failed
                </span>
              )}
              {todayFailed === 0 && (
                <span className="text-[#16A34A] font-medium">No failures</span>
              )}
              <span className="text-[#94A3B8]">·</span>
              <span className="text-[#64748B]">
                Last activity <span className="font-medium text-[#0F172A]">{timeAgo(lastLog.createdAt)}</span>
              </span>
            </div>
          );
        })()}

        {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${canReadLogs ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} gap-4`}>
          <KpiCard
            label="Total Users"
            value={loading ? null : totalUsers}
            sub={inactiveUsers != null ? `${inactiveUsers} inactive` : null}
            subRed={inactiveUsers > 0}
            icon={Users}
            topColor="bg-[#2563EB]"
            iconBg="bg-[#EFF6FF]"
            iconColor="text-[#2563EB]"
            loading={loading}
            onClick={() => navigate('/admin/users')}
          />
          <KpiCard
            label="Active Users"
            value={loading ? null : activeUsers}
            sub={activePct != null ? `${activePct}% of workforce` : null}
            icon={UserCheck}
            topColor="bg-[#16A34A]"
            iconBg="bg-[#DCFCE7]"
            iconColor="text-[#16A34A]"
            loading={loading}
            onClick={() => navigate('/admin/users?status=Active')}
          />
          <KpiCard
            label="Departments"
            value={loading ? null : departments.length}
            sub={departments.length > 0 ? 'across the organization' : null}
            icon={Building2}
            topColor="bg-[#7C3AED]"
            iconBg="bg-[#EDE9FE]"
            iconColor="text-[#7C3AED]"
            loading={loading}
            onClick={() => navigate('/admin/departments')}
          />
          <KpiCard
            label="Roles"
            value={loading ? null : roles.length}
            sub={systemRoles > 0 ? `${systemRoles} system defaults` : null}
            icon={Shield}
            topColor="bg-[#D97706]"
            iconBg="bg-[#FEF3C7]"
            iconColor="text-[#D97706]"
            loading={loading}
            onClick={() => navigate('/admin/roles')}
          />
          {canReadLogs && (
            <KpiCard
              label="Security Alerts"
              value={loading ? null : failedTotal}
              sub={hasAlerts ? 'Failed access attempts' : 'No recorded alerts'}
              subRed={hasAlerts}
              icon={AlertTriangle}
              topColor={hasAlerts ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}
              iconBg={hasAlerts ? 'bg-[#FEE2E2]' : 'bg-[#DCFCE7]'}
              iconColor={hasAlerts ? 'text-[#DC2626]' : 'text-[#16A34A]'}
              loading={loading}
              onClick={() => navigate('/admin/audit?result=FAILED')}
            />
          )}
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3) ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Activity Timeline */}
            {canReadLogs && (
              <Card title="Recent Activity" action="View All" onAction={() => navigate('/admin/audit')}>
                <div className="px-5 py-4">
                  {loading ? (
                    <Skeleton rows={6} />
                  ) : timeline.length === 0 ? (
                    <div className="py-10 text-center">
                      <Clock size={30} className="text-[#CBD5E1] mx-auto mb-2" />
                      <p className="text-[13px] text-[#94A3B8]">No recent activity to display</p>
                    </div>
                  ) : (
                    timeline.map((log, i) => (
                      <div key={log._id} className="flex gap-3">
                        {/* Timeline column */}
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${resultDot(log.result)}`} />
                          {i < timeline.length - 1 && (
                            <div className="w-px flex-1 bg-[#E2E8F0] my-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${i < timeline.length - 1 ? 'pb-3.5' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${actionBadge(log.action)}`}>
                                  {log.action || 'Action'}
                                </span>
                                {log.module && (
                                  <span className="text-[11px] text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                                    {log.module}
                                  </span>
                                )}
                              </div>
                              <p className="text-[13px] text-[#0F172A] mt-0.5 leading-snug">
                                <span className="font-medium">
                                  {log.user?.name || log.performedBy?.name || 'System'}
                                </span>
                                {log.details && (
                                  <span className="text-[#64748B]">
                                    {' — '}
                                    {log.details.length > 70
                                      ? `${log.details.slice(0, 70)}…`
                                      : log.details}
                                  </span>
                                )}
                              </p>
                            </div>
                            <span className="text-[11px] text-[#94A3B8] shrink-0 whitespace-nowrap">
                              {timeAgo(log.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* User Distribution by Role */}
            <Card
              title="User Distribution by Role"
              action="Manage Roles"
              onAction={() => navigate('/admin/roles')}
            >
              <div className="px-5 py-4 space-y-3">
                {loading ? (
                  <Skeleton rows={4} withBar />
                ) : rolesWithUsers.length === 0 ? (
                  <p className="text-[13px] text-[#94A3B8] py-4 text-center">
                    No users assigned to roles yet
                  </p>
                ) : (
                  rolesWithUsers.map(role => {
                    const pct = Math.round(((role.userCount || 0) / maxRoleCount) * 100);
                    const barColor = ROLE_BAR[role.slug] || 'bg-slate-400';
                    return (
                      <div key={role._id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] font-medium text-[#0F172A]">
                            {role.name}
                          </span>
                          <span className="text-[12px] text-[#64748B] font-mono">
                            {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                          </span>
                        </div>
                        <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

          </div>

          {/* ── Right column (1/3) ────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* System Health */}
            <Card title="System Health">
              <div className="px-5 py-4">
                <div className="space-y-3">
                  {[
                    { label: 'API Server',  value: 'Online',    green: true },
                    { label: 'Database',    value: 'Connected', green: true },
                    { label: 'Maintenance', value: 'Disabled',  green: true },
                  ].map(({ label, value, green }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[13px] text-[#64748B]">{label}</span>
                      <span className={`text-[13px] font-medium flex items-center gap-1.5 ${green ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${green ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} />
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#F1F5F9] pt-3 mt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#64748B]">Last Activity</span>
                    <span className="text-[13px] font-medium text-[#0F172A]">
                      {loading ? '—' : logs[0] ? timeAgo(logs[0].createdAt) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#64748B]">Security Alerts</span>
                    {loading ? (
                      <div className="h-4 w-10 bg-[#F1F5F9] rounded animate-pulse" />
                    ) : (
                      <span className={`text-[13px] font-medium ${hasAlerts ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                        {failedTotal ?? '—'} {failedTotal === 1 ? 'alert' : 'alerts'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="px-4 py-4 grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'New User',
                    Icon: Plus,
                    path: '/admin/users/new',
                    bg: 'bg-[#EFF6FF]',
                    border: 'border-[#BFDBFE]',
                    text: 'text-[#2563EB]',
                  },
                  {
                    label: 'Access Matrix',
                    Icon: LayoutGrid,
                    path: '/admin/access-matrix',
                    bg: 'bg-[#EDE9FE]',
                    border: 'border-[#DDD6FE]',
                    text: 'text-[#7C3AED]',
                  },
                  {
                    label: 'Audit Logs',
                    Icon: History,
                    path: '/admin/audit',
                    bg: 'bg-[#F0FDF4]',
                    border: 'border-[#BBF7D0]',
                    text: 'text-[#16A34A]',
                  },
                  {
                    label: 'Settings',
                    Icon: SettingsIcon,
                    path: '/admin/settings',
                    bg: 'bg-[#FFFBEB]',
                    border: 'border-[#FDE68A]',
                    text: 'text-[#D97706]',
                  },
                ].map(({ label, Icon, path, bg, border, text }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border hover:shadow-sm transition-all ${bg} ${border}`}
                  >
                    <Icon size={18} className={text} />
                    <span className={`text-[11px] font-semibold ${text}`}>{label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Top Modules by Activity */}
            <Card
              title="Top Modules"
              action="View Logs"
              onAction={() => navigate('/admin/audit')}
            >
              <div className="px-5 py-4 space-y-3">
                {loading ? (
                  <Skeleton rows={4} withBar />
                ) : topModules.length === 0 ? (
                  <p className="text-[13px] text-[#94A3B8] py-4 text-center">
                    No activity data available
                  </p>
                ) : (
                  topModules.map(([module, count]) => {
                    const pct = Math.round((count / maxModuleCount) * 100);
                    const barColor = MODULE_BAR[module] || 'bg-slate-400';
                    return (
                      <div key={module}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium text-[#0F172A]">{module}</span>
                          <span className="text-[11px] text-[#94A3B8] font-mono">{count}</span>
                        </div>
                        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
