import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  Users, UserCheck, CalendarOff, Briefcase, 
  ChevronRight, Check, X, MoreVertical, 
  Calendar as CalendarIcon, TrendingUp
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import AccessDenied from '../../components/shared/AccessDenied';
import { hrAPI, notificationAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function HRDashboard() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canApproveLeave = hasPermission('Leave', 'approve');
  const [loading, setLoading] = useState(true);
  const [headcount, setHeadcount] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingOnboardingCount, setPendingOnboardingCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      // Fetch headcount report (total employees, active/inactive per department)
      const headcountRes = await hrAPI.getHeadcountReport();
      setHeadcount(headcountRes.data.data);

      // Fetch attendance summary for current month
      const attendanceSummaryRes = await hrAPI.getAttendanceSummary();
      setAttendanceSummary(attendanceSummaryRes.data.data);

      // Fetch pending leaves
      const leavesRes = await hrAPI.getPendingLeaves();
      setLeaves(leavesRes.data.data || []);

      // Fetch notifications for the activity timeline
      const notificationsRes = await notificationAPI.getNotifications();
      setNotifications(notificationsRes.data.data?.notifications || []);

      // Fetch pending onboarding checklists count
      try {
        const onboardingRes = await hrAPI.getPendingOnboarding();
        setPendingOnboardingCount(onboardingRes.data.data?.length || 0);
      } catch (onboardErr) {
        console.warn('Could not load onboarding requests', onboardErr);
      }

    } catch (err) {
      console.error('Failed to load HR dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLeaveAction = async (id, status) => {
    try {
      await hrAPI.reviewLeave(id, { status });
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      setLeaves(prev => prev.filter(l => l._id !== id));
      
      // Refresh stats
      const headcountRes = await hrAPI.getHeadcountReport();
      setHeadcount(headcountRes.data.data);
      const attendanceSummaryRes = await hrAPI.getAttendanceSummary();
      setAttendanceSummary(attendanceSummaryRes.data.data);
    } catch (err) {
      console.error("Error reviewing leave:", err);
      toast.error(err.response?.data?.message || "Failed to update leave status");
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
          <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
        </div>
      </PageWrapper>
    );
  }

  // Calculate stats dynamically
  const totalEmployees = headcount?.departments?.reduce((acc, curr) => acc + curr.total, 0) || 0;
  
  const totalRecords = attendanceSummary 
    ? (attendanceSummary.present + attendanceSummary.absent + attendanceSummary.leave + attendanceSummary.halfDay)
    : 0;
  const attendanceRateStr = totalRecords > 0 
    ? `${Math.round(((attendanceSummary.present + attendanceSummary.halfDay * 0.5) / totalRecords) * 100)}% attendance`
    : 'No data';
  const presentTodayCount = attendanceSummary?.present || 0;

  const pendingLeavesCount = leaves.length;

  const STATS = [
    { label: 'Total Employees', value: totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: `${headcount?.departments?.length || 0} departments` },
    { label: 'Present Today (Month Total)', value: presentTodayCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: attendanceRateStr },
    { label: 'Leaves Pending Approval', value: pendingLeavesCount, icon: CalendarOff, color: 'text-amber-600', bg: 'bg-amber-50', trend: `${pendingLeavesCount} pending approval` },
    { label: 'Pending Onboarding', value: pendingOnboardingCount, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Requires attention' },
  ];

  // Pie chart department data
  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#64748B', '#EC4899', '#30B0C7', '#F43F5E'];
  const DEPT_DATA = (headcount?.departments || []).map((dept, index) => ({
    name: dept.name,
    value: dept.total,
    color: COLORS[index % COLORS.length]
  }));

  const totalHeadcount = DEPT_DATA.reduce((acc, curr) => acc + curr.value, 0);

  const formatActivityTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'leave_approved': return 'bg-emerald-500';
      case 'leave_rejected': return 'bg-rose-500';
      case 'system_alert': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] max-w-[1440px] mx-auto p-6 space-y-5">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A]">HR Dashboard</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">Overview of people operations, attendance, and pending actions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-md text-[13px] font-medium shadow-sm">
              <CalendarIcon size={14} className="text-[#64748B]" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button 
              onClick={() => navigate('/hr/employees')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors shadow-sm"
            >
              Employees Directory
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded-sm">
                  <TrendingUp size={10} />
                  <span>Active</span>
                </div>
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#0F172A] leading-none tracking-tight">{stat.value}</h3>
                <p className="text-[12px] font-medium text-[#64748B] mt-1">{stat.label}</p>
                <p className="text-[11px] text-[#94A3B8] mt-2 border-t border-[#F1F5F9] pt-1.5">{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* LEFT COLUMN - 66% */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* DEPARTMENT HEADCOUNT (Compact) */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm flex flex-col h-[300px]">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
                <h2 className="text-[14px] font-bold text-[#0F172A]">Department Headcount</h2>
                <button 
                  onClick={() => navigate('/hr/employees')}
                  className="text-[12px] font-medium text-[#2563EB] hover:underline"
                >
                  View Directory
                </button>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row items-center p-5 gap-5 min-h-0">
                {/* Donut Chart */}
                {totalHeadcount > 0 ? (
                  <>
                    <div className="w-full md:w-1/2 h-full relative min-h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={DEPT_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={3}
                          >
                            {DEPT_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => [`${value} Employees`, 'Headcount']}
                            contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '6px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Custom Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[24px] font-bold text-[#0F172A] leading-none">{totalHeadcount}</span>
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-widest mt-1">Total</span>
                      </div>
                    </div>

                    {/* Custom Legend / Progress Bars */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3 overflow-y-auto max-h-full pr-1 custom-scrollbar">
                      {DEPT_DATA.map((dept, i) => (
                        <div key={i} className="w-full">
                          <div className="flex justify-between text-[12px] mb-1">
                            <span className="font-medium text-[#0F172A] flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: dept.color }}></span>
                              <span className="truncate">{dept.name}</span>
                            </span>
                            <span className="font-semibold text-[#64748B] shrink-0">{dept.value}</span>
                          </div>
                          <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${(dept.value / totalHeadcount) * 100}%`, backgroundColor: dept.color }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[13px] text-[#64748B]">
                    No headcount data found. Add employees to populate.
                  </div>
                )}
              </div>
            </div>

            {/* PENDING LEAVES */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[14px] font-bold text-[#0F172A]">Leave Approvals</h2>
                  {leaves.length > 0 && (
                    <span className="bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      {leaves.length} Pending
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/hr/attendance')}
                  className="text-[12px] font-medium text-[#64748B] hover:text-[#0F172A]"
                >
                  View Calendar
                </button>
              </div>
              
              <div className="p-0">
                <AnimatePresence>
                  {leaves.length > 0 ? (
                    <div className="flex flex-col">
                      {leaves.map((leave, idx) => (
                        <motion.div 
                          key={leave._id}
                          initial={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className={`p-3.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${idx !== leaves.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-[#E2E8F0] flex items-center justify-center text-[13px] font-bold text-[#0F172A] shrink-0">
                              {leave.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-[13px] font-bold text-[#0F172A] truncate">{leave.user?.name || 'Employee'}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="bg-[#F1F5F9] text-[#475569] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                  {leave.type}
                                </span>
                                <span className="text-[11px] font-medium text-[#64748B] truncate">
                                  {leave.days} days ({new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()})
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0 ml-4">
                            <button
                              onClick={() => canApproveLeave && handleLeaveAction(leave._id, 'Approved')}
                              disabled={!canApproveLeave}
                              title={canApproveLeave ? 'Approve' : 'You do not have permission to approve leave. Contact your administrator.'}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${canApproveLeave ? 'text-[#16A34A] border-[#E2E8F0] hover:bg-[#DCFCE7] hover:border-[#16A34A]' : 'text-[#CBD5E1] border-[#E2E8F0] cursor-not-allowed'}`}
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => canApproveLeave && handleLeaveAction(leave._id, 'Rejected')}
                              disabled={!canApproveLeave}
                              title={canApproveLeave ? 'Reject' : 'You do not have permission to reject leave. Contact your administrator.'}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${canApproveLeave ? 'text-[#DC2626] border-[#E2E8F0] hover:bg-[#FEF2F2] hover:border-[#DC2626]' : 'text-[#CBD5E1] border-[#E2E8F0] cursor-not-allowed'}`}
                            >
                              <X size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                        <Check className="text-[#10B981]" size={24} />
                      </div>
                      <h3 className="text-[14px] font-bold text-[#0F172A]">All Caught Up</h3>
                      <p className="text-[12px] text-[#64748B] mt-1">No pending leave requests.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - 33% */}
          <div className="space-y-5">
            
            {/* ACTIVITY TIMELINE (Compact) */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm h-full max-h-[700px] flex flex-col">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
                <h2 className="text-[14px] font-bold text-[#0F172A]">Activity Timeline</h2>
                <button className="p-1 hover:bg-[#F1F5F9] rounded text-[#64748B] transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar relative">
                {notifications.length > 0 ? (
                  <>
                    {/* Continuous Vertical Line */}
                    <div className="absolute left-[30px] top-6 bottom-6 w-px bg-[#E2E8F0]"></div>
                    
                    <div className="space-y-6">
                      {notifications.slice(0, 8).map((activity) => (
                        <div key={activity._id} className="flex relative z-10">
                          <div className="mr-4 flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${getActivityColor(activity.type)} ring-4 ring-white shadow-sm mt-1.5`}></div>
                          </div>
                          <div className="flex-1 bg-[#F8FAFC] border border-[#F1F5F9] p-3 rounded-md hover:border-[#E2E8F0] transition-colors cursor-default">
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className="text-[12px] font-bold text-[#0F172A] leading-snug">{activity.title}</h4>
                              <span className="text-[9px] font-semibold text-[#64748B] whitespace-nowrap ml-2">
                                {formatActivityTime(activity.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B]">
                              {activity.message}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => navigate('/hr/communication')} 
                        className="w-full py-2.5 mt-2 text-[12px] font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center gap-1.5"
                      >
                        View Communications
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-[12px] text-[#64748B]">
                    No recent activities recorded.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}