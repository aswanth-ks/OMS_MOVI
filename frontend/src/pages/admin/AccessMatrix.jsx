import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Save, AlertCircle, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { adminAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/shared/AccessDenied';

// ── Role badge colour pool (cycles if more roles than colours) ────────────
const ROLE_COLOURS = [
  'bg-red-100 text-red-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-gray-100 text-gray-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
];

export default function AdminAccessMatrix() {
  const navigate = useNavigate();
  const { hasPermission: authHasPermission } = useAuth();
  const canManageMatrix = authHasPermission('Roles', 'manage');

  // ── State ─────────────────────────────────────────────────────────────────
  const [roles,       setRoles]       = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix,      setMatrix]      = useState({});      // { roleId: [permissionId, ...] }
  const [originalMatrix, setOriginalMatrix] = useState({});
  const [isDirty,     setIsDirty]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [showToast,   setShowToast]   = useState(false);
  const [toastMsg,    setToastMsg]    = useState('');
  const [toastType,   setToastType]   = useState('success'); // 'success' | 'error'
  const [loadError,   setLoadError]   = useState('');

  // ── Load access matrix from backend ──────────────────────────────────────
  const fetchMatrix = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await adminAPI.getAccessMatrix();
      const { roles: r, permissions: p, matrix: m } = response.data.data;
      setRoles(r || []);
      setPermissions(p || []);
      setMatrix(m || {});
      setOriginalMatrix(JSON.parse(JSON.stringify(m || {})));
    } catch (err) {
      console.error('Failed to load access matrix', err);
      setLoadError(err.response?.data?.message || 'Failed to load access matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatrix(); }, []);

  // ── Toggle a permission for a role ────────────────────────────────────────
  const handleToggle = (roleId, permissionId) => {
    const role = roles.find(r => r._id === roleId);
    // Backend uses isSystem for system-locked roles; super-admin is always locked
    if (role?.slug === 'super-admin') return;

    setMatrix(prev => {
      const rolePerms = prev[roleId] || [];
      const updated = rolePerms.includes(permissionId)
        ? rolePerms.filter(id => id !== permissionId)
        : [...rolePerms, permissionId];
      return { ...prev, [roleId]: updated };
    });
    setIsDirty(true);
  };

  const showNotification = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── CRITICAL FIX: Save actually calls the backend now ─────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.saveAccessMatrix(matrix);
      setOriginalMatrix(JSON.parse(JSON.stringify(matrix)));
      setIsDirty(false);
      showNotification('Access Matrix saved successfully', 'success');
    } catch (err) {
      console.error('Failed to save access matrix', err);
      showNotification(
        err.response?.data?.message || 'Failed to save. Please try again.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setMatrix(JSON.parse(JSON.stringify(originalMatrix)));
    setIsDirty(false);
  };

  // ── Group permissions by resource ─────────────────────────────────────────
  const resourceGroups = permissions.reduce((acc, perm) => {
    const resource = perm.resource || 'Other';
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(perm);
    return acc;
  }, {});
  const resourceNames = Object.keys(resourceGroups);

  // ── Check if a role has a permission ─────────────────────────────────────
  const hasPermission = (roleId, permId) => {
    const rolePerms = matrix[roleId] || [];
    return rolePerms.includes(permId);
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper>
        <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="h-6 bg-[#E2E8F0] rounded w-48 mb-2 animate-pulse" />
              <div className="h-4 bg-[#E2E8F0] rounded w-72 animate-pulse" />
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-[#64748B]">
              <svg className="animate-spin h-8 w-8 text-[#2563EB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium">Loading access matrix...</p>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Load Error ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <PageWrapper>
        <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 pb-20">
          <h1 className="text-2xl font-semibold tracking-tight">Access Matrix</h1>
          <div className="bg-[#FEF2F2] border border-[#DC2626] rounded-lg p-4 text-sm text-[#DC2626] font-medium flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{loadError}</span>
            <button onClick={fetchMatrix} className="ml-auto text-xs underline">Retry</button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!canManageMatrix) return <PageWrapper><AccessDenied message="You don't have permission to manage the Access Matrix." /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 pb-20 relative">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-sm text-[#64748B] mb-1.5">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span>Access Control</span>
              <ChevronRight size={14} />
              <span className="text-[#0F172A] font-medium">Access Matrix</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Access Matrix</h1>
            <p className="text-sm text-[#64748B] mt-1">Manage which roles can Create, Read, Update, and Delete across every module in OWMS</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
              <Download size={16} />
              Export Matrix
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving || !canManageMatrix}
              title={!canManageMatrix ? 'You do not have permission to save matrix changes.' : ''}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-white ${
                isDirty && !saving && canManageMatrix ? 'bg-[#2563EB] hover:bg-blue-700' : 'bg-[#94A3B8] cursor-not-allowed'
              }`}
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
              {isDirty && !saving && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex-1 flex flex-col relative overflow-hidden">
          <div className="overflow-x-auto w-full custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                {/* Resource group headers */}
                <tr className="bg-[#F8FAFC]">
                  <th className="sticky left-0 top-0 z-30 bg-[#F8FAFC] border-b border-r border-[#E2E8F0] min-w-[180px] max-w-[180px] p-0" />
                  {resourceNames.map((resName, i) => (
                    <th
                      key={resName}
                      colSpan={resourceGroups[resName].length}
                      className={`px-4 py-2 text-center font-semibold text-[#0F172A] text-xs uppercase tracking-wider border-b border-[#E2E8F0] bg-[#F1F5F9] ${
                        i !== resourceNames.length - 1 ? 'border-r' : ''
                      }`}
                    >
                      {resName}
                    </th>
                  ))}
                </tr>
                {/* Action-level headers */}
                <tr className="bg-white">
                  <th className="sticky left-0 top-0 z-30 bg-[#F8FAFC] px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-r border-[#E2E8F0] min-w-[180px] max-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Role Name
                  </th>
                  {resourceNames.map((resName, resIdx) =>
                    resourceGroups[resName].map((perm, permIdx) => (
                      <th
                        key={perm._id}
                        className={`w-[52px] min-w-[52px] text-center text-xs font-medium text-[#64748B] px-1 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] ${
                          permIdx === resourceGroups[resName].length - 1 && resIdx !== resourceNames.length - 1
                            ? 'border-r'
                            : ''
                        }`}
                        title={perm.name}
                      >
                        {perm.action?.charAt(0).toUpperCase() + perm.action?.slice(1) || perm.name}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, roleIdx) => {
                  const isLocked = role.slug === 'super-admin';
                  const colour = ROLE_COLOURS[roleIdx % ROLE_COLOURS.length];

                  return (
                    <tr
                      key={role._id}
                      className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0 group"
                    >
                      {/* Sticky Role Name Column */}
                      <td className="sticky left-0 z-20 bg-white min-w-[180px] max-w-[180px] px-4 py-3 border-r border-[#E2E8F0] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-[#F8FAFC]">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${colour}`}>
                            {role.name}
                          </span>
                          {isLocked && <Lock size={14} className="text-[#64748B] ml-1" />}
                        </div>
                      </td>

                      {/* Permission Checkbox Cells */}
                      {resourceNames.map((resName, resIdx) =>
                        resourceGroups[resName].map((perm, permIdx) => {
                          const checked = hasPermission(role._id, perm._id);
                          const isLastInGroup =
                            permIdx === resourceGroups[resName].length - 1 &&
                            resIdx !== resourceNames.length - 1;

                          return (
                            <td
                              key={`${role._id}-${perm._id}`}
                              className={`w-[52px] min-w-[52px] text-center px-1 py-3 ${isLastInGroup ? 'border-r border-[#E2E8F0]' : ''}`}
                            >
                              {isLocked ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-sm bg-[#E2E8F0] border border-[#CBD5E1] flex items-center justify-center cursor-not-allowed">
                                    <Lock size={11} className="text-[#94A3B8]" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <div
                                    onClick={() => canManageMatrix && handleToggle(role._id, perm._id)}
                                    className={`flex items-center justify-center w-5 h-5 rounded-sm border transition-colors ${canManageMatrix ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                                      ${checked
                                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                        : 'bg-white border-[#CBD5E1] text-transparent hover:border-[#94A3B8]'
                                      }`}
                                  >
                                    <CheckCircle size={14} className={checked ? 'text-white' : 'text-transparent'} />
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })}

                {roles.length === 0 && (
                  <tr>
                    <td
                      colSpan={1 + permissions.length}
                      className="px-4 py-12 text-center text-[#64748B] text-sm"
                    >
                      No roles or permissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E293B] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:pl-72"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="text-[#F59E0B]" size={20} />
                <p className="text-sm font-medium">You have unsaved changes to the Access Matrix</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDiscard}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium border border-[#64748B] text-white hover:bg-[#334155] transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !canManageMatrix}
                  className="flex-1 sm:flex-none bg-[#2563EB] hover:bg-blue-600 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-50 ${
                toastType === 'success' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              } text-white rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg`}
            >
              {toastType === 'success'
                ? <CheckCircle size={18} />
                : <AlertCircle size={18} />
              }
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}
