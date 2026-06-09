import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { ChevronLeft, ChevronRight, Check, X, Calendar, AlertTriangle, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/employee/attendance?month=10&year=2024
const mockAttendance = {
  month: "October",
  year: 2024,
  records: [
    { date: "2024-10-01", status: "Present", checkIn: "09:10 AM", checkOut: "06:25 PM", hoursWorked: 9.25 },
    { date: "2024-10-02", status: "Present", checkIn: "09:05 AM", checkOut: "06:30 PM", hoursWorked: 9.42 },
    { date: "2024-10-03", status: "Present", checkIn: "09:15 AM", checkOut: "06:15 PM", hoursWorked: 9.00 },
    { date: "2024-10-04", status: "Present", checkIn: "08:50 AM", checkOut: "06:00 PM", hoursWorked: 9.16 },
    { date: "2024-10-05", status: "Absent", checkIn: null, checkOut: null, hoursWorked: 0 }, // Saturday (mark as absent for demo)
    { date: "2024-10-06", status: "Weekend", checkIn: null, checkOut: null, hoursWorked: 0 },
    { date: "2024-10-07", status: "Leave", checkIn: null, checkOut: null, hoursWorked: 0 },
    { date: "2024-10-08", status: "Leave", checkIn: null, checkOut: null, hoursWorked: 0 },
    { date: "2024-10-09", status: "Present", checkIn: "09:20 AM", checkOut: "06:30 PM", hoursWorked: 9.16 },
    { date: "2024-10-10", status: "Half-Day", checkIn: "09:00 AM", checkOut: "01:00 PM", hoursWorked: 4.00 },
    { date: "2024-10-11", status: "Holiday", checkIn: null, checkOut: null, hoursWorked: 0 }, // Public Holiday
    { date: "2024-10-12", status: "Present", checkIn: "09:00 AM", checkOut: null, hoursWorked: null }, // Today (In Progress)
  ]
};

// Map day of week for the first day (Oct 1 2024 is a Tuesday, 0=Sun, 2=Tue)
const START_DAY_OFFSET = 2; 
const DAYS_IN_MONTH = 31;
const TODAY_DATE = "2024-10-12";

const STATS = {
  present: 6,
  absent: 1,
  leave: 2,
  holiday: 1,
  halfDay: 1,
  totalWorkingDays: 22,
  attendancePercentage: 85
};

const getAttendanceColor = (percentage) => {
  if (percentage >= 90) return 'text-[#16A34A]';
  if (percentage >= 75) return 'text-[#D97706]';
  return 'text-[#DC2626]';
};

export default function EmployeeAttendance() {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Generate calendar grid array
  const calendarCells = [];
  // Empty cells for offset
  for (let i = 0; i < START_DAY_OFFSET; i++) {
    calendarCells.push(null);
  }
  // Day cells
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const dateStr = `2024-10-${String(d).padStart(2, '0')}`;
    const record = mockAttendance.records.find(r => r.date === dateStr);
    
    // Auto-detect future and weekend if no record
    let status = "Future";
    if (record) {
      status = record.status;
    } else {
      const dayOfWeek = (START_DAY_OFFSET + d - 1) % 7;
      if (dayOfWeek === 0 || dayOfWeek === 6) status = "Weekend";
    }

    calendarCells.push({ day: d, date: dateStr, status, data: record });
  }

  // Calculate widths for the bar chart
  const totalTracked = STATS.present + STATS.absent + STATS.leave + STATS.holiday + STATS.halfDay;
  
  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-10 font-sans px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Attendance</h1>
            <p className="text-sm text-[#64748B] mt-1">Your attendance record for this month</p>
          </div>
          <div className="flex items-center gap-4 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-sm">
            <button className="p-1 hover:bg-[#F1F5F9] rounded transition-colors text-[#64748B]"><ChevronLeft size={20} /></button>
            <span className="text-sm font-bold text-[#0F172A] min-w-[100px] text-center">
              {mockAttendance.month} {mockAttendance.year}
            </span>
            <button className="p-1 hover:bg-[#F1F5F9] rounded transition-colors text-[#64748B]"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* SUMMARY STATS ROW */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-4 shadow-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Present</span>
            <span className="text-2xl font-bold text-[#16A34A]">{STATS.present}</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block"></div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Absent</span>
            <span className="text-2xl font-bold text-[#DC2626]">{STATS.absent}</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block"></div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Leave</span>
            <span className="text-2xl font-bold text-[#2563EB]">{STATS.leave}</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block"></div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Holidays</span>
            <span className="text-2xl font-bold text-[#64748B]">{STATS.holiday}</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8F0] hidden md:block"></div>
          
          <div className="flex items-baseline gap-2 ml-auto">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Attendance %</span>
            <span className={`text-3xl font-black ${getAttendanceColor(STATS.attendancePercentage)}`}>{STATS.attendancePercentage}%</span>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-bold text-[#64748B] text-center uppercase tracking-widest pb-2">
                {day}
              </div>
            ))}
            
            {/* Calendar Cells */}
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="min-h-[80px]" />;
              }

              let bgClass = "bg-[#F8FAFC] border-[#E2E8F0]";
              let numClass = "text-[#94A3B8]";
              let content = null;
              
              switch (cell.status) {
                case 'Present':
                  bgClass = "bg-[#DCFCE7] border-[#16A34A]";
                  numClass = "text-[#16A34A] font-bold";
                  content = (
                    <>
                      <div className="text-[10px] sm:text-xs font-bold text-[#16A34A] mt-1 flex items-center justify-center gap-1"><Check size={12} /> Present</div>
                      {cell.data?.checkIn && <div className="text-[9px] sm:text-[10px] text-[#16A34A]/80 font-medium mt-0.5">{cell.data.checkIn}</div>}
                    </>
                  );
                  break;
                case 'Absent':
                  bgClass = "bg-[#FEE2E2] border-[#DC2626]";
                  numClass = "text-[#DC2626] font-bold";
                  content = <div className="text-[10px] sm:text-xs font-bold text-[#DC2626] mt-1 flex items-center justify-center gap-1"><X size={12} /> Absent</div>;
                  break;
                case 'Leave':
                  bgClass = "bg-[#DBEAFE] border-[#2563EB]";
                  numClass = "text-[#2563EB] font-bold";
                  content = <div className="text-[10px] sm:text-xs font-bold text-[#2563EB] mt-1 flex items-center justify-center gap-1"><Calendar size={12} /> On Leave</div>;
                  break;
                case 'Holiday':
                  bgClass = "bg-[#F1F5F9] border-[#CBD5E1]";
                  numClass = "text-[#64748B] font-bold";
                  content = <div className="text-[10px] sm:text-xs font-bold text-[#64748B] mt-1 flex items-center justify-center gap-1"><Coffee size={12} /> Holiday</div>;
                  break;
                case 'Half-Day':
                  bgClass = "bg-[#FEF3C7] border-[#D97706]";
                  numClass = "text-[#D97706] font-bold";
                  content = <div className="text-[10px] sm:text-xs font-bold text-[#D97706] mt-1 flex items-center justify-center gap-1"><AlertTriangle size={12} /> Half Day</div>;
                  break;
                case 'Weekend':
                  bgClass = "bg-[#F8FAFC]/50 border-transparent";
                  numClass = "text-[#CBD5E1]";
                  break;
                default: // Future
                  bgClass = "bg-white border-[#E2E8F0] border-dashed";
                  numClass = "text-[#94A3B8]";
                  break;
              }

              const isToday = cell.date === TODAY_DATE;
              const ringClass = isToday ? 'ring-2 ring-[#2563EB] ring-offset-2' : '';

              return (
                <div 
                  key={cell.date} 
                  className={`relative rounded-xl border p-2 text-center min-h-[80px] sm:min-h-[100px] flex flex-col justify-center cursor-default transition-all hover:shadow-md ${bgClass} ${ringClass}`}
                  onMouseEnter={() => cell.status === 'Present' && setActiveTooltip(cell.date)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <span className={`text-sm sm:text-base absolute top-2 left-3 ${numClass}`}>{cell.day}</span>
                  
                  <div className="mt-4">
                    {content}
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {activeTooltip === cell.date && cell.status === 'Present' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0F172A] text-white text-left p-3 rounded-xl shadow-xl z-10 pointer-events-none"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-700 pb-1">{cell.date}</p>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300">Check-in</span>
                          <span className="text-xs font-medium text-white">{cell.data?.checkIn || '--'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-300">Check-out</span>
                          <span className="text-xs font-medium text-white">{cell.data?.checkOut || '--'}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                          <span className="text-xs text-slate-300">Hours</span>
                          <span className="text-xs font-bold text-[#2563EB]">{cell.data?.hoursWorked ? `${cell.data.hoursWorked}h` : '--'}</span>
                        </div>
                        {/* Tooltip triangle */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#0F172A]"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* MONTHLY SUMMARY BAR */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="font-semibold text-[#0F172A] mb-5">Monthly Breakdown</h2>
          
          {/* Custom Pure CSS Bar Chart representation */}
          <div className="space-y-4">
            
            <div className="flex items-center gap-4">
              <span className="w-20 text-xs font-bold text-[#64748B] uppercase tracking-wider">Present</span>
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
                <div className="bg-[#16A34A] h-full" style={{ width: `${(STATS.present/totalTracked)*100}%` }}></div>
              </div>
              <span className="w-16 text-sm font-bold text-[#0F172A] text-right">{STATS.present} days</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-20 text-xs font-bold text-[#64748B] uppercase tracking-wider">Leave</span>
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
                <div className="bg-[#2563EB] h-full" style={{ width: `${(STATS.leave/totalTracked)*100}%` }}></div>
              </div>
              <span className="w-16 text-sm font-bold text-[#0F172A] text-right">{STATS.leave} days</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-xs font-bold text-[#64748B] uppercase tracking-wider">Absent</span>
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
                <div className="bg-[#DC2626] h-full" style={{ width: `${(STATS.absent/totalTracked)*100}%` }}></div>
              </div>
              <span className="w-16 text-sm font-bold text-[#0F172A] text-right">{STATS.absent} days</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-20 text-xs font-bold text-[#64748B] uppercase tracking-wider">Half-Day</span>
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
                <div className="bg-[#D97706] h-full" style={{ width: `${(STATS.halfDay/totalTracked)*100}%` }}></div>
              </div>
              <span className="w-16 text-sm font-bold text-[#0F172A] text-right">{STATS.halfDay} days</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-xs font-bold text-[#64748B] uppercase tracking-wider">Holiday</span>
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
                <div className="bg-[#64748B] h-full" style={{ width: `${(STATS.holiday/totalTracked)*100}%` }}></div>
              </div>
              <span className="w-16 text-sm font-bold text-[#0F172A] text-right">{STATS.holiday} days</span>
            </div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
