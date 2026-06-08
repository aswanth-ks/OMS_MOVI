import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { Plus, CheckSquare, ClipboardCheck, BarChart2, GraduationCap, Clock } from 'lucide-react';

// --- MOCK DATA ---
const METRICS = [
  { label: 'Active Projects', value: '12', change: '+2 this month', icon: 'work', color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
  { label: 'At Risk / Delayed', value: '3', change: 'Requires attention', icon: 'warning', color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' },
  { label: 'Resource Utilization', value: '87%', change: '+5% capacity', icon: 'group', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
  { label: 'Upcoming Milestones', value: '8', change: 'Next 7 days', icon: 'flag', color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' },
];

const PROJECTS = [
  { 
    id: 'PRJ-101', name: 'Cloud Migration Phase 2', manager: 'Sarah Jenkins', 
    progress: 75, health: 'On Track', statusColor: 'bg-[#10B981]', 
    dueDate: 'Oct 30, 2026', teamSize: 8, priority: 'High' 
  },
  { 
    id: 'PRJ-102', name: 'Mobile App Redesign', manager: 'Mike Ross', 
    progress: 42, health: 'At Risk', statusColor: 'bg-[#F59E0B]', 
    dueDate: 'Nov 15, 2026', teamSize: 5, priority: 'Critical' 
  },
  { 
    id: 'PRJ-103', name: 'Q4 Security Audit', manager: 'Alex Wong', 
    progress: 15, health: 'Delayed', statusColor: 'bg-[#EF4444]', 
    dueDate: 'Oct 20, 2026', teamSize: 3, priority: 'High' 
  },
  { 
    id: 'PRJ-104', name: 'Internal Tools v3.0', manager: 'Jessica Pearson', 
    progress: 92, health: 'On Track', statusColor: 'bg-[#10B981]', 
    dueDate: 'Oct 12, 2026', teamSize: 4, priority: 'Medium' 
  },
];

const RECENT_ACTIVITY = [
  { user: 'Mike Ross', action: 'flagged a blocker on', target: 'Mobile App Redesign', time: '2 hours ago', icon: 'report_problem', color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' },
  { user: 'Sarah Jenkins', action: 'completed milestone on', target: 'Cloud Migration Phase 2', time: '5 hours ago', icon: 'check_circle', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
  { user: 'Jessica Pearson', action: 'assigned 3 new tasks in', target: 'Internal Tools v3.0', time: 'Yesterday', icon: 'assignment', color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
];

export default function PMODashboard() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-5 max-w-[1400px] mx-auto pb-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">PMO Dashboard</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              High-level overview of project health, resource utilization, and delivery timelines.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
            <button 
              onClick={() => navigate('/pmo/projects')}
              className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((metric, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full opacity-5 bg-gradient-to-br from-transparent to-[#0F172A] group-hover:scale-110 transition-transform duration-500" />
              
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.bg} ${metric.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{metric.icon}</span>
                </div>
              </div>
              
              <h3 className="text-[24px] font-bold text-[#0F172A] leading-none mb-1">{metric.value}</h3>
              <p className="text-[12px] font-semibold text-[#64748B]">{metric.label}</p>
              
              <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${metric.color}`}>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="flex gap-3 mt-1">
          <button onClick={() => navigate('/pmo/projects')} className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={16} className="text-[#64748B]"/> New Project
          </button>
          <button onClick={() => navigate('/pmo/tasks')} className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 shadow-sm">
            <CheckSquare size={16} className="text-[#64748B]"/> Assign Task
          </button>
          <button onClick={() => navigate('/pmo/approvals')} className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 shadow-sm">
            <ClipboardCheck size={16} className="text-[#64748B]"/> Review Approvals
            <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] px-1.5 py-0.5 rounded-full ml-1">3</span>
          </button>
          <button onClick={() => navigate('/pmo/reports')} className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 shadow-sm">
            <BarChart2 size={16} className="text-[#64748B]"/> Generate Report
          </button>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* LEFT: PROJECT HEALTH GRID */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
                <h2 className="text-[14px] font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#64748B] text-[18px]">monitoring</span>
                  Project Health & Progress
                </h2>
                <button 
                  onClick={() => navigate('/pmo/projects')}
                  className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                >
                  View All Projects
                </button>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  {PROJECTS.map(project => (
                    <div key={project.id} className="p-4 border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition-colors bg-white group cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">{project.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              project.priority === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' :
                              project.priority === 'High' ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]' :
                              'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                            }`}>
                              {project.priority} Priority
                            </span>
                          </div>
                          <h3 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{project.name}</h3>
                          <p className="text-[12px] font-medium text-[#64748B] mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            PM: {project.manager}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1.5">
                          <div className={`text-[12px] font-bold flex items-center gap-1.5 ${
                            project.health === 'On Track' ? 'text-[#10B981]' : 
                            project.health === 'At Risk' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {project.health}
                          </div>
                          <p className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            Due {project.dueDate}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${project.statusColor} rounded-full`} 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                        <span className="text-[12px] font-bold text-[#0F172A] w-8 text-right">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: RESOURCE & ACTIVITY SIDEBAR */}
          <div className="space-y-5">
            
            {/* Resource Allocation Snapshot */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h2 className="text-[13px] font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#64748B] text-[16px]">pie_chart</span>
                  Resource Allocation
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[12px] font-bold text-[#0F172A] mb-1.5">
                      <span>Frontend Development</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] font-bold text-[#0F172A] mb-1.5">
                      <span>Backend Engineering</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] font-bold text-[#0F172A] mb-1.5">
                      <span>Design & UX</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    <strong className="text-[#0F172A]">Warning:</strong> Frontend resources are highly utilized. Consider reallocating tasks from Cloud Migration Phase 2.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent PMO Activity */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h2 className="text-[13px] font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#64748B] text-[16px]">history</span>
                  Recent PMO Activity
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-[#E2E8F0]">
                  {RECENT_ACTIVITY.map((activity, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shrink-0 z-10 ${activity.bg} ${activity.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{activity.icon}</span>
                      </div>
                      <div className="pt-1">
                        <p className="text-[13px] text-[#0F172A] leading-snug">
                          <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-semibold text-[#2563EB]">{activity.target}</span>
                        </p>
                        <p className="text-[11px] font-medium text-[#64748B] mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 border border-[#E2E8F0] rounded-lg text-[12px] font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                  View Full Audit Log
                </button>
              </div>
            </div>

            {/* Intern Summary Widget */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
                <h2 className="text-[13px] font-bold text-[#0F172A] flex items-center gap-2">
                  <GraduationCap size={16} className="text-[#64748B]" />
                  Intern Overview
                </h2>
                <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full">5 Active</span>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">RM</div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-[#0F172A] leading-tight">Rahul Mehta</p>
                      <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded mt-0.5 inline-block">OWMS v2</span>
                    </div>
                    <div className="text-right w-12">
                      <p className="text-[11px] font-bold text-[#0F172A] mb-1">66%</p>
                      <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: '66%' }} /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-[#0F172A] leading-tight">Ananya Iyer</p>
                      <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded mt-0.5 inline-block">Mobile App</span>
                    </div>
                    <div className="text-right w-12">
                      <p className="text-[11px] font-bold text-[#0F172A] mb-1">25%</p>
                      <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#EF4444] rounded-full" style={{ width: '25%' }} /></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate('/pmo/interns')} className="w-full mt-4 py-2 border border-[#E2E8F0] rounded-lg text-[12px] font-bold text-[#2563EB] hover:bg-[#F8FAFC] transition-colors">
                  View All Interns →
                </button>
              </div>
            </div>

            {/* Pending Approvals Widget */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
                <h2 className="text-[13px] font-bold text-[#0F172A] flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-[#64748B]" />
                  Pending Approvals
                </h2>
                <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#EFF6FF] flex items-center justify-center shrink-0"><CheckSquare size={12} className="text-[#2563EB]" /></div>
                      <div><p className="text-[12px] text-[#0F172A]">Task from <strong>Rahul M.</strong></p><p className="text-[10px] text-[#64748B]">2h ago</p></div>
                    </div>
                    <button onClick={() => navigate('/pmo/approvals')} className="text-[11px] font-bold text-[#2563EB] hover:underline">Review</button>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#FFFBEB] flex items-center justify-center shrink-0"><Clock size={12} className="text-[#D97706]" /></div>
                      <div><p className="text-[12px] text-[#0F172A]">Leave for <strong>Priya S.</strong></p><p className="text-[10px] text-[#64748B]">5h ago</p></div>
                    </div>
                    <button onClick={() => navigate('/pmo/approvals')} className="text-[11px] font-bold text-[#2563EB] hover:underline">Review</button>
                  </div>
                </div>
                <button onClick={() => navigate('/pmo/approvals')} className="w-full mt-4 py-2 border border-[#E2E8F0] rounded-lg text-[12px] font-bold text-[#2563EB] hover:bg-[#F8FAFC] transition-colors">
                  View All Approvals →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
