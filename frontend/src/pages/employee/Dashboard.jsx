import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { 
  CheckSquare, Briefcase, CalendarDays, Clock, 
  CheckCircle, Users, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/employee/dashboard
const mockEmployee = {
  _id: "emp001", 
  name: "Alex Wong",
  email: "alex.wong@movicloudlabs.com",
  employeeId: "EMP-2024-003",
  designation: "Senior Developer",
  department: { _id: "dept001", name: "Engineering" },
  projects: [
    { _id: "proj001", name: "OWMS Internal Platform v2", status: "Active", role: "Developer" },
    { _id: "proj002", name: "Data Pipeline Automation", status: "Active", role: "Lead Developer" },
    { _id: "proj003", name: "CRM Module", status: "Planning", role: "Developer" },
  ],
  manager: { _id: "pmo001", name: "Aswanth K", role: "PMO Lead" },
  hrManager: { _id: "hr001", name: "Sarah Johnson" },
  joinDate: "2023-03-15T00:00:00Z",
  employmentType: "Full-time",
  workload: 85,
  leaveBalance: { casual: 8, sick: 5, annual: 12, used: 6 }
};

const MOCK_TASKS = [
  { id: 1, title: 'Build Login Page UI', project: 'OWMS Internal Platform v2', priority: 'High', priorityColor: 'bg-orange-500', status: 'In Progress', due: 'Today' },
  { id: 2, title: 'API Integration for Auth', project: 'OWMS Internal Platform v2', priority: 'Critical', priorityColor: 'bg-red-500', status: 'Todo', due: 'Today' },
];

const MOCK_PROJECT_STATS = [
  { id: "proj001", name: "OWMS Internal Platform v2", status: "Active", priority: "High", done: 8, total: 12, date: "Nov 30, 2026", teamSize: 6, health: "On Track" },
  { id: "proj002", name: "Data Pipeline Automation", status: "Active", priority: "Medium", done: 15, total: 45, date: "Dec 15, 2026", teamSize: 4, health: "At Risk" },
  { id: "proj003", name: "CRM Module", status: "Planning", priority: "Low", done: 0, total: 5, date: "Jan 10, 2027", teamSize: 3, health: "On Track" },
];

const MOCK_DEADLINES = [
  { id: 1, title: 'Submit Architecture Doc', date: 'Tomorrow', priority: 'Medium', urgency: 'amber' },
  { id: 2, title: 'Auth Module Code Review', date: 'Oct 15', priority: 'High', urgency: 'blue' },
  { id: 3, title: 'Sprint 4 Planning', date: 'Oct 20', priority: 'Critical', urgency: 'gray' },
];

const MOCK_ACTIVITIES = [
  { id: 1, text: "Task 'Build Login Page' marked In Progress", time: "2h ago", color: "bg-blue-500" },
  { id: 2, text: "Assigned to 'CRM Module' project", time: "Yesterday", color: "bg-purple-500" },
  { id: 3, text: "Task 'Fix Pipeline' completed", time: "2 days ago", color: "bg-green-500" },
];

const MOCK_TEAM = [
  { id: 1, name: "Sarah Connor", avatar: "SC", role: "Product Manager", department: "Product", color: "bg-blue-600" },
  { id: 2, name: "John Doe", avatar: "JD", role: "Developer", department: "Engineering", color: "bg-purple-600" },
  { id: 3, name: "Rahul Mehta", avatar: "RM", role: "Intern", department: "Engineering", color: "bg-amber-600" },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'red': return 'bg-red-500';
      case 'amber': return 'bg-amber-500';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };

  const workloadColor = mockEmployee.workload < 50 ? 'text-[#16A34A] bg-[#DCFCE7]' : mockEmployee.workload <= 80 ? 'text-[#D97706] bg-[#FEF3C7]' : 'text-[#DC2626] bg-[#FEE2E2]';
  const workloadBarColor = mockEmployee.workload < 50 ? 'bg-[#16A34A]' : mockEmployee.workload <= 80 ? 'bg-[#D97706]' : 'bg-[#DC2626]';

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto pb-8 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Good morning, {mockEmployee.name}</h1>
            <p className="text-sm text-[#64748B] mt-1">{mockEmployee.designation} &middot; {mockEmployee.department.name}</p>
          </div>
          <div>
            <p className="text-sm text-[#64748B] font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">My Tasks</p>
              <p className="text-xs text-[#64748B]">24 &middot; 16 done</p>
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Projects</p>
              <p className="text-xs text-[#64748B]">{mockEmployee.projects.length} active</p>
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#16A34A] shrink-0">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Attendance</p>
              <p className="text-xs text-[#64748B]">98% &middot; 22/23 days</p>
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#D97706] shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Leave</p>
              <p className="text-xs text-[#64748B]">19 days left</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN 65% */}
          <div className="w-full lg:w-[65%] space-y-6">
            
            {/* Today's Tasks */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-[#0F172A]">Today's Tasks</h2>
                <button onClick={() => navigate('/employee/tasks')} className="text-sm font-bold text-[#2563EB] hover:underline">
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_TASKS.length > 0 ? MOCK_TASKS.map(task => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-[#E2E8F0] rounded-lg hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className={`w-2 h-2 rounded-full ${task.priorityColor}`} />
                      <span className="text-sm font-medium text-[#0F172A]">{task.title}</span>
                      <span className="text-xs bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded ml-2 hidden sm:inline-block max-w-[150px] truncate" title={task.project}>{task.project}</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 pl-5 sm:pl-0">
                      <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">Due {task.due}</span>
                      <div className="w-24">
                        {task.status === 'Todo' && <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded w-full inline-block text-center">Todo</span>}
                        {task.status === 'In Progress' && <span className="text-[11px] font-bold bg-blue-50 text-[#2563EB] px-2 py-1 rounded w-full inline-block text-center">In Progress</span>}
                      </div>
                      <div className="w-24 flex justify-end">
                        <button className="text-[11px] font-bold text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF] px-3 py-1 rounded transition-colors">Action</button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-6 text-[#64748B]">
                    <CheckCircle size={32} className="text-[#16A34A] mb-2 opacity-50" />
                    <p className="text-sm">No tasks due today</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Projects Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-[#0F172A]">My Projects</h2>
                  <span className="bg-[#EFF6FF] text-[#2563EB] text-xs font-bold px-2 py-0.5 rounded">{mockEmployee.projects.length} Active</span>
                </div>
                <button onClick={() => navigate('/employee/projects')} className="text-sm font-bold text-[#2563EB] hover:underline">
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-4">
                {MOCK_PROJECT_STATS.slice(0, 3).map(proj => (
                  <div key={proj.id} className="border border-[#E2E8F0] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0F172A]">{proj.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${proj.status === 'Active' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-slate-100 text-slate-600'}`}>{proj.status}</span>
                        {proj.priority === 'High' && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-50 text-red-600">High</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <Users size={14} />
                        <span>{proj.teamSize} members</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-[#64748B]">My Progress</span>
                        <span className="text-[10px] font-bold text-[#0F172A]">{proj.done}/{proj.total} tasks &middot; Due {proj.date}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${proj.total > 0 ? (proj.done/proj.total)*100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F172A] mb-5">Recent Activity</h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-0.5 before:bg-[#E2E8F0]">
                {MOCK_ACTIVITIES.map(act => (
                  <div key={act.id} className="relative flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full border-2 border-white z-10 ${act.color}`} />
                    <div className="flex-1">
                      <p className="text-sm text-[#0F172A]">{act.text}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN 35% */}
          <div className="w-full lg:w-[35%] space-y-6">
            
            {/* Workload Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F172A] mb-4">My Workload</h2>
              <div className="flex flex-col items-center justify-center py-2">
                <span className={`text-4xl font-black ${mockEmployee.workload > 80 ? 'text-[#DC2626]' : mockEmployee.workload > 50 ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                  {mockEmployee.workload}%
                </span>
                <p className="text-xs text-[#64748B] mt-1 text-center font-medium">Capacity utilized</p>
              </div>
              
              <div className="mt-4">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${workloadBarColor}`} style={{ width: `${mockEmployee.workload}%` }} />
                </div>
                <p className="text-xs text-center text-[#0F172A] mt-3 font-medium">
                  {mockEmployee.projects.length} active projects
                </p>
              </div>

              {mockEmployee.workload > 80 && (
                <div className="mt-4 p-3 bg-[#FEF3C7] border border-[#D97706] rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-[#D97706] shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-[#D97706]">High workload detected. Consider discussing prioritization with your manager.</p>
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F172A] mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {MOCK_DEADLINES.map(dl => (
                  <div key={dl.id} className="flex items-center gap-3">
                    <div className={`w-1.5 h-10 rounded-full ${getUrgencyColor(dl.urgency)} shrink-0`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">{dl.title}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{dl.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Team Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-[#0F172A]">My Team</h2>
                <button onClick={() => navigate('/employee/team')} className="text-sm font-bold text-[#2563EB] hover:underline">
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_TEAM.map(member => (
                  <div key={member.id} className="flex items-center gap-3 border border-[#E2E8F0] p-2.5 rounded-lg bg-[#F8FAFC]">
                    <div className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{member.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white border border-[#E2E8F0] text-[#64748B]">{member.role}</span>
                        <span className="text-[10px] text-[#64748B]">{member.department}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Leave Card */}
            <div className="bg-[#FEF3C7] border border-[#D97706] rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="mt-0.5 bg-white p-1.5 rounded-full text-[#D97706]">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#92400E]">1 leave request pending</p>
                <p className="text-xs text-[#D97706] mt-0.5 font-medium">Pending approval by {mockEmployee.hrManager.name}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
