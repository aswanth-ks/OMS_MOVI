import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { 
  Users, UserCheck, CalendarOff, Briefcase, AlertCircle,
  ChevronRight, Check, X, MoreVertical, Clock,
  Calendar as CalendarIcon, TrendingUp, TrendingDown, Activity,
  FileText, Award, Zap
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
    ? `${Math.round(((attendanceSummary.present + attendanceSummary.halfDay * 0.5) / totalRecords) * 100)}%`
    : 'N/A';
  const presentTodayCount = attendanceSummary?.present || 0;

  const pendingLeavesCount = leaves.length;

  const STATS = [
    { 
      label: 'Total Workforce', 
      value: totalEmployees, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      detail: `${headcount?.departments?.length || 0} departments`,
      trend_value: 2.5
    },
    { 
      label: 'Attendance Rate', 
      value: attendanceRateStr, 
      icon: UserCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      detail: `${presentTodayCount} present today`,
      trend_value: 1.2
    },
    { 
      label: 'Leave Utilization', 
      value: `${Math.round((attendanceSummary?.leave || 0) / Math.max(totalRecords, 1) * 100)}%`, 
      icon: CalendarOff, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      detail: `${pendingLeavesCount} pending approvals`,
      trend_value: -0.8
    },
    { 
      label: 'Onboarding', 
      value: pendingOnboardingCount, 
      icon: Briefcase, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      detail: 'Employees in progress',
      trend_value: 0.5
    },
    { 
      label: 'Compliance Status', 
      value: '94%', 
      icon: Award, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50', 
      detail: 'On schedule',
      trend_value: 3.1
    },
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
      <div className="font-sans text-[#0F172A] max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════════ HEADER ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">HR Operations Dashboard</h1>
            <p className="text-[13px] text-[#64748B] mt-1">Real-time workforce analytics, compliance tracking, and people management insights.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-lg text-[13px] font-medium shadow-sm">
              <CalendarIcon size={16} className="text-[#64748B]" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button 
              onClick={() => navigate('/hr/employees')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
            >
              Manage Employees
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ PRIMARY METRICS ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATS.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ring-1 ring-[#E2E8F0]`}>
                  <stat.icon size={20} className={stat.color} strokeWidth={1.5} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm ${stat.trend_value >= 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                  {stat.trend_value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{Math.abs(stat.trend_value)}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-[28px] font-bold text-[#0F172A] leading-none tracking-tight">{stat.value}</h3>
                <p className="text-[12px] font-medium text-[#64748B] mt-1">{stat.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-2 border-t border-[#F1F5F9] pt-2">{stat.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════ ALERTS & KEY ACTIONS ═════════════════════════════════════════════════════ */}
        {(pendingLeavesCount > 0 || pendingOnboardingCount > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLeavesCount > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-amber-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-bold text-amber-900">{pendingLeavesCount} Leave Request{pendingLeavesCount > 1 ? 's' : ''} Awaiting Approval</h3>
                  <p className="text-[11px] text-amber-800 mt-0.5">Review and approve/reject pending leave requests to maintain workforce planning accuracy.</p>
                </div>
                <button 
                  onClick={() => navigate('/hr/attendance')}
                  className="text-[12px] font-bold text-amber-700 hover:text-amber-900 underline shrink-0"
                >
                  Review Now
                </button>
              </motion.div>
            )}

            {pendingOnboardingCount > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-bold text-blue-900">{pendingOnboardingCount} Employee{pendingOnboardingCount > 1 ? 's' : ''} Onboarding In Progress</h3>
                  <p className="text-[11px] text-blue-800 mt-0.5">Complete onboarding checklists to ensure new hires are fully integrated and productive.</p>
                </div>
                <button 
                  onClick={() => navigate('/hr/onboarding')}
                  className="text-[12px] font-bold text-blue-700 hover:text-blue-900 underline shrink-0"
                >
                  View Progress
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ MAIN LAYOUT ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* LEFT: ANALYTICS & CHARTS */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* ATTENDANCE & COMPLIANCE ANALYTICS */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
                <div>
                  <h2 className="text-[14px] font-bold text-[#0F172A]">Attendance & Compliance Trends</h2>
                  <p className="text-[11px] text-[#64748B] mt-0.5">30-day rolling window</p>
                </div>
                <button className="text-[12px] font-medium text-[#2563EB] hover:underline">Export Report</button>
              </div>
              
              <div className="p-5 min-h-[280px] bg-[#FAFBFC]">
                {attendanceSummary && (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[{
                      name: 'Month',
                      'Present': attendanceSummary.present,
                      'Half Day': attendanceSummary.halfDay,
                      'Leave': attendanceSummary.leave,
                      'Absent': attendanceSummary.absent
                    }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                        cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                      <Bar dataKey="Present" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Half Day" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Leave" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* DEPARTMENT PERFORMANCE MATRIX */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
                <div>
                  <h2 className="text-[14px] font-bold text-[#0F172A]">Department Headcount & Health</h2>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Active staff allocation across departments</p>
                </div>
                <button 
                  onClick={() => navigate('/hr/employees')}
                  className="text-[12px] font-medium text-[#2563EB] hover:underline"
                >
                  View Directory
                </button>
              </div>
              
              <div className="p-5">
                {DEPT_DATA.length > 0 ? (
                  <div className="space-y-4">
                    {DEPT_DATA.map((dept, i) => (
                      <div key={i} className="p-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg hover:border-[#E2E8F0] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                            <span className="text-[13px] font-bold text-[#0F172A]">{dept.name}</span>
                          </div>
                          <span className="text-[12px] font-bold text-[#0F172A] bg-white px-3 py-1 rounded border border-[#E2E8F0]">{dept.value} Staff</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((dept.value / totalHeadcount) * 100, 100)}%`, backgroundColor: dept.color }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-[#64748B]">
                          <span>{Math.round((dept.value / totalHeadcount) * 100)}% of total</span>
                          <span className="font-medium">Avg. Attendance: 92%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[13px] text-[#64748B]">
                    No department data available. Add employees to populate this view.
                  </div>
                )}
              </div>
            </div>

<<<<<<< HEAD
=======
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

>>>>>>> f28aee497c9e806edad863367e6d187c2031d8a0
          </div>

          {/* RIGHT: CRITICAL ACTIONS & PENDING ITEMS */}
          <div className="space-y-5">
            
            {/* PENDING LEAVE REQUESTS (PRIORITY) */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm flex flex-col h-auto">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-gradient-to-r from-[#F8FAFC] to-white">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#DC2626]" />
                  <h2 className="text-[13px] font-bold text-[#0F172A]">Pending Actions</h2>
                  {leaves.length > 0 && (
                    <span className="bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      {leaves.length}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                {leaves.length > 0 ? (
                  <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {leaves.map((leave, idx) => (
                        <motion.div 
                          key={leave._id}
                          initial={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className={`p-3 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors ${idx !== leaves.length - 1 ? '' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                              {leave.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[12px] font-bold text-[#0F172A] truncate">{leave.user?.name || 'Employee'}</h4>
                              <div className="mt-1 space-y-1">
                                <p className="text-[10px] text-[#64748B]">
                                  <span className="font-semibold text-[#0F172A]">{leave.type}</span> • {leave.days} days
                                </p>
                                <p className="text-[9px] text-[#94A3B8]">
                                  {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 ml-11">
                            <button 
                              onClick={() => handleLeaveAction(leave._id, 'Approved')}
                              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBFBDA] rounded transition-colors py-1.5"
                            >
                              <Check size={12} />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleLeaveAction(leave._id, 'Rejected')}
                              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded transition-colors py-1.5"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center flex-1">
                    <div className="w-12 h-12 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-3">
                      <Check className="text-[#16A34A]" size={24} />
                    </div>
                    <h3 className="text-[13px] font-bold text-[#0F172A]">All Clear</h3>
                    <p className="text-[11px] text-[#64748B] mt-1">No pending leave requests.</p>
                  </div>
                )}
              </div>
            </div>

            {/* KEY METRICS CARDS */}
            <div className="space-y-3">
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-purple-600" />
                  <h3 className="text-[12px] font-bold text-[#0F172A]">Performance Reviews Due</h3>
                </div>
                <p className="text-[24px] font-bold text-[#0F172A]">8</p>
                <p className="text-[10px] text-[#64748B] mt-1">Next review deadline: Jul 15, 2026</p>
                <button className="w-full mt-3 py-2 text-[11px] font-bold text-[#7C3AED] bg-purple-50 hover:bg-purple-100 rounded transition-colors">
                  Schedule Reviews
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-orange-600" />
                  <h3 className="text-[12px] font-bold text-[#0F172A]">Compliance Tasks</h3>
                </div>
                <p className="text-[24px] font-bold text-[#0F172A]">3</p>
                <p className="text-[10px] text-[#64748B] mt-1">Policy updates, certifications, audits</p>
                <button className="w-full mt-3 py-2 text-[11px] font-bold text-[#EA580C] bg-orange-50 hover:bg-orange-100 rounded transition-colors">
                  View Tasks
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}