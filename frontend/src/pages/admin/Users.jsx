import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Upload } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import BulkImportModal from '../../components/shared/BulkImportModal';
import { adminAPI } from '../../utils/api';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showImport, setShowImport]   = useState(false);

  // ── Real data state ─────────────────────────────────────────────────────
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [searchQuery, setSearchQuery]         = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter]         = useState('All');

  // ── Accurate global stats (not filtered by current page) ─────────────────
  const [globalStats, setGlobalStats] = useState({ active: null, inactive: null });

  useEffect(() => {
    Promise.all([
      adminAPI.getUsers({ status: 'Active', limit: 1 }),
      adminAPI.getUsers({ status: 'Inactive', limit: 1 }),
    ]).then(([aRes, iRes]) => {
      setGlobalStats({
        active:   aRes.data.pagination?.total ?? aRes.data.total ?? 0,
        inactive: iRes.data.pagination?.total ?? iRes.data.total ?? 0,
      });
    }).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getUsers({
        page: currentPage,
        limit: 25,
        search: searchQuery || undefined,
        department: departmentFilter !== 'All' ? departmentFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setUsers(response.data.data);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Selection helpers ────────────────────────────────────────────────────
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  // deleteTarget = { id, name } for single | { ids, name } for bulk

  const executeSingleDelete = async () => {
    await adminAPI.deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    await fetchUsers();
  };

  const executeBulkDelete = async () => {
    await Promise.all(deleteTarget.ids.map(id => adminAPI.deleteUser(id)));
    setSelectedIds([]);
    setDeleteTarget(null);
    await fetchUsers();
  };

  // ── Helper: display name for role ────────────────────────────────────────
  const getRoleName = (user) => user.role?.name || user.role || '—';
  const getDeptName = (user) => user.department?.name || user.department || '—';
  const getStatus   = (user) => user.status || 'Active';
  const getCreated  = (user) => {
    const d = user.createdAt || user.created;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ── Stats from pagination ─────────────────────────────────────────────────
  const total      = pagination.total  ?? users.length;
  const totalPages = pagination.pages  ?? 1;
  const hasPrev    = pagination.hasPrev ?? currentPage > 1;
  const hasNext    = pagination.hasNext ?? currentPage < totalPages;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  const SkeletonRow = () => (
    <tr className="border-b border-[#F1F5F9] animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#E2E8F0] rounded w-full" />
        </td>
      ))}
    </tr>
  );

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-[#0F172A]">Users</h1>
            <p className="text-[14px] text-[#64748B] mt-1">Manage user accounts, roles, and system access.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowImport(true)}
              className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
            >
              <Upload size={15} />
              Import CSV
            </button>
            <button
              onClick={() => navigate('/admin/users/new')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded text-[13px] font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create User
            </button>
          </div>
        </div>

        {/* User Metrics Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Users',
              value: loading ? null : total,
              sub: null,
              icon: 'group',
              iconColor: 'text-[#2563EB]',
              iconBg: 'bg-[#2563EB]/10',
              topBar: 'bg-[#2563EB]',
            },
            {
              label: 'Active Users',
              value: globalStats.active,
              sub: (globalStats.active != null && total > 0)
                ? `${Math.round((globalStats.active / (globalStats.active + (globalStats.inactive || 0))) * 100)}% of total`
                : null,
              icon: 'how_to_reg',
              iconColor: 'text-[#16A34A]',
              iconBg: 'bg-[#16A34A]/10',
              topBar: 'bg-[#16A34A]',
            },
            {
              label: 'Inactive Users',
              value: globalStats.inactive,
              sub: null,
              icon: 'pending_actions',
              iconColor: 'text-[#D97706]',
              iconBg: 'bg-[#D97706]/10',
              topBar: 'bg-[#D97706]',
            },
            {
              label: 'On This Page',
              value: loading ? null : users.length,
              sub: `Page ${currentPage} of ${totalPages}`,
              icon: 'layers',
              iconColor: 'text-[#475569]',
              iconBg: 'bg-[#F1F5F9]',
              topBar: 'bg-[#475569]',
            },
          ].map(({ label, value, sub, icon, iconColor, iconBg, topBar }) => (
            <div key={label} className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
              <div className={`h-1 ${topBar}`} />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">{label}</span>
                  <span className={`material-symbols-outlined text-[18px] p-1 rounded ${iconColor} ${iconBg}`}>{icon}</span>
                </div>
                <div className="mt-2">
                  {value === null || value === undefined
                    ? <div className="h-7 w-12 bg-[#F1F5F9] rounded animate-pulse" />
                    : <span className="text-[26px] font-bold text-[#0F172A] leading-none">{value}</span>
                  }
                  {sub && value !== null && (
                    <p className="text-[11px] text-[#64748B] mt-1">{sub}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#DC2626] rounded-lg p-3 text-sm text-[#DC2626] font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
            <button onClick={fetchUsers} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-3 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                className="w-full border border-[#E2E8F0] rounded py-1.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-[#2563EB] transition-colors"
                placeholder="Search users..."
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select
              className="border border-[#E2E8F0] text-[#0F172A] px-2 py-1.5 rounded text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-4 border-r border-[#E2E8F0] pr-4">
                <span className="text-[13px] text-[#64748B] font-medium">{selectedIds.length} selected</span>
                <button className="text-[12px] font-medium text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2 py-1 rounded transition-colors">Activate</button>
                <button className="text-[12px] font-medium text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2 py-1 rounded transition-colors">Deactivate</button>
                <button onClick={() => setDeleteTarget({ ids: selectedIds, name: `${selectedIds.length} selected user(s)` })} className="text-[12px] font-medium text-[#DC2626] bg-[#DC2626]/10 hover:bg-[#DC2626]/20 px-2 py-1 rounded transition-colors">Delete</button>
              </div>
            )}
            <button onClick={fetchUsers} className="border border-[#E2E8F0] text-[#0F172A] px-3 py-1.5 rounded text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
            <button className="border border-[#E2E8F0] text-[#0F172A] px-3 py-1.5 rounded text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* Content Area - Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={!loading && users.length > 0 && selectedIds.length === users.length}
                      className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Name</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Employee ID</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Department</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Role</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Status</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Email</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Created Date</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[#64748B] text-sm">
                      <span className="material-symbols-outlined text-[40px] text-[#CBD5E1] block mb-2">group</span>
                      No users found.{searchQuery && ' Try clearing your search.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0 group">
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" checked={selectedIds.includes(user._id)} onChange={() => handleSelect(user._id)} className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold text-[12px]">
                            {(user.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-[14px] font-medium text-[#0F172A]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B] font-mono">{user.employeeId || user._id?.slice(-6)}</td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">{getDeptName(user)}</td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">{getRoleName(user)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          getStatus(user) === 'Active' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#E2E8F0] text-[#64748B]'
                        }`}>
                          {getStatus(user)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">{user.email}</td>
                      <td className="px-4 py-3 text-[13px] text-[#64748B]">{getCreated(user)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/users/${user._id}`)} className="text-[#64748B] hover:text-[#2563EB] transition-colors" title="View Details">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button onClick={() => navigate(`/admin/users/${user._id}/edit`)} className="text-[#64748B] hover:text-[#2563EB] transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: user._id, name: user.name }); }}
                            className="text-[#64748B] hover:text-[#DC2626] transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-white">
            <p className="text-[13px] text-[#64748B]">
              {loading ? (
                'Loading...'
              ) : (
                <>Showing <span className="font-medium text-[#0F172A]">{users.length}</span> of <span className="font-medium text-[#0F172A]">{total}</span> results — Page <span className="font-medium text-[#0F172A]">{currentPage}</span> of <span className="font-medium text-[#0F172A]">{totalPages}</span></>
              )}
            </p>
            <div className="flex gap-1">
              <button
                disabled={!hasPrev}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                disabled={!hasNext}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1 border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        entityName={deleteTarget?.name}
        entityLabel={deleteTarget?.ids ? 'selection' : 'user'}
        onConfirm={deleteTarget?.ids ? executeBulkDelete : executeSingleDelete}
      />

      <BulkImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onComplete={() => {
          setShowImport(false);
          fetchUsers();
          // Refresh global stats after import
          Promise.all([
            adminAPI.getUsers({ status: 'Active', limit: 1 }),
            adminAPI.getUsers({ status: 'Inactive', limit: 1 }),
          ]).then(([aRes, iRes]) => {
            setGlobalStats({
              active:   aRes.data.pagination?.total ?? aRes.data.total ?? 0,
              inactive: iRes.data.pagination?.total ?? iRes.data.total ?? 0,
            });
          }).catch(() => {});
        }}
      />
    </PageWrapper>
  );
}
