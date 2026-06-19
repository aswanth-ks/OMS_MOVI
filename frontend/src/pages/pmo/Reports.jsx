import React, { useState } from 'react';
import { Search, Clock, Plus, Play, Download, MoreVertical, Briefcase, Users, CheckSquare, Flag, GraduationCap, IndianRupee, AlertCircle, CalendarDays, BarChart2, TrendingUp } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { pmoAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const mockPMOReports = [
  { id: 1, name: "Project Health Overview", category: "Project Reports", description: "Comprehensive health status for all active projects including completion rates and risk flags.", schedule: "Weekly", lastRun: "2 hours ago", lastRunStatus: "SUCCESS", records: 12, fileSize: "1.2 MB", icon: Briefcase, iconColor: "text-blue-600 bg-blue-100" },
  { id: 2, name: "Resource Utilization Report", category: "Resource Reports", description: "All team members, workload percentage tracking, and overloaded employee alerts.", schedule: "Daily", lastRun: "Yesterday", lastRunStatus: "SUCCESS", records: 45, fileSize: "3.4 MB", icon: Users, iconColor: "text-indigo-600 bg-indigo-100" },
  { id: 3, name: "Task Velocity Report", category: "Task Reports", description: "Tasks completed per week mapping against the projected velocity trend line.", schedule: "Weekly", lastRun: "2 days ago", lastRunStatus: "SUCCESS", records: 340, fileSize: "5.1 MB", icon: CheckSquare, iconColor: "text-emerald-600 bg-emerald-100" },
  { id: 4, name: "Milestone Tracker", category: "Project Reports", description: "All milestones across projects compared on-time vs delayed delivery.", schedule: "Monthly", lastRun: "1 week ago", lastRunStatus: "SUCCESS", records: 28, fileSize: "800 KB", icon: Flag, iconColor: "text-orange-600 bg-orange-100" },
  { id: 5, name: "Intern Performance Summary", category: "Resource Reports", description: "All interns, completion rates, and weekly performance star ratings.", schedule: "Weekly", lastRun: "3 hours ago", lastRunStatus: "SUCCESS", records: 18, fileSize: "1.5 MB", icon: GraduationCap, iconColor: "text-purple-600 bg-purple-100" },
  { id: 6, name: "Budget Utilization Report", category: "Financial Reports", description: "Budget spent vs allocated per project. Tracks burn rate.", schedule: "Monthly", lastRun: "Yesterday", lastRunStatus: "WARNING", records: 8, fileSize: "450 KB", icon: IndianRupee, iconColor: "text-green-600 bg-green-100" },
  { id: 7, name: "Blocker Resolution Report", category: "Task Reports", description: "Blocked tasks trend and average resolution time across the organization.", schedule: "Daily", lastRun: "5 mins ago", lastRunStatus: "FAILED", records: 0, fileSize: "0 KB", icon: AlertCircle, iconColor: "text-red-600 bg-red-100" }
];

const CATEGORIES = ['All Reports', 'Project Reports', 'Resource Reports', 'Task Reports', 'Financial Reports'];

const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    toast.error('No data available to download');
    return;
  }
  const separator = ',';
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(separator),
    ...data.map(row => keys.map(k => {
      let cell = row[k] === null || row[k] === undefined ? '' : row[k];
      cell = typeof cell === 'object' ? JSON.stringify(cell).replace(/"/g, '""') : cell.toString().replace(/"/g, '""');
      if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
      return cell;
    }).join(separator))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function PMOReports() {
  const [activeCategory, setActiveCategory] = useState('All Reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [runningReportId, setRunningReportId] = useState(null);

  const handleRunReport = async (reportId, reportName) => {
    setRunningReportId(reportId);
    const loadToast = toast.loading(`Generating ${reportName}...`);
    try {
      if (reportId === 1) {
        // Project Health Overview
        const res = await pmoAPI.getProjectHealth();
        const data = (res.data.data || []).map(p => ({
          ProjectID: p._id,
          ProjectName: p.name,
          HealthStatus: p.health,
          TotalTasks: p.metrics?.totalTasks || 0,
          OverdueTasks: p.metrics?.overdueTasks || 0,
          BlockedTasks: p.metrics?.blockedTasks || 0,
          CompletionPercent: `${p.metrics?.completionPercent || 0}%`
        }));
        downloadCSV(data, 'project_health_report.csv');
        toast.success('Report downloaded successfully');
      } else if (reportId === 2) {
        // Resource Utilization Report
        const res = await pmoAPI.getTeam();
        const data = (res.data.data || []).map(m => ({
          EmployeeName: m.user?.name,
          Designation: m.user?.designation,
          Role: m.user?.employmentType,
          ActiveProjectsCount: m.projects?.length || 0,
          ActiveProjects: m.projects?.join('; ') || '',
          ActiveTasksCount: m.stats?.activeTasks || 0,
          CompletedTasksCount: m.stats?.completedTasks || 0,
          OverdueTasksCount: m.stats?.overdueTasksCount || 0,
          WorkloadPercentage: `${m.stats?.workload || 0}%`
        }));
        downloadCSV(data, 'resource_utilization_report.csv');
        toast.success('Report downloaded successfully');
      } else if (reportId === 6) {
        // Budget Utilization Report
        const res = await pmoAPI.getProjects();
        const data = (res.data.data || []).map(p => ({
          ProjectCode: p.code,
          ProjectName: p.name,
          Priority: p.priority,
          Status: p.status,
          BudgetAllocated: p.budget || 0,
          BudgetSpent: p.budgetSpent || 0,
          BudgetRemaining: (p.budget || 0) - (p.budgetSpent || 0)
        }));
        downloadCSV(data, 'budget_utilization_report.csv');
        toast.success('Report downloaded successfully');
      } else if (reportId === 7) {
        // Blocker Resolution Report
        const res = await pmoAPI.getTasks({ status: 'Blocked' });
        const data = (res.data.data || []).map(t => ({
          TaskID: t._id,
          TaskTitle: t.title,
          Project: t.project?.name,
          BlockedReason: t.blockedReason || 'Unspecified',
          Assignee: t.assignedTo?.name,
          CreatedDate: new Date(t.createdAt).toLocaleDateString()
        }));
        downloadCSV(data, 'blocked_tasks_report.csv');
        toast.success('Report downloaded successfully');
      } else {
        // General tasks download fallback
        const res = await pmoAPI.getTasks();
        const data = (res.data.data || []).map(t => ({
          TaskTitle: t.title,
          Project: t.project?.name,
          Assignee: t.assignedTo?.name,
          Status: t.status,
          Priority: t.priority,
          DueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
        }));
        downloadCSV(data, `${reportName.toLowerCase().replace(/\s+/g, '_')}.csv`);
        toast.success('Report downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      toast.dismiss(loadToast);
      setRunningReportId(null);
    }
  };

  const filteredReports = mockPMOReports.filter(r => {
    const matchCategory = activeCategory === 'All Reports' || r.category === activeCategory;
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 max-w-[1400px] mx-auto pb-12 text-left">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">PMO Reports</h1>
            <p className="text-sm text-[#64748B] mt-1">Project performance analytics and resource utilization reports</p>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between md:justify-start gap-8 shadow-sm">
          <div className="flex flex-col"><span className="text-xl font-black text-[#0F172A]">{mockPMOReports.length}</span><span className="text-xs font-bold text-[#64748B] uppercase">Total Reports</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#2563EB]">Live</span><span className="text-xs font-bold text-[#64748B] uppercase">Data Source</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#16A34A]">CSV</span><span className="text-xs font-bold text-[#64748B] uppercase">Export Format</span></div>
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
            const isRunning = runningReportId === report.id;

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

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <button 
                    disabled={isRunning}
                    onClick={() => handleRunReport(report.id, report.name)}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Play size={14} className="fill-current" /> {isRunning ? 'Running...' : 'Run & Export'}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleRunReport(report.id, report.name)}
                      className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <Download size={16} /> <span className="hidden sm:inline">Export</span>
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
