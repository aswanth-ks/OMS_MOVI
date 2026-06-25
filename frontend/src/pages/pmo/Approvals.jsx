import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import toast from 'react-hot-toast';
import { pmoAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function PMOApprovals() {
  const { hasPermission } = useAuth();
  const canUpdateTask   = hasPermission('Tasks', 'update');
  const canApproveLeave = hasPermission('Leave', 'approve');
  const [activeTab, setActiveTab] = useState('Tasks'); // 'Tasks' or 'Leave'
  const [taskApprovals, setTaskApprovals] = useState([]);
  const [leaveApprovals, setLeaveApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const [tasksRes, leavesRes] = await Promise.all([
        pmoAPI.getTasksInReview(),
        pmoAPI.getPendingLeaves(),
      ]);
      setTaskApprovals(tasksRes.data.data || []);
      setLeaveApprovals(leavesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleTaskAction = async (id, action) => {
    try {
      await pmoAPI.reviewApproval(id, { action });
      setTaskApprovals(prev => prev.filter(a => a._id !== id));
      if (action === 'approve') {
        toast.success('Task approved successfully!', {
          style: { background: '#10B981', color: '#fff' },
          iconTheme: { primary: '#fff', secondary: '#10B981' }
        });
      } else {
        toast('Changes requested. Task sent back.', {
          icon: '⚠️',
          style: { background: '#F59E0B', color: '#fff' }
        });
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleLeaveAction = async (id, action) => {
    try {
      await pmoAPI.reviewApproval(id, { action });
      setLeaveApprovals(prev => prev.filter(a => a._id !== id));
      if (action === 'approve') {
        toast.success('Leave request approved!', {
          style: { background: '#10B981', color: '#fff' },
          iconTheme: { primary: '#fff', secondary: '#10B981' }
        });
      } else {
        toast('Leave request rejected.', {
          style: { background: '#EF4444', color: '#fff' },
          iconTheme: { primary: '#fff', secondary: '#EF4444' }
        });
      }
    } catch (error) {
      toast.error('Failed to update leave request status');
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
                {!loading && taskApprovals.length > 0 && (
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
                {!loading && leaveApprovals.length > 0 && (
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
          
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
            </div>
          ) : activeTab === 'Tasks' ? (
            taskApprovals.length === 0 ? (
              <EmptyState title="All Caught Up!" subtitle="There are no pending task submissions to review. Your teams are still working hard." icon="task_alt" color="text-[#10B981]" bg="bg-[#ECFDF5]" />
            ) : (
              taskApprovals.map(approval => {
                const name = approval.assignedTo?.name || 'Unknown Assignee';
                const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const pr = approval.priority || 'medium';
                const effort = `${approval.effortPoints || 0} pts`;
                const submittedAtStr = approval.updatedAt ? new Date(approval.updatedAt).toLocaleDateString() : 'recently';
                
                return (
                  <div key={approval._id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row hover:border-[#CBD5E1] transition-colors group">
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{approval._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE]">{approval.project?.name || 'OWMS'}</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> Submitted {submittedAtStr}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-bold text-[#0F172A] mb-2 group-hover:text-[#2563EB] transition-colors">{approval.title}</h3>
                      
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
                        <p className="text-[13px] text-[#475569] leading-relaxed">
                          <span className="font-bold text-[#0F172A] mr-2">Description:</span>{approval.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] bg-blue-100 text-blue-700">{initial}</div>
                          <div>
                            <p className="text-[12px] font-bold text-[#0F172A] leading-tight">{name}</p>
                            <p className="text-[11px] text-[#64748B]">{approval.assignedTo?.designation || 'Team Member'}</p>
                          </div>
                        </div>
                        <div className="h-6 w-px bg-[#E2E8F0]" />
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#64748B]">speed</span>
                          <span className="text-[12px] font-bold text-[#0F172A]">{effort}</span>
                        </div>
                        <div className="h-6 w-px bg-[#E2E8F0]" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#0F172A] uppercase">{pr} Priority</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border-t sm:border-t-0 sm:border-l border-[#E2E8F0] p-6 sm:w-[240px] flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0">
                      <button
                        onClick={() => canUpdateTask && handleTaskAction(approval._id, 'approve')}
                        disabled={!canUpdateTask}
                        title={!canUpdateTask ? 'You do not have permission to approve tasks. Contact your administrator.' : ''}
                        className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${canUpdateTask ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">done_all</span> Approve Task
                      </button>
                      <button
                        onClick={() => canUpdateTask && handleTaskAction(approval._id, 'reject')}
                        disabled={!canUpdateTask}
                        title={!canUpdateTask ? 'You do not have permission to request changes. Contact your administrator.' : ''}
                        className={`w-full py-2.5 bg-white rounded-xl text-[13px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${canUpdateTask ? 'border border-[#F59E0B] text-[#D97706] hover:bg-[#FFFBEB]' : 'border border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">history</span> Request Changes
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            leaveApprovals.length === 0 ? (
              <EmptyState title="No Leave Requests!" subtitle="Your isolated team members are fully present. No leave requests to review." icon="event_available" color="text-[#2563EB]" bg="bg-[#EFF6FF]" />
            ) : (
              leaveApprovals.map(approval => {
                const name = approval.user?.name || 'Unknown User';
                const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const datesStr = `${new Date(approval.fromDate).toLocaleDateString()} - ${new Date(approval.toDate).toLocaleDateString()} (${approval.days} Days)`;
                const requestedAtStr = approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : 'recently';
                const impact = approval.projectImpact || 'No assessed impact';
                
                return (
                  <div key={approval._id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row hover:border-[#CBD5E1] transition-colors group">
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{approval._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[11px] font-bold text-[#0F172A] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{approval.user?.department?.name || 'OWMS'}</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> Requested {requestedAtStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[16px] font-bold text-[#0F172A] group-hover:text-[#EF4444] transition-colors">{approval.type} Leave</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${impact.includes('High') ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>
                          Impact: {impact}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[18px] text-[#64748B]">date_range</span>
                        <span className="text-[13px] font-bold text-[#0F172A]">{datesStr}</span>
                      </div>

                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-4">
                        <p className="text-[13px] text-[#475569] leading-relaxed">
                          <span className="font-bold text-[#0F172A] mr-2">Reason:</span>{approval.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] bg-purple-100 text-purple-700">{initial}</div>
                        <div>
                          <p className="text-[12px] font-bold text-[#0F172A] leading-tight">{name}</p>
                          <p className="text-[11px] text-[#64748B]">{approval.user?.designation || 'Team Member'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border-t sm:border-t-0 sm:border-l border-[#E2E8F0] p-6 sm:w-[240px] flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0">
                      <button
                        onClick={() => canApproveLeave && handleLeaveAction(approval._id, 'approve')}
                        disabled={!canApproveLeave}
                        title={!canApproveLeave ? 'You do not have permission to approve leave. Contact your administrator.' : ''}
                        className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${canApproveLeave ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">thumb_up</span> Approve Leave
                      </button>
                      <button
                        onClick={() => canApproveLeave && handleLeaveAction(approval._id, 'reject')}
                        disabled={!canApproveLeave}
                        title={!canApproveLeave ? 'You do not have permission to deny leave. Contact your administrator.' : ''}
                        className={`w-full py-2.5 bg-white rounded-xl text-[13px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${canApproveLeave ? 'border border-[#EF4444] text-[#DC2626] hover:bg-[#FEF2F2]' : 'border border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">thumb_down</span> Deny Request
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

        </div>

      </div>
    </PageWrapper>
  );
}

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
