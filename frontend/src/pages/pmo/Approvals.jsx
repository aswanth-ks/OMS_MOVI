import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import toast from 'react-hot-toast';

// --- MOCK DATA ---
const INITIAL_TASK_APPROVALS = [
  {
    id: 'APP-101',
    taskTitle: 'Setup AWS RDS Instances',
    project: 'Cloud Migration Phase 2',
    description: 'Configured the primary and read-replica RDS instances as per the architecture doc. Security groups are attached.',
    submittedBy: { name: 'Sarah Jenkins', role: 'Backend Engineer', initial: 'S', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]' },
    submittedAt: '2 hours ago',
    effort: '8 pts',
    priority: 'Critical'
  },
  {
    id: 'APP-102',
    taskTitle: 'Design System Figma Handoff',
    project: 'Mobile App Redesign',
    description: 'Finalized the typography and color tokens. Uploaded the assets to the shared drive.',
    submittedBy: { name: 'Alex Wong', role: 'UX Designer', initial: 'A', bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]' },
    submittedAt: '5 hours ago',
    effort: '5 pts',
    priority: 'High'
  }
];

const INITIAL_LEAVE_APPROVALS = [
  {
    id: 'LV-201',
    type: 'Sick Leave',
    project: 'Internal Tools v3.0',
    dates: 'Oct 12 - Oct 14 (3 Days)',
    reason: 'Feeling unwell, need to take a few days off to recover.',
    submittedBy: { name: 'Mike Ross', role: 'Frontend Intern', initial: 'M', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
    submittedAt: 'Yesterday',
    impact: 'Medium (Task Handed Over)'
  },
  {
    id: 'LV-202',
    type: 'Annual Vacation',
    project: 'Cloud Migration Phase 2',
    dates: 'Nov 1 - Nov 10 (10 Days)',
    reason: 'Pre-planned family vacation.',
    submittedBy: { name: 'Sarah Jenkins', role: 'Backend Engineer', initial: 'S', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]' },
    submittedAt: '2 days ago',
    impact: 'High (Milestone Delay Possible)'
  }
];

export default function PMOApprovals() {
  const [activeTab, setActiveTab] = useState('Tasks'); // 'Tasks' or 'Leave'
  const [taskApprovals, setTaskApprovals] = useState(INITIAL_TASK_APPROVALS);
  const [leaveApprovals, setLeaveApprovals] = useState(INITIAL_LEAVE_APPROVALS);

  const handleTaskAction = (id, action) => {
    setTaskApprovals(prev => prev.filter(a => a.id !== id));
    if (action === 'approve') {
      toast.success('Task approved successfully!', { style: { background: '#10B981', color: '#fff' }, iconTheme: { primary: '#fff', secondary: '#10B981' } });
    } else {
      toast('Changes requested. Task sent back.', { icon: '⚠️', style: { background: '#F59E0B', color: '#fff' } });
    }
  };

  const handleLeaveAction = (id, action) => {
    setLeaveApprovals(prev => prev.filter(a => a.id !== id));
    if (action === 'approve') {
      toast.success('Leave request approved!', { style: { background: '#10B981', color: '#fff' }, iconTheme: { primary: '#fff', secondary: '#10B981' } });
    } else {
      toast('Leave request rejected.', { style: { background: '#EF4444', color: '#fff' }, iconTheme: { primary: '#fff', secondary: '#EF4444' } });
    }
  };

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-8 max-w-[1000px] mx-auto pb-12">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-6 border-b border-[#E2E8F0] pb-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A] flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#2563EB] text-[28px]">fact_check</span>
              Team Approvals
            </h1>
            
            <div className="flex gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-lg w-fit">
              <button 
                onClick={() => setActiveTab('Tasks')}
                className={`px-6 py-2 rounded-md text-[13px] font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'Tasks' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                Task Submissions
                {taskApprovals.length > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'Tasks' ? 'bg-[#2563EB] text-white' : 'bg-[#E2E8F0]'}`}>
                    {taskApprovals.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('Leave')}
                className={`px-6 py-2 rounded-md text-[13px] font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'Leave' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">event_busy</span>
                Leave Requests
                {leaveApprovals.length > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'Leave' ? 'bg-[#EF4444] text-white' : 'bg-[#E2E8F0]'}`}>
                    {leaveApprovals.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* ----- TASK APPROVALS ----- */}
          {activeTab === 'Tasks' && (
            taskApprovals.length === 0 ? (
              <EmptyState title="All Caught Up!" subtitle="There are no pending task submissions to review. Your teams are still working hard." icon="task_alt" color="text-[#10B981]" bg="bg-[#ECFDF5]" />
            ) : (
              taskApprovals.map(approval => (
                <div key={approval.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row hover:border-[#CBD5E1] transition-colors group">
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{approval.id}</span>
                        <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">{approval.project}</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> Submitted {approval.submittedAt}
                      </span>
                    </div>

                    <h3 className="text-[16px] font-bold text-[#0F172A] mb-2 group-hover:text-[#2563EB] transition-colors">{approval.taskTitle}</h3>
                    
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
                      <p className="text-[13px] text-[#475569] leading-relaxed">
                        <span className="font-bold text-[#0F172A] mr-2">Submission Notes:</span>{approval.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${approval.submittedBy.bg} ${approval.submittedBy.text}`}>{approval.submittedBy.initial}</div>
                        <div>
                          <p className="text-[12px] font-bold text-[#0F172A] leading-tight">{approval.submittedBy.name}</p>
                          <p className="text-[11px] text-[#64748B]">{approval.submittedBy.role}</p>
                        </div>
                      </div>
                      <div className="h-6 w-px bg-[#E2E8F0]" />
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#64748B]">speed</span>
                        <span className="text-[12px] font-bold text-[#0F172A]">{approval.effort}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border-t sm:border-t-0 sm:border-l border-[#E2E8F0] p-6 sm:w-[240px] flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0">
                    <button onClick={() => handleTaskAction(approval.id, 'approve')} className="w-full py-2.5 bg-[#10B981] text-white rounded-xl text-[13px] font-bold hover:bg-[#059669] transition-colors shadow-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">done_all</span> Approve Task
                    </button>
                    <button onClick={() => handleTaskAction(approval.id, 'reject')} className="w-full py-2.5 bg-white border border-[#F59E0B] text-[#D97706] rounded-xl text-[13px] font-bold hover:bg-[#FFFBEB] transition-colors shadow-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">history</span> Request Changes
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* ----- LEAVE APPROVALS ----- */}
          {activeTab === 'Leave' && (
            leaveApprovals.length === 0 ? (
              <EmptyState title="No Leave Requests!" subtitle="Your isolated team members are fully present. No leave requests to review." icon="event_available" color="text-[#2563EB]" bg="bg-[#EFF6FF]" />
            ) : (
              leaveApprovals.map(approval => (
                <div key={approval.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row hover:border-[#CBD5E1] transition-colors group">
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{approval.id}</span>
                        <span className="text-[11px] font-bold text-[#0F172A] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{approval.project}</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> Requested {approval.submittedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[16px] font-bold text-[#0F172A] group-hover:text-[#EF4444] transition-colors">{approval.type}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${approval.impact.includes('High') ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>
                        Impact: {approval.impact}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[18px] text-[#64748B]">date_range</span>
                      <span className="text-[13px] font-bold text-[#0F172A]">{approval.dates}</span>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
                      <p className="text-[13px] text-[#475569] leading-relaxed">
                        <span className="font-bold text-[#0F172A] mr-2">Reason:</span>{approval.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${approval.submittedBy.bg} ${approval.submittedBy.text}`}>{approval.submittedBy.initial}</div>
                      <div>
                        <p className="text-[12px] font-bold text-[#0F172A] leading-tight">{approval.submittedBy.name}</p>
                        <p className="text-[11px] text-[#64748B]">{approval.submittedBy.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] border-t sm:border-t-0 sm:border-l border-[#E2E8F0] p-6 sm:w-[240px] flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0">
                    <button onClick={() => handleLeaveAction(approval.id, 'approve')} className="w-full py-2.5 bg-[#10B981] text-white rounded-xl text-[13px] font-bold hover:bg-[#059669] transition-colors shadow-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">thumb_up</span> Approve Leave
                    </button>
                    <button onClick={() => handleLeaveAction(approval.id, 'reject')} className="w-full py-2.5 bg-white border border-[#EF4444] text-[#DC2626] rounded-xl text-[13px] font-bold hover:bg-[#FEF2F2] transition-colors shadow-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">thumb_down</span> Deny Request
                    </button>
                  </div>
                </div>
              ))
            )
          )}

        </div>

      </div>
    </PageWrapper>
  );
}

// Helper Component for Empty States
function EmptyState({ title, subtitle, icon, color, bg }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
      <div className={`w-16 h-16 ${bg} ${color} rounded-full flex items-center justify-center mb-4`}>
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-[13px] text-[#64748B] max-w-[300px]">{subtitle}</p>
    </div>
  );
}
