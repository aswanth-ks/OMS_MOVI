import React, { useState } from 'react';
import { Search, Clock, Plus, Play, Download, MoreVertical, Briefcase, Users, CheckSquare, Flag, GraduationCap, IndianRupee, AlertCircle, CalendarDays, BarChart2, TrendingUp } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';

// --- MOCK DATA ---
const mockPMOReports = [
  { id: 1, name: "Project Health Overview", category: "Project Reports", description: "Comprehensive health status for all active projects including completion rates and risk flags.", schedule: "Weekly", lastRun: "2 hours ago", lastRunStatus: "SUCCESS", records: 12, fileSize: "1.2 MB", icon: Briefcase, iconColor: "text-blue-600 bg-blue-100" },
  { id: 2, name: "Resource Utilization Report", category: "Resource Reports", description: "All team members, workload percentage tracking, and overloaded employee alerts.", schedule: "Daily", lastRun: "Yesterday", lastRunStatus: "SUCCESS", records: 45, fileSize: "3.4 MB", icon: Users, iconColor: "text-indigo-600 bg-indigo-100" },
  { id: 3, name: "Task Velocity Report", category: "Task Reports", description: "Tasks completed per week mapping against the projected velocity trend line.", schedule: "Weekly", lastRun: "2 days ago", lastRunStatus: "SUCCESS", records: 340, fileSize: "5.1 MB", icon: CheckSquare, iconColor: "text-emerald-600 bg-emerald-100" },
  { id: 4, name: "Milestone Tracker", category: "Project Reports", description: "All milestones across projects compared on-time vs delayed delivery.", schedule: "Monthly", lastRun: "1 week ago", lastRunStatus: "SUCCESS", records: 28, fileSize: "800 KB", icon: Flag, iconColor: "text-orange-600 bg-orange-100" },
  { id: 5, name: "Intern Performance Summary", category: "Resource Reports", description: "All interns, completion rates, and weekly performance star ratings.", schedule: "Weekly", lastRun: "3 hours ago", lastRunStatus: "SUCCESS", records: 18, fileSize: "1.5 MB", icon: GraduationCap, iconColor: "text-purple-600 bg-purple-100" },
  { id: 6, name: "Budget Utilization Report", category: "Financial Reports", description: "Budget spent vs allocated per project. Tracks burn rate.", schedule: "Monthly", lastRun: "Yesterday", lastRunStatus: "WARNING", records: 8, fileSize: "450 KB", icon: IndianRupee, iconColor: "text-green-600 bg-green-100" },
  { id: 7, name: "Blocker Resolution Report", category: "Task Reports", description: "Blocked tasks trend and average resolution time across the organization.", schedule: "Daily", lastRun: "5 mins ago", lastRunStatus: "FAILED", records: 0, fileSize: "0 KB", icon: AlertCircle, iconColor: "text-red-600 bg-red-100" },
  { id: 8, name: "Project Timeline Variance", category: "Project Reports", description: "Planned vs actual dates for all project delivery milestones.", schedule: "Weekly", lastRun: "Yesterday", lastRunStatus: "SUCCESS", records: 22, fileSize: "2.1 MB", icon: CalendarDays, iconColor: "text-sky-600 bg-sky-100" },
  { id: 9, name: "Team Workload Heatmap", category: "Resource Reports", description: "Workload distribution matrix identifying capacity bottlenecks.", schedule: "Daily", lastRun: "Today 9:00 AM", lastRunStatus: "SUCCESS", records: 56, fileSize: "4.8 MB", icon: BarChart2, iconColor: "text-fuchsia-600 bg-fuchsia-100" },
  { id: 10, name: "Project Completion Forecast", category: "Project Reports", description: "AI-estimated completion dates based on historical velocity.", schedule: "On-Demand", lastRun: "Just now", lastRunStatus: "SUCCESS", records: 12, fileSize: "1.1 MB", icon: TrendingUp, iconColor: "text-amber-600 bg-amber-100" }
];

const CATEGORIES = ['All Reports', 'Project Reports', 'Resource Reports', 'Task Reports', 'Financial Reports'];

export default function PMOReports() {
  const [activeCategory, setActiveCategory] = useState('All Reports');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = mockPMOReports.filter(r => {
    const matchCategory = activeCategory === 'All Reports' || r.category === activeCategory;
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 max-w-[1400px] mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">PMO Reports</h1>
            <p className="text-sm text-[#64748B] mt-1">Project performance analytics and resource utilization reports</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2">
              <Clock size={18} /> Schedule Report
            </button>
            <button className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2">
              <Plus size={18} /> Create Custom Report
            </button>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between md:justify-start gap-8 shadow-sm">
          <div className="flex flex-col"><span className="text-xl font-black text-[#0F172A]">{mockPMOReports.length}</span><span className="text-xs font-bold text-[#64748B] uppercase">Total Reports</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#2563EB]">6</span><span className="text-xs font-bold text-[#64748B] uppercase">Scheduled</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#16A34A]">Just now</span><span className="text-xs font-bold text-[#64748B] uppercase">Last Generated</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#DC2626]">1</span><span className="text-xs font-bold text-[#64748B] uppercase border-b border-dashed border-[#DC2626]">Failed Runs</span></div>
        </div>

        {/* TABS & FILTERS */}
        <div className="space-y-4">
          <div className="flex overflow-x-auto border-b border-[#E2E8F0] hide-scrollbar">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeCategory === cat ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2563EB] outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* REPORT CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map(report => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                
                {/* Header Row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${report.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#0F172A]">{report.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded">{report.category}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10}/> {report.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#475569] mb-6 line-clamp-2 min-h-[40px]">{report.description}</p>

                {/* Last Run Section */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 mb-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase">Last Run:</span>
                      <span className="text-xs font-bold text-[#0F172A]">{report.lastRun}</span>
                      <span className={`w-2 h-2 rounded-full ml-1 ${
                        report.lastRunStatus === 'SUCCESS' ? 'bg-[#16A34A]' :
                        report.lastRunStatus === 'WARNING' ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                      }`} />
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium">{report.records} records · {report.fileSize}</p>
                  </div>
                  
                  {/* Status specific preview */}
                  <div className="text-right">
                    {report.lastRunStatus === 'SUCCESS' ? (
                      <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded border border-[#A7F3D0]">GENERATED</span>
                    ) : report.lastRunStatus === 'WARNING' ? (
                      <span className="text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] px-2 py-1 rounded border border-[#FDE68A]">PARTIAL DATA</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] px-2 py-1 rounded border border-[#FECACA]">ERROR</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <button className="bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
                    <Play size={14} className="fill-current" /> Run Now
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                      <Download size={16} /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <button className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors">
                      <Clock size={16} />
                    </button>
                    <button className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </PageWrapper>
  );
}
