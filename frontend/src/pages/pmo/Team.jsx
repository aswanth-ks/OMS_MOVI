import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, LayoutGrid, List as ListIcon, UserPlus, X, ChevronDown } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { WorkloadBar } from '../../components/pmo/WorkloadBar';

// --- MOCK DATA ---
const mockTeam = [
  { id: 1, name: "Alex Wong", role: "Senior Developer", dept: "Engineering", workload: 125, activeProjects: ["OWMS v2", "Data Pipeline"], tasksActive: 15, tasksDone: 42, tasksOverdue: 3, avatar: "AW", avatarColor: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Sarah Johnson", role: "HR Manager", dept: "HR", workload: 60, activeProjects: ["OWMS v2"], tasksActive: 8, tasksDone: 15, tasksOverdue: 0, avatar: "SJ", avatarColor: "bg-purple-100 text-purple-700" },
  { id: 3, name: "Priya Sharma", role: "UX Designer", dept: "Design", workload: 90, activeProjects: ["OWMS v2", "Mobile App"], tasksActive: 12, tasksDone: 28, tasksOverdue: 1, avatar: "PS", avatarColor: "bg-emerald-100 text-emerald-700" },
  { id: 4, name: "Mike Ross", role: "Frontend Dev", dept: "Engineering", workload: 40, activeProjects: ["Mobile App"], tasksActive: 5, tasksDone: 10, tasksOverdue: 0, avatar: "MR", avatarColor: "bg-amber-100 text-amber-700" },
  { id: 5, name: "Jessica Pearson", role: "Project Lead", dept: "Management", workload: 85, activeProjects: ["Internal Tools"], tasksActive: 10, tasksDone: 50, tasksOverdue: 2, avatar: "JP", avatarColor: "bg-rose-100 text-rose-700" },
  { id: 6, name: "David Chen", role: "Backend Dev", dept: "Engineering", workload: 30, activeProjects: [], tasksActive: 2, tasksDone: 18, tasksOverdue: 0, avatar: "DC", avatarColor: "bg-cyan-100 text-cyan-700" }
];

export default function PMOTeam() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const totalMembers = mockTeam.length;
  const fullyAvailable = mockTeam.filter(m => m.workload < 50).length;
  const atCapacity = mockTeam.filter(m => m.workload >= 80 && m.workload <= 100).length;
  const overloaded = mockTeam.filter(m => m.workload > 100).length;
  const avgUtilization = Math.round(mockTeam.reduce((acc, m) => acc + m.workload, 0) / totalMembers);

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 max-w-[1400px] mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Team</h1>
            <p className="text-sm text-[#64748B] mt-1">Manage resources and workload across all projects</p>
          </div>
          <button className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2">
            <UserPlus size={18} /> Add to Project
          </button>
        </div>

        {/* SUMMARY STATS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between md:justify-start gap-8 shadow-sm">
          <div className="flex flex-col"><span className="text-xl font-black text-[#0F172A]">{totalMembers}</span><span className="text-xs font-bold text-[#64748B] uppercase">Total Members</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#16A34A]">{fullyAvailable}</span><span className="text-xs font-bold text-[#64748B] uppercase">Fully Available</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#D97706]">{atCapacity}</span><span className="text-xs font-bold text-[#64748B] uppercase">At Capacity</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col cursor-pointer hover:opacity-80"><span className="text-xl font-black text-[#DC2626]">{overloaded}</span><span className="text-xs font-bold text-[#64748B] uppercase border-b border-dashed border-[#DC2626]">Overloaded</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#2563EB]">{avgUtilization}%</span><span className="text-xs font-bold text-[#64748B] uppercase">Avg Utilization</span></div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input 
                type="text" 
                placeholder="Search by name, role, or dept..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-2">
                Department <ChevronDown size={14} />
              </button>
              <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-2">
                Workload <ChevronDown size={14} />
              </button>
              <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-2">
                <Filter size={14} /> More
              </button>
            </div>
          </div>
          
          <div className="flex bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-1 shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTeam.map(member => (
              <div key={member.id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${member.avatarColor}`}>
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{member.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded">{member.role}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide border border-[#E2E8F0] text-[#64748B] px-2 py-0.5 rounded">{member.dept}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] tracking-widest text-[#94A3B8] font-bold uppercase">Workload</span>
                    <span className={`text-3xl font-black leading-none ${
                      member.workload > 100 ? 'text-[#DC2626]' :
                      member.workload >= 80 ? 'text-[#D97706]' : 'text-[#16A34A]'
                    }`}>{member.workload}%</span>
                  </div>
                  <WorkloadBar percentage={member.workload} showLabel={false} size="sm" />
                  
                  {member.workload > 100 ? (
                    <div className="mt-3 bg-[#FEF2F2] border border-[#DC2626] rounded-md px-3 py-2 text-xs font-bold text-[#DC2626] flex items-center gap-2">
                      <X size={14} /> ⛔ Over Capacity — reassign tasks
                    </div>
                  ) : member.workload >= 80 ? (
                    <div className="mt-2 inline-flex bg-[#FFFBEB] border border-[#FDE68A] rounded px-2 py-1 text-[11px] font-bold text-[#D97706]">
                      ⚠ Overloaded
                    </div>
                  ) : null}
                </div>

                <div className="mb-5">
                  <p className="text-xs font-bold text-[#64748B] mb-2">Active Projects:</p>
                  <div className="flex flex-wrap gap-2">
                    {member.activeProjects.length > 0 ? member.activeProjects.map((p, i) => (
                      <span key={i} className="text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded">{p}</span>
                    )) : <span className="text-[11px] font-bold text-[#94A3B8] italic">Unassigned</span>}
                  </div>
                </div>

                <div className="flex justify-between text-center divide-x divide-[#E2E8F0] border-y border-[#E2E8F0] py-3 mb-5">
                  <div className="flex-1"><p className="text-sm font-bold text-[#2563EB]">{member.tasksActive}</p><p className="text-[10px] uppercase font-bold text-[#64748B]">Active</p></div>
                  <div className="flex-1"><p className="text-sm font-bold text-[#16A34A]">{member.tasksDone}</p><p className="text-[10px] uppercase font-bold text-[#64748B]">Done</p></div>
                  <div className="flex-1"><p className="text-sm font-bold text-[#DC2626]">{member.tasksOverdue}</p><p className="text-[10px] uppercase font-bold text-[#64748B]">Overdue</p></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/hr/employees/${member.id}`)} className="flex-1 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F1F5F9] transition-colors">View Profile</button>
                  <button className="flex-1 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F1F5F9] transition-colors">Assign Task</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm text-[#475569]">
              <thead className="bg-[#F8FAFC] text-xs uppercase font-bold text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Active Projects</th>
                  <th className="px-6 py-4">Tasks</th>
                  <th className="px-6 py-4">Workload</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {mockTeam.map(member => (
                  <tr key={member.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarColor}`}>{member.avatar}</div>
                        <div>
                          <p className="font-bold text-[#0F172A]">{member.name}</p>
                          <p className="text-xs text-[#64748B]">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{member.dept}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.activeProjects.map(p => <span key={p} className="text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">{p}</span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{member.tasksActive} Act / {member.tasksDone} Dn</td>
                    <td className="px-6 py-4 w-48">
                      <WorkloadBar percentage={member.workload} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => navigate(`/hr/employees/${member.id}`)} className="text-[#2563EB] font-bold text-xs hover:underline mr-3">Profile</button>
                      <button className="text-[#0F172A] font-bold text-xs hover:underline">Adjust</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
