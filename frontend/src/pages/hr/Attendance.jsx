import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, CheckCircle2, XCircle, Clock, 
  Users, Filter, ChevronRight,
  AlertCircle, ChevronLeft, List, Download
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { hrAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function HRAttendance() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [pendingRes, attendanceRes, summaryRes] = await Promise.all([
        hrAPI.getPendingLeaves(),
        hrAPI.getAttendance({ month, year }),
        hrAPI.getAttendanceSummary({ month, year })
      ]);

      setPendingLeaves(pendingRes.data?.data || []);
      setAttendanceData(attendanceRes.data?.data || null);
      setAttendanceSummary(summaryRes.data?.data || null);
    } catch (err) {
      console.error('Error loading attendance data:', err);
      toast.error('Failed to load attendance and leaves data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const handleReviewLeave = async (id, status) => {
    try {
      await hrAPI.reviewLeave(id, { status, reviewNote: `Reviewed by HR` });
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      loadData();
    } catch (err) {
      console.error('Error reviewing leave:', err);
      toast.error(err.response?.data?.message || 'Failed to review leave request');
    }
  };

  const handleExportCSV = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await hrAPI.exportAttendance({ month, year });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Attendance report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
    }
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);
  const startDayOffset = getFirstDayOfMonth(year, month);
  const blanks = Array.from({ length: startDayOffset }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Compute calendar events from live attendance data
  const calendarEvents = useMemo(() => {
    const events = {};
    if (!attendanceData || !attendanceData.employees) return events;

    attendanceData.employees.forEach(emp => {
      emp.records.forEach(rec => {
        const dateObj = new Date(rec.date);
        if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
          const dayNum = dateObj.getDate();
          if (!events[dayNum]) events[dayNum] = [];

          if (rec.status !== 'Present') {
            const color = rec.status === 'Leave' ? 'bg-blue-100 text-blue-700' :
                          rec.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          rec.status === 'Half Day' ? 'bg-amber-100 text-amber-700' :
                          'bg-purple-100 text-purple-700'; // Holiday etc.
            
            events[dayNum].push({
              name: emp.user?.name ? emp.user.name.split(' ')[0] + '.' : 'User',
              type: rec.status,
              color: color
            });
          }
        }
      });
    });
    return events;
  }, [attendanceData, month, year]);

  // Compute who is out today
  const whoIsOutToday = useMemo(() => {
    const outList = [];
    if (!attendanceData || !attendanceData.employees) return outList;

    const todayStr = new Date().toISOString().split('T')[0];
    
    attendanceData.employees.forEach(emp => {
      // Find a record for today
      const todayRec = emp.records.find(r => {
        const dStr = new Date(r.date).toISOString().split('T')[0];
        return dStr === todayStr;
      });

      if (todayRec && (todayRec.status === 'Leave' || todayRec.status === 'Absent')) {
        outList.push({
          name: emp.user?.name || 'Intern/Employee',
          type: todayRec.status === 'Leave' ? 'Approved Leave' : 'Absent',
          avatar: emp.user?.name ? emp.user.name.split(' ').map(n=>n[0]).join('') : 'U'
        });
      }
    });

    return outList;
  }, [attendanceData]);

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Time & Leave Management</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Monitor attendance trends, manage leave balances, and approve time-off requests.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportCSV}
              className="border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download size={16} />
              Export Monthly Report
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              {viewMode === 'list' ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  View Master Calendar
                </>
              ) : (
                <>
                  <List size={18} />
                  View List & Requests
                </>
              )}
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">Total Leaves (Month)</span>
               <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                 <CalendarDays size={18} />
               </div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-[#0F172A] leading-none">{attendanceSummary?.leave || 0}</div>
              <p className="text-[12px] text-[#64748B] mt-2">Approved leaves recorded</p>
            </div>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">On Leave Today</span>
               <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                 <Users size={18} />
               </div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-[#0F172A] leading-none">{whoIsOutToday.filter(u=>u.type==='Approved Leave').length}</div>
              <p className="text-[12px] text-[#64748B] mt-2">Active leaves today</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">Pending Approvals</span>
               <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                 <Clock size={18} />
               </div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-[#0F172A] leading-none">{pendingLeaves.length}</div>
              <div className="flex items-center gap-1 mt-2 text-[12px] font-medium text-purple-600">
                <AlertCircle size={14} /> <span>Requires your action</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">Total Absences (Month)</span>
               <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                 <CalendarDays size={18} />
               </div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-[#0F172A] leading-none">{attendanceSummary?.absent || 0}</div>
              <p className="text-[12px] text-[#64748B] mt-2">Total unpaid absent days</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT SPLIT */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT: CONDITIONAL VIEW (TABLE OR CALENDAR) */}
          <div className="flex-1 bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden flex flex-col">
            
            {loading && (
              <div className="text-center py-12 text-[14px] text-[#64748B]">Loading time and leave records...</div>
            )}

            {!loading && viewMode === 'list' ? (
              <>
                <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                  <h2 className="text-[15px] font-bold text-[#0F172A]">Leave Requests Queue</h2>
                  <button onClick={loadData} className="text-[12px] font-medium text-[#64748B] border border-[#E2E8F0] bg-white px-2.5 py-1.5 rounded flex items-center gap-1.5 hover:bg-[#F1F5F9] transition-colors">
                    <span className="material-symbols-outlined text-[16px]">sync</span> Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-white">
                        <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Employee</th>
                        <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Leave Type</th>
                        <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Dates</th>
                        <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Status</th>
                        <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.length > 0 ? (
                        pendingLeaves.map((req) => (
                          <tr key={req._id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0 group">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold text-[12px] shrink-0">
                                  {req.user?.name ? req.user.name.split(' ').map(n=>n[0]).join('') : 'U'}
                                </div>
                                <div>
                                  <div className="text-[13px] font-medium text-[#0F172A]">{req.user?.name}</div>
                                  <div className="text-[12px] text-[#64748B] mt-0.5">{req.user?.role?.name || 'Staff'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-[13px] font-medium text-[#0F172A]">{req.type}</div>
                              <div className="text-[12px] text-[#64748B] mt-0.5 truncate max-w-[120px]" title={req.reason}>{req.reason || 'No reason provided'}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-[13px] text-[#0F172A]">
                                {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                              </div>
                              <div className="text-[11px] text-[#64748B] mt-0.5">{req.days} Day(s)</div>
                            </td>
                            <td className="px-5 py-3.5">
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F59E0B]/10 text-[#D97706]">
                                 {req.status}
                               </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleReviewLeave(req._id, 'Approved')}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleReviewLeave(req._id, 'Rejected')}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#64748B]">No pending leave requests in queue.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (!loading && (
              // CALENDAR VIEW
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                  <div className="flex items-center gap-4">
                    <h2 className="text-[15px] font-bold text-[#0F172A] w-[140px]">{monthNames[month]} {year}</h2>
                    <div className="flex items-center gap-1">
                      <button onClick={handlePrevMonth} className="p-1 rounded text-[#64748B] hover:bg-[#E2E8F0] transition-colors"><ChevronLeft size={16} /></button>
                      <button onClick={handleNextMonth} className="p-1 rounded text-[#64748B] hover:bg-[#E2E8F0] transition-colors"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-medium">
                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Annual/Casual</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Half Day</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-white">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[12px] font-semibold text-[#64748B] uppercase border-r border-[#E2E8F0] last:border-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(80px,1fr)] bg-[#F8FAFC] gap-[1px]">
                  {blanks.map(blank => (
                    <div key={`blank-${blank}`} className="bg-white min-h-[80px]"></div>
                  ))}
                  {daysInMonth.map(day => (
                    <div key={day} className="bg-white min-h-[80px] p-1.5 flex flex-col gap-1 border-b border-r border-[#E2E8F0]">
                      <span className="text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full text-[#64748B]">
                        {day}
                      </span>
                      {calendarEvents[day]?.map((evt, idx) => (
                        <div key={idx} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${evt.color}`}>
                          {evt.name} ({evt.type})
                        </div>
                      ))}
                    </div>
                  ))}
                  {Array.from({ length: 42 - (blanks.length + daysInMonth.length) }, (_, i) => i).map(blank => (
                    <div key={`end-blank-${blank}`} className="bg-white min-h-[80px] border-b border-r border-[#E2E8F0]"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: WHO IS OUT TODAY */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-5">
              <h2 className="text-[15px] font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <Users size={18} className="text-[#64748B]" /> Who is Out Today
              </h2>
              <div className="space-y-4">
                {whoIsOutToday.length > 0 ? (
                  whoIsOutToday.map((person, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold text-[12px] shrink-0">
                        {person.avatar}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">{person.name}</div>
                        <div className="text-[12px] text-[#64748B] mt-0.5">{person.type}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[12px] text-[#64748B] italic">No employees out today.</div>
                )}
              </div>
              <button 
                onClick={() => setViewMode('calendar')}
                className="w-full mt-5 text-[13px] font-medium text-[#2563EB] hover:underline flex items-center justify-center gap-1"
              >
                View Full Team Calendar <ChevronRight size={14} />
              </button>
            </div>
            
            {/* Quick Actions / Policies Widget */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-sm p-5">
              <h2 className="text-[14px] font-bold text-[#0F172A] mb-3 uppercase tracking-wider">Leave Policies</h2>
              <ul className="space-y-2 text-[13px] text-[#64748B]">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#94A3B8]"></span> Casual Leave: 10 Days</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#94A3B8]"></span> Sick Leave: 7 Days</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#94A3B8]"></span> Annual Leave: 15 Days</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
