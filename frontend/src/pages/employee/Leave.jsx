import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Plus, Coffee, Heart, AlertCircle, CalendarDays, ClipboardList, 
  X, Info, UploadCloud, ChevronDown, ChevronUp, Palmtree
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/employee/leave/balance
const mockLeaveBalance = {
  annual: { total: 15, used: 2, remaining: 13 },
  casual: { total: 10, used: 2, remaining: 8 },
  sick: { total: 7, used: 2, remaining: 5 },
  compensatory: { total: 3, used: 0, remaining: 3 }
};

// BACKEND: GET /api/employee/leave/requests
const mockLeaveRequests = [
  { 
    _id: "leave001", type: "Annual", fromDate: "2024-12-20", toDate: "2024-12-31", 
    days: 8, reason: "Family vacation", status: "Pending", 
    reviewedBy: null, appliedAt: "2024-10-12T10:00:00Z" 
  },
  { 
    _id: "leave002", type: "Sick", fromDate: "2024-09-15", toDate: "2024-09-16", 
    days: 2, reason: "Fever and cold", status: "Approved", 
    reviewedBy: { name: "Sarah Johnson" }, appliedAt: "2024-09-14T08:00:00Z" 
  },
  { 
    _id: "leave003", type: "Casual", fromDate: "2024-09-05", toDate: "2024-09-06", 
    days: 2, reason: "Personal work", status: "Rejected", 
    reviewedBy: { name: "Sarah Johnson" }, reviewNote: "Too many team members on leave during this period.", 
    appliedAt: "2024-09-03T09:00:00Z" 
  },
];

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Calculate working days excluding weekends (simple approximation for frontend)
const calculateWorkingDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) return 0;
  
  let days = 0;
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) days++;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

// --- SUB-COMPONENTS ---
const ApplyLeaveModal = ({ isOpen, onClose, hrName, onSubmit }) => {
  const [type, setType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(0);

  useEffect(() => {
    setDays(calculateWorkingDays(fromDate, toDate));
  }, [fromDate, toDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !fromDate || !toDate || !reason || days === 0) return;
    onSubmit({ type, fromDate, toDate, reason, days });
    onClose();
  };

  const getBalance = (leaveType) => {
    if (leaveType === 'Annual') return mockLeaveBalance.annual.remaining;
    if (leaveType === 'Casual') return mockLeaveBalance.casual.remaining;
    if (leaveType === 'Sick') return mockLeaveBalance.sick.remaining;
    if (leaveType === 'Compensatory') return mockLeaveBalance.compensatory.remaining;
    return 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-xl font-bold text-[#0F172A]">Apply for Leave</h2>
            <button onClick={onClose} className="text-[#64748B] hover:bg-[#E2E8F0] p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            
            <label className="block text-sm font-semibold text-[#0F172A] mb-3">Leave Type *</label>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { id: 'Annual', icon: Palmtree, color: 'text-[#16A34A]', activeBg: 'bg-[#DCFCE7]', border: 'border-[#16A34A]' },
                { id: 'Casual', icon: Coffee, color: 'text-[#2563EB]', activeBg: 'bg-[#EFF6FF]', border: 'border-[#2563EB]' },
                { id: 'Sick', icon: Heart, color: 'text-[#DC2626]', activeBg: 'bg-[#FEF2F2]', border: 'border-[#DC2626]' },
                { id: 'Compensatory', icon: CalendarDays, color: 'text-[#D97706]', activeBg: 'bg-[#FFFBEB]', border: 'border-[#D97706]' }
              ].map(opt => {
                const Icon = opt.icon;
                const isActive = type === opt.id;
                return (
                  <button 
                    key={opt.id} type="button" onClick={() => setType(opt.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isActive ? `${opt.activeBg} ${opt.border}` : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}
                  >
                    <Icon size={24} className={isActive ? opt.color : 'text-[#64748B]'} />
                    <span className={`text-[11px] font-bold ${isActive ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{opt.id}</span>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">From Date *</label>
                <input type="date" required value={fromDate} onChange={e=>setFromDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">To Date *</label>
                <input type="date" required value={toDate} onChange={e=>setToDate(e.target.value)} min={fromDate || new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm" />
              </div>
            </div>
            
            <div className="mb-6 h-6 flex items-center">
              {days > 0 && (
                <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">{days} working days</span>
              )}
              {type && days > getBalance(type) && (
                <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded ml-2">
                  Warning: You only have {getBalance(type)} {type} days remaining
                </span>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Reason *</label>
              <textarea 
                required minLength={20} value={reason} onChange={e=>setReason(e.target.value)}
                placeholder="Please describe the reason for your leave..."
                className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] resize-none h-24"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Supporting Document <span className="text-[#64748B] font-normal">(Optional)</span></label>
              <button type="button" className="w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 text-center hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors group">
                <UploadCloud size={20} className="mx-auto text-[#94A3B8] group-hover:text-[#2563EB] mb-2" />
                <p className="text-sm font-bold text-[#0F172A]">Upload medical certificate or supporting document</p>
                <p className="text-xs text-[#64748B] mt-0.5">PDF, JPG, PNG &middot; Max 5MB</p>
              </button>
            </div>

            <div className="flex items-start gap-2 bg-[#F8FAFC] p-3 rounded-lg mb-6">
              <Info size={16} className="text-[#64748B] mt-0.5 shrink-0" />
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your leave request will be reviewed by <strong>{hrName}</strong>. You will be notified once it is approved or rejected.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={!type || days === 0 || reason.length < 20} className="px-5 py-2 text-sm font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Request
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function EmployeeLeave() {
  const [tab, setTab] = useState('Pending'); // 'Pending' or 'History'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [expandedRow, setExpandedRow] = useState(null);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const historyRequests = requests.filter(r => r.status !== 'Pending');

  const handleApplyLeave = (newReq) => {
    const request = {
      _id: `leave${Date.now()}`,
      ...newReq,
      status: "Pending",
      reviewedBy: null,
      appliedAt: new Date().toISOString()
    };
    setRequests([request, ...requests]);
    setTab('Pending');
  };

  const handleCancelRequest = (id) => {
    setRequests(requests.filter(r => r._id !== id));
  };

  const hrName = "Sarah Johnson"; // Mock context

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-10 font-sans px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Leave Management</h1>
            <p className="text-sm text-[#64748B] mt-1">Apply for leave and track your leave history</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm w-fit"
          >
            <Plus size={18} /> Apply for Leave
          </button>
        </div>

        {/* BALANCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#16A34A] shrink-0">
              <Palmtree size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Annual</span>
                <span className="text-xl font-black text-[#0F172A]">{mockLeaveBalance.annual.remaining}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#16A34A]" style={{ width: `${(mockLeaveBalance.annual.used/mockLeaveBalance.annual.total)*100}%` }} />
              </div>
              <p className="text-[9px] font-bold text-[#64748B] text-right">{mockLeaveBalance.annual.used} of {mockLeaveBalance.annual.total} days used</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
              <Coffee size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Casual</span>
                <span className="text-xl font-black text-[#0F172A]">{mockLeaveBalance.casual.remaining}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#2563EB]" style={{ width: `${(mockLeaveBalance.casual.used/mockLeaveBalance.casual.total)*100}%` }} />
              </div>
              <p className="text-[9px] font-bold text-[#64748B] text-right">{mockLeaveBalance.casual.used} of {mockLeaveBalance.casual.total} days used</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#DC2626] shrink-0">
              <Heart size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Sick</span>
                <span className="text-xl font-black text-[#0F172A]">{mockLeaveBalance.sick.remaining}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#DC2626]" style={{ width: `${(mockLeaveBalance.sick.used/mockLeaveBalance.sick.total)*100}%` }} />
              </div>
              <p className="text-[9px] font-bold text-[#64748B] text-right">{mockLeaveBalance.sick.used} of {mockLeaveBalance.sick.total} days used</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-[#D97706] shrink-0">
              <CalendarDays size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Compensatory</span>
                <span className="text-xl font-black text-[#0F172A]">{mockLeaveBalance.compensatory.remaining}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#D97706]" style={{ width: `${(mockLeaveBalance.compensatory.used/mockLeaveBalance.compensatory.total)*100}%` }} />
              </div>
              <p className="text-[9px] font-bold text-[#64748B] text-right">{mockLeaveBalance.compensatory.used} of {mockLeaveBalance.compensatory.total} days used</p>
            </div>
          </div>

        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-[#E2E8F0]">
          <button 
            onClick={() => setTab('Pending')}
            className={`pb-3 text-sm font-bold transition-colors relative ${tab === 'Pending' ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            Leave Requests
            {tab === 'Pending' && <motion.div layoutId="leaveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />}
            <span className="ml-2 bg-[#F1F5F9] text-[#64748B] text-[10px] px-1.5 py-0.5 rounded">{pendingRequests.length}</span>
          </button>
          <button 
            onClick={() => setTab('History')}
            className={`pb-3 text-sm font-bold transition-colors relative ${tab === 'History' ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            Leave History
            {tab === 'History' && <motion.div layoutId="leaveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />}
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[400px]">
          
          {tab === 'Pending' && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                  <ClipboardList size={40} className="text-[#94A3B8] mb-3" />
                  <p className="text-base font-bold text-[#0F172A]">No pending leave requests</p>
                  <p className="text-sm text-[#64748B] mt-1">Apply for leave using the button above</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req._id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded">{req.type}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Pending</span>
                      </div>
                      <span className="text-xs text-[#64748B]">Applied on {formatDate(req.appliedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays size={16} className="text-[#64748B]" />
                      <span className="font-bold text-[#0F172A]">{formatDate(req.fromDate)} &rarr; {formatDate(req.toDate)}</span>
                    </div>
                    <p className="text-sm font-bold text-[#2563EB] mb-3 pl-6">{req.days} working days</p>
                    
                    <p className="text-sm text-[#64748B] italic bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 line-clamp-2">"{req.reason}"</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                      <span className="text-sm text-[#64748B]">Pending review by {hrName}</span>
                      <button 
                        onClick={() => handleCancelRequest(req._id)}
                        className="text-sm font-bold text-[#DC2626] hover:bg-red-50 border border-transparent hover:border-[#DC2626] px-3 py-1.5 rounded-lg transition-all"
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'History' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Type</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Duration</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Days</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Reviewed By</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRequests.length === 0 && (
                      <tr><td colSpan="6" className="px-5 py-10 text-center text-sm text-[#94A3B8]">No leave history found.</td></tr>
                    )}
                    {historyRequests.map(req => (
                      <React.Fragment key={req._id}>
                        <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded">{req.type}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-[#0F172A]">{formatDate(req.fromDate)}</span>
                            {req.fromDate !== req.toDate && <span className="text-sm font-bold text-[#0F172A]"> &rarr; {formatDate(req.toDate)}</span>}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-[#0F172A]">{req.days}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {req.status === 'Approved' && <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded">Approved</span>}
                            {req.status === 'Rejected' && <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">Rejected</span>}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-[#0F172A]">
                            {req.reviewedBy?.name || '--'}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            {req.status === 'Rejected' && req.reviewNote && (
                              <button 
                                onClick={() => setExpandedRow(expandedRow === req._id ? null : req._id)}
                                className="p-1 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
                              >
                                {expandedRow === req._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </td>
                        </tr>
                        {/* Expanded Row for Rejection */}
                        <AnimatePresence>
                          {expandedRow === req._id && req.status === 'Rejected' && (
                            <motion.tr 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-[#FEF2F2] border-b border-[#E2E8F0]"
                            >
                              <td colSpan="6" className="px-5 py-4 overflow-hidden">
                                <div className="flex items-start gap-2">
                                  <AlertCircle size={16} className="text-[#DC2626] mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-xs font-bold text-[#DC2626] uppercase tracking-wider mb-1">Rejection Reason</p>
                                    <p className="text-sm text-[#0F172A]">{req.reviewNote}</p>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      <ApplyLeaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        hrName={hrName}
        onSubmit={handleApplyLeave}
      />
    </PageWrapper>
  );
}
