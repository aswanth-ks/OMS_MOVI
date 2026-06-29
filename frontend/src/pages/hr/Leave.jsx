import { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import {
  Plus, Coffee, Heart, AlertCircle, CalendarDays, ClipboardList,
  X, ChevronDown, ChevronUp, CheckCircle2, XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hrAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const workingDays = (from, to) => {
  if (!from || !to) return 0;
  let count = 0, cur = new Date(from), end = new Date(to);
  while (cur <= end) { if (cur.getDay() !== 0 && cur.getDay() !== 6) count++; cur.setDate(cur.getDate() + 1); }
  return count;
};

const STATUS_BADGE = {
  Pending:  'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const LEAVE_TYPES = [
  { id: 'Annual',    icon: CalendarDays, color: 'text-green-600',  activeBg: 'bg-green-50',  border: 'border-green-500'  },
  { id: 'Casual',    icon: Coffee,       color: 'text-blue-600',   activeBg: 'bg-blue-50',   border: 'border-blue-500'   },
  { id: 'Sick',      icon: Heart,        color: 'text-red-600',    activeBg: 'bg-red-50',    border: 'border-red-500'    },
  { id: 'Emergency', icon: AlertCircle,  color: 'text-orange-600', activeBg: 'bg-orange-50', border: 'border-orange-500' },
];

const BALANCE_CARDS = [
  { key: 'annual',    label: 'Annual',    icon: CalendarDays, color: 'text-green-600',  bg: 'bg-green-50'  },
  { key: 'casual',    label: 'Casual',    icon: Coffee,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { key: 'sick',      label: 'Sick',      icon: Heart,        color: 'text-red-600',    bg: 'bg-red-50'    },
  { key: 'emergency', label: 'Emergency', icon: AlertCircle,  color: 'text-orange-600', bg: 'bg-orange-50' },
];

const isIntern = (leave) => {
  const slug = leave.user?.role?.slug || '';
  return slug === 'intern' || slug === 'intern-student';
};

function ApplyModal({ onClose, onSubmit, balance, submitting }) {
  const today = new Date().toISOString().split('T')[0];
  const [type,     setType]     = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate,   setToDate]   = useState(today);
  const [reason,   setReason]   = useState('');
  const days = workingDays(fromDate, toDate);
  const bal  = balance?.[type?.toLowerCase()];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">Apply for Leave</h2>
          <button onClick={onClose} className="text-[#64748B] hover:bg-[#E2E8F0] p-1.5 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Leave Type *</label>
            <div className="grid grid-cols-4 gap-2">
              {LEAVE_TYPES.map(opt => {
                const Icon = opt.icon;
                const active = type === opt.id;
                return (
                  <button key={opt.id} type="button" onClick={() => setType(opt.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${active ? `${opt.activeBg} ${opt.border}` : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}>
                    <Icon size={20} className={active ? opt.color : 'text-[#64748B]'} />
                    <span className={`text-[10px] font-bold ${active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{opt.id}</span>
                  </button>
                );
              })}
            </div>
            {bal && (
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Balance: <span className="font-bold text-[#0F172A]">{bal.total - bal.used} days remaining</span> ({bal.used}/{bal.total} used)
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">From *</label>
              <input type="date" value={fromDate} min={today}
                onChange={e => { setFromDate(e.target.value); if (e.target.value > toDate) setToDate(e.target.value); }}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">To *</label>
              <input type="date" value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)}
                className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm" />
            </div>
          </div>
          {days > 0 && (
            <p className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-3 py-1.5 rounded-lg -mt-2">
              {days} working day{days !== 1 ? 's' : ''}
              {bal && days > (bal.total - bal.used) && <span className="ml-2 text-red-600"> · Exceeds your balance!</span>}
            </p>
          )}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Reason *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Describe the reason for your leave…"
              className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg">Cancel</button>
            <button disabled={submitting || !type || days === 0 || !reason.trim()}
              onClick={() => onSubmit({ type, fromDate, toDate, reason })}
              className="px-5 py-2 text-sm font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Submitting…' : 'Submit to PMO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovedTable({ leaves }) {
  if (leaves.length === 0) return (
    <p className="text-center text-sm text-[#64748B] py-8 italic">No approved leaves in the last 60 days.</p>
  );
  return (
    <table className="w-full text-left border-collapse min-w-[560px]">
      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <tr>
          {['Member', 'Type', 'Duration', 'Days', 'Approved By', 'Date'].map(h => (
            <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leaves.map(lv => {
          const initials = (lv.user?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <tr key={lv._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold shrink-0">{initials}</div>
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">{lv.user?.name}</p>
                    <p className="text-[10px] text-[#64748B]">{lv.user?.employeeId || ''}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded uppercase">{lv.type}</span>
              </td>
              <td className="px-4 py-3 text-xs text-[#0F172A] whitespace-nowrap">{fmtShort(lv.fromDate)} → {fmtShort(lv.toDate)}</td>
              <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">{lv.days}</td>
              <td className="px-4 py-3 text-xs text-[#64748B]">{lv.reviewedBy?.name || '—'}</td>
              <td className="px-4 py-3 text-[10px] text-[#64748B]">{fmtDate(lv.reviewedAt)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function HRLeave() {
  const [myRequests,  setMyRequests]  = useState([]);
  const [teamLeaves,  setTeamLeaves]  = useState([]);
  const [balance,     setBalance]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [myTab,       setMyTab]       = useState('Pending');
  const [approvedTab, setApprovedTab] = useState('Employee');
  const [expandedRow, setExpandedRow] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [reviewing,   setReviewing]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, bRes, tRes] = await Promise.all([
        hrAPI.getMyLeaves(),
        hrAPI.getMyLeaveBalance(),
        hrAPI.getLeaves({}),
      ]);
      setMyRequests(mRes.data?.data || []);
      setBalance(bRes.data?.data  || bRes.data);
      setTeamLeaves(tRes.data?.data || tRes.data || []);
    } catch { toast.error('Failed to load leave data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (form) => {
    setSubmitting(true);
    try {
      await hrAPI.applyMyLeave(form);
      toast.success('Leave request submitted to PMO');
      setModal(false);
      setMyTab('Pending');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave');
    } finally { setSubmitting(false); }
  };

  const handleWithdraw = async (id) => {
    setWithdrawing(id);
    try {
      await hrAPI.deleteMyLeave(id);
      toast.success('Leave request withdrawn');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot withdraw leave');
    } finally { setWithdrawing(null); }
  };

  const handleReview = async (id, status) => {
    setReviewing(id);
    try {
      await hrAPI.reviewLeave(id, { status, reviewNote: `Reviewed by HR` });
      toast.success(`Leave ${status === 'Approved' ? 'approved ✓' : 'rejected'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review leave');
    } finally { setReviewing(null); }
  };

  const myPending = myRequests.filter(r => r.status === 'Pending');
  const myHistory = myRequests.filter(r => r.status !== 'Pending');

  // Pending team leaves
  const pendingTeam = teamLeaves.filter(l => l.status === 'Pending');

  // Approved within 60 days
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
  const recentApproved = teamLeaves.filter(l => l.status === 'Approved' && new Date(l.reviewedAt) >= cutoff);
  const approvedEmployees = recentApproved.filter(l => !isIntern(l));
  const approvedInterns   = recentApproved.filter(l =>  isIntern(l));

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1100px] mx-auto pb-10 font-sans px-6 mt-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Leave Management</h1>
            <p className="text-sm text-[#64748B] mt-1">Apply for leave and track your requests</p>
          </div>
          <button onClick={() => setModal(true)}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm w-fit">
            <Plus size={16} /> Apply for Leave
          </button>
        </div>

        {/* My Balance cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BALANCE_CARDS.map(({ key, label, icon: Icon, color, bg }) => {
            const b = balance?.[key] || { total: 0, used: 0 };
            const remaining = b.total - b.used;
            const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
            return (
              <div key={key} className={`${bg} border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-3 shadow-sm`}>
                <Icon size={22} className={`${color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{label}</span>
                    <span className={`text-xl font-black ${color}`}>{loading ? '–' : remaining}</span>
                  </div>
                  <div className="w-full h-1 bg-white/60 rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[9px] text-[#64748B] mt-0.5 text-right">{b.used}/{b.total} used</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TEAM PENDING QUEUE (compact) ─────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0F172A]">Pending Leave Queue</span>
              {pendingTeam.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingTeam.length}</span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined text-[24px] text-[#2563EB] animate-spin">sync</span>
            </div>
          ) : pendingTeam.length === 0 ? (
            <p className="text-center text-sm text-[#64748B] py-6 italic">No pending leave requests.</p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="border-b border-[#E2E8F0]">
                <tr>
                  {['Member', 'Type', 'Duration', 'Days', 'Reason', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingTeam.map(lv => {
                  const initials = (lv.user?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={lv._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-[10px] font-bold shrink-0">{initials}</div>
                          <div>
                            <p className="text-xs font-semibold text-[#0F172A]">{lv.user?.name}</p>
                            <p className="text-[10px] text-[#64748B]">{lv.user?.role?.name || 'Staff'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded uppercase">{lv.type}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[#0F172A] whitespace-nowrap">{fmtShort(lv.fromDate)} → {fmtShort(lv.toDate)}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-[#0F172A]">{lv.days}d</td>
                      <td className="px-4 py-2.5 text-xs text-[#64748B] max-w-[160px] truncate">{lv.reason || '—'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReview(lv._id, 'Approved')}
                            disabled={reviewing === lv._id}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 disabled:opacity-50 transition-colors">
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReview(lv._id, 'Rejected')}
                            disabled={reviewing === lv._id}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 disabled:opacity-50 transition-colors">
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── APPROVED LEAVES (last 60 days) ──────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0F172A]">Approved Leaves</span>
              <span className="text-[10px] text-[#64748B] font-medium">· last 60 days</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{recentApproved.length}</span>
            </div>
            {/* Employee / Intern tabs */}
            <div className="flex gap-1">
              {[['Employee', approvedEmployees.length], ['Intern', approvedInterns.length]].map(([label, count]) => (
                <button key={label} onClick={() => setApprovedTab(label)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all ${
                    approvedTab === label ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}>
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <ApprovedTable leaves={approvedTab === 'Employee' ? approvedEmployees : approvedInterns} />
          </div>
        </div>

        {/* ── MY LEAVE section ─────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-[#0F172A] mb-3">My Leave Applications</h2>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-[#E2E8F0] mb-4">
            {[['Pending', `Pending (${myPending.length})`], ['History', 'History']].map(([id, label]) => (
              <button key={id} onClick={() => setMyTab(id)}
                className={`pb-3 text-sm font-bold transition-colors relative ${myTab === id ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
                {label}
                {myTab === id && <motion.div layoutId="hrMyTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="material-symbols-outlined text-[28px] text-[#2563EB] animate-spin">sync</span>
            </div>
          ) : (
            <>
              {myTab === 'Pending' && (
                <div className="space-y-3">
                  {myPending.length === 0 ? (
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center shadow-sm">
                      <ClipboardList size={32} className="text-[#94A3B8] mb-2" />
                      <p className="text-sm font-bold text-[#0F172A]">No pending requests</p>
                      <p className="text-xs text-[#64748B] mt-1">Click "Apply for Leave" above to submit</p>
                    </div>
                  ) : myPending.map(req => (
                    <div key={req._id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded uppercase">{req.type}</span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Pending PMO Approval</span>
                        </div>
                        <span className="text-xs text-[#64748B]">Applied {fmtDate(req.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#64748B]" />
                        <span className="font-bold text-[#0F172A] text-sm">{fmtDate(req.fromDate)} → {fmtDate(req.toDate)}</span>
                        <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded">{req.days} day{req.days !== 1 ? 's' : ''}</span>
                      </div>
                      {req.reason && <p className="text-xs text-[#64748B] italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-2">"{req.reason}"</p>}
                      <div className="flex justify-end mt-3 pt-3 border-t border-[#E2E8F0]">
                        <button onClick={() => handleWithdraw(req._id)} disabled={withdrawing === req._id}
                          className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-all disabled:opacity-50">
                          {withdrawing === req._id ? 'Withdrawing…' : 'Withdraw Request'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {myTab === 'History' && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
                  {myHistory.length === 0 ? (
                    <p className="text-center text-sm text-[#64748B] py-10">No leave history yet.</p>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[580px]">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          {['Type', 'Duration', 'Days', 'Status', 'Reviewed By', ''].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {myHistory.map(req => (
                          <>
                            <tr key={req._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                              <td className="px-4 py-3"><span className="text-[10px] font-bold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded uppercase">{req.type}</span></td>
                              <td className="px-4 py-3 text-xs font-medium text-[#0F172A] whitespace-nowrap">{fmtDate(req.fromDate)} → {fmtDate(req.toDate)}</td>
                              <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">{req.days}</td>
                              <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${STATUS_BADGE[req.status] || ''}`}>{req.status}</span></td>
                              <td className="px-4 py-3 text-xs text-[#64748B]">{req.reviewedBy?.name || '—'}</td>
                              <td className="px-4 py-3 text-right">
                                {req.status === 'Rejected' && req.reviewNote && (
                                  <button onClick={() => setExpandedRow(expandedRow === req._id ? null : req._id)}
                                    className="p-1 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B]">
                                    {expandedRow === req._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                )}
                              </td>
                            </tr>
                            <AnimatePresence>
                              {expandedRow === req._id && (
                                <motion.tr key={`exp-${req._id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  className="bg-red-50 border-b border-[#E2E8F0]">
                                  <td colSpan={6} className="px-4 py-3">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-0.5">Rejection Reason</p>
                                        <p className="text-xs text-[#0F172A]">{req.reviewNote}</p>
                                      </div>
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <ApplyModal onClose={() => setModal(false)} onSubmit={handleApply} balance={balance} submitting={submitting} />
      )}
    </PageWrapper>
  );
}
