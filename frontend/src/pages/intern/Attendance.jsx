import { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { CalendarDays, ChevronLeft, ChevronRight, Check, X, Calendar, AlertTriangle, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { internAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getAttendanceColor = (percentage) => {
  if (percentage >= 90) return 'text-[#16A34A]';
  if (percentage >= 75) return 'text-[#D97706]';
  return 'text-[#DC2626]';
};

export default function InternAttendance() {
  const now = new Date();
  const [year,    setYear]    = useState(now.getFullYear());
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await internAPI.getAttendance({ month, year });
      const d = r.data?.data || r.data;
      setRecords(d?.records || []);
      setSummary(d?.summary  || null);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [month, year]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Build a map from day-of-month -> record
  const dayMap = {};
  records.forEach(r => {
    const d = new Date(r.date);
    dayMap[d.getDate()] = r;
  });

  const firstDay    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const record  = dayMap[day];
    const dow     = dateObj.getDay();
    let status = record?.status || (dow === 0 || dow === 6 ? 'Weekend' : 'Future');
    calendarCells.push({ day, date: dateStr, status, data: record || null });
  }

  const totalTracked = summary
    ? (summary.present || 0) + (summary.absent || 0) + (summary.leave || 0) + (summary.holiday || 0) + (summary.halfDay || 0)
    : 0;

  const barRows = summary ? [
    { label: 'Present',  val: summary.present  || 0, color: '#16A34A' },
    { label: 'Leave',    val: summary.leave     || 0, color: '#2563EB' },
    { label: 'Absent',   val: summary.absent    || 0, color: '#DC2626' },
    { label: 'Half-Day', val: summary.halfDay   || 0, color: '#D97706' },
    { label: 'Holiday',  val: summary.holiday   || 0, color: '#64748B' },
  ] : [];

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-10 font-sans">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
              <CalendarDays size={22} className="text-[#2563EB]" /> Attendance
            </h1>
            <p className="text-sm text-[#64748B] mt-1">Your attendance record for this month</p>
          </div>
          <div className="flex items-center gap-4 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-sm">
            <button onClick={prevMonth} className="p-1 hover:bg-[#F1F5F9] rounded transition-colors text-[#64748B]">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-[#0F172A] min-w-[130px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-[#F1F5F9] rounded transition-colors text-[#64748B]">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* SUMMARY STATS */}
        {summary && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-4 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Present</span>
              <span className="text-2xl font-bold text-[#16A34A]">{summary.present ?? '--'}</span>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Absent</span>
              <span className="text-2xl font-bold text-[#DC2626]">{summary.absent ?? '--'}</span>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Leave</span>
              <span className="text-2xl font-bold text-[#2563EB]">{summary.leave ?? '--'}</span>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block" />

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Holidays</span>
              <span className="text-2xl font-bold text-[#64748B]">{summary.holiday ?? '--'}</span>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0] hidden md:block" />

            <div className="flex items-baseline gap-2 ml-auto">
              <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Attendance %</span>
              <span className={`text-3xl font-black ${getAttendanceColor(summary.percentage ?? 0)}`}>
                {summary.percentage ?? '--'}%
              </span>
            </div>
          </div>
        )}

        {/* CALENDAR */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-3 sm:gap-4">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-xs font-bold text-[#64748B] text-center uppercase tracking-widest pb-2">{d}</div>
              ))}

              {calendarCells.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} className="min-h-[80px]" />;

                const isToday = cell.day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();
                const ringClass = isToday ? 'ring-2 ring-[#2563EB] ring-offset-2' : '';

                let bgClass  = 'bg-white border-[#E2E8F0] border-dashed';
                let numClass = 'text-[#94A3B8]';
                let content  = null;

                switch (cell.status) {
                  case 'Present':
                    bgClass  = 'bg-[#DCFCE7] border-[#16A34A]';
                    numClass = 'text-[#16A34A] font-bold';
                    content  = (
                      <>
                        <div className="text-[10px] sm:text-xs font-bold text-[#16A34A] mt-1 flex items-center justify-center gap-1">
                          <Check size={12} /> Present
                        </div>
                        {cell.data?.checkIn && (
                          <div className="text-[9px] sm:text-[10px] text-[#16A34A]/80 font-medium mt-0.5">{cell.data.checkIn}</div>
                        )}
                      </>
                    );
                    break;
                  case 'Absent':
                    bgClass  = 'bg-[#FEE2E2] border-[#DC2626]';
                    numClass = 'text-[#DC2626] font-bold';
                    content  = (
                      <div className="text-[10px] sm:text-xs font-bold text-[#DC2626] mt-1 flex items-center justify-center gap-1">
                        <X size={12} /> Absent
                      </div>
                    );
                    break;
                  case 'Leave':
                    bgClass  = 'bg-[#DBEAFE] border-[#2563EB]';
                    numClass = 'text-[#2563EB] font-bold';
                    content  = (
                      <div className="text-[10px] sm:text-xs font-bold text-[#2563EB] mt-1 flex items-center justify-center gap-1">
                        <Calendar size={12} /> On Leave
                      </div>
                    );
                    break;
                  case 'Holiday':
                    bgClass  = 'bg-[#F1F5F9] border-[#CBD5E1]';
                    numClass = 'text-[#64748B] font-bold';
                    content  = (
                      <div className="text-[10px] sm:text-xs font-bold text-[#64748B] mt-1 flex items-center justify-center gap-1">
                        <Coffee size={12} /> Holiday
                      </div>
                    );
                    break;
                  case 'Half-Day':
                    bgClass  = 'bg-[#FEF3C7] border-[#D97706]';
                    numClass = 'text-[#D97706] font-bold';
                    content  = (
                      <div className="text-[10px] sm:text-xs font-bold text-[#D97706] mt-1 flex items-center justify-center gap-1">
                        <AlertTriangle size={12} /> Half Day
                      </div>
                    );
                    break;
                  case 'Weekend':
                    bgClass  = 'bg-[#F8FAFC]/50 border-transparent';
                    numClass = 'text-[#CBD5E1]';
                    break;
                  default:
                    break;
                }

                return (
                  <div
                    key={cell.date}
                    className={`relative rounded-xl border p-2 text-center min-h-[80px] sm:min-h-[100px] flex flex-col justify-center cursor-default transition-all hover:shadow-md ${bgClass} ${ringClass}`}
                    onMouseEnter={() => cell.status === 'Present' && setActiveTooltip(cell.date)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <span className={`text-sm sm:text-base absolute top-2 left-3 ${numClass}`}>{cell.day}</span>

                    <div className="mt-4">{content}</div>

                    {/* Tooltip for Present days */}
                    <AnimatePresence>
                      {activeTooltip === cell.date && cell.status === 'Present' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0F172A] text-white text-left p-3 rounded-xl shadow-xl z-10 pointer-events-none"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-700 pb-1">
                            {cell.date}
                          </p>
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
                            <span className="text-xs font-bold text-[#2563EB]">
                              {cell.data?.hoursWorked ? `${cell.data.hoursWorked}h` : '--'}
                            </span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#0F172A]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MONTHLY BREAKDOWN BAR CHART */}
        {summary && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
            <h2 className="font-semibold text-[#0F172A] mb-5">Monthly Breakdown</h2>
            <div className="space-y-4">
              {barRows.map(({ label, val, color }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="w-20 text-xs font-bold text-[#64748B] uppercase tracking-wider">{label}</span>
                  <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: totalTracked > 0 ? `${(val / totalTracked) * 100}%` : '0%',
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="w-16 text-sm font-bold text-[#0F172A] text-right">{val} days</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
