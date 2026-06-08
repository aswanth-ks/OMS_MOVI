import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { Eye } from 'lucide-react';

// --- MOCK DATA ---
const MY_PROJECTS = [
  { 
    id: 'PRJ-101', code: 'PRJ-101', name: 'Cloud Migration Phase 2', 
    description: 'Migrating legacy on-premise databases to AWS infrastructure.',
    progress: 75, health: 'On Track', statusColor: 'bg-[#10B981]', 
    dueDate: 'Oct 30, 2026', priority: 'High', status: 'Active',
    team: [
      { initial: 'S', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]' },
      { initial: 'M', bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]' },
    ]
  },
  { 
    id: 'PRJ-104', code: 'PRJ-104', name: 'Internal Tools v3.0', 
    description: 'Overhauling the internal HR and PMO dashboards for better performance.',
    progress: 92, health: 'On Track', statusColor: 'bg-[#10B981]', 
    dueDate: 'Oct 12, 2026', priority: 'Medium', status: 'Active',
    team: [
      { initial: 'R', bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]' }
    ]
  }
];

const AVAILABLE_EMPLOYEES = [
  { id: 'e1', name: 'Sarah Jenkins', role: 'Frontend Developer', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', initial: 'S' },
  { id: 'e2', name: 'Mike Ross', role: 'Backend Developer', bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]', initial: 'M' },
  { id: 'e3', name: 'Alex Wong', role: 'Full Stack Intern', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', initial: 'A' },
  { id: 'e4', name: 'Jessica Pearson', role: 'UI/UX Designer', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', initial: 'J' },
  { id: 'h1', name: 'HR Admin', role: 'HR Representative', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', initial: 'H' }
];

export default function PMOProjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Active');
  const [search, setSearch] = useState('');
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newProject, setNewProject] = useState({
    name: '', code: '', description: '', dueDate: '', priority: 'Medium',
    requestedRoles: [], selectedTeam: [], hrRep: null
  });
  
  // Temporary state for the wizard inputs
  const [roleInput, setRoleInput] = useState('');
  const [qtyInput, setQtyInput] = useState(1);

  const filteredProjects = MY_PROJECTS.filter(p => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddRoleRequest = () => {
    if (roleInput) {
      setNewProject(prev => ({
        ...prev,
        requestedRoles: [...prev.requestedRoles, { role: roleInput, qty: qtyInput }]
      }));
      setRoleInput('');
      setQtyInput(1);
    }
  };

  const toggleTeamMember = (emp) => {
    setNewProject(prev => {
      const isSelected = prev.selectedTeam.find(m => m.id === emp.id);
      if (isSelected) {
        return { ...prev, selectedTeam: prev.selectedTeam.filter(m => m.id !== emp.id) };
      } else {
        return { ...prev, selectedTeam: [...prev.selectedTeam, emp] };
      }
    });
  };

  const finishWizard = () => {
    // In a real app, this would post to the API.
    setIsWizardOpen(false);
    setWizardStep(1);
    // Reset state
    setNewProject({ name: '', code: '', description: '', dueDate: '', priority: 'Medium', requestedRoles: [], selectedTeam: [], hrRep: null });
  };

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-8 max-w-[1400px] mx-auto pb-12 relative">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">My Projects</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Manage your isolated project teams, requests, and timelines.
            </p>
          </div>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </button>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-[#F1F5F9] p-1 rounded-lg w-fit">
            {['All', 'Active', 'Planning', 'Completed'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-1.5 text-[13px] font-bold rounded-md transition-all ${
                  filter === f ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search my projects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* PROJECT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md w-fit border border-[#E2E8F0]">{p.code}</span>
                    <h3 className="text-[16px] font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors">{p.name}</h3>
                  </div>
                  <div className={`text-[11px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                    p.health === 'On Track' ? 'text-[#10B981] bg-[#ECFDF5] border-[#D1FAE5]' : 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {p.health}
                  </div>
                </div>
                <p className="text-[13px] text-[#64748B] leading-relaxed mb-6 line-clamp-2 flex-1">{p.description}</p>
                <div className="mb-6">
                  <div className="flex justify-between text-[11px] font-bold text-[#0F172A] mb-2">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className={`h-full ${p.statusColor} rounded-full transition-all`} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="pt-5 border-t border-[#F1F5F9] flex items-center justify-between mt-auto">
                  <div className="flex -space-x-2">
                    {p.team.map((a, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-[11px] relative z-[${10-i}] ${a.bg} ${a.text}`}>
                        {a.initial}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0]">
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      {p.dueDate}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/pmo/projects/${p.id}`); }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] hover:bg-[#EFF6FF] border border-transparent hover:border-[#BFDBFE] px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- MULTI-STEP WIZARD MODAL --- */}
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px] text-[#2563EB]">rocket_launch</span>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] leading-tight">Create New Isolated Project</h2>
                    <p className="text-[12px] text-[#64748B]">Step {wizardStep} of 3</p>
                  </div>
                </div>
                <button onClick={() => setIsWizardOpen(false)} className="text-[#64748B] hover:bg-[#E2E8F0] p-1 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-[#F1F5F9] shrink-0">
                <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${(wizardStep / 3) * 100}%` }} />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* STEP 1: Basic Details */}
                {wizardStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h3 className="text-[18px] font-bold text-[#0F172A] mb-4">Project Foundation</h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Project Name</label>
                        <input type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" placeholder="e.g. Website Redesign" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Project Code</label>
                        <input type="text" value={newProject.code} onChange={e => setNewProject({...newProject, code: e.target.value.toUpperCase()})} className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] uppercase" placeholder="PRJ-105" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Description</label>
                      <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] resize-none" rows="3" placeholder="Briefly describe the project goals..." />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Due Date</label>
                        <input type="date" value={newProject.dueDate} onChange={e => setNewProject({...newProject, dueDate: e.target.value})} className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Assign HR Representative</label>
                        <select className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] appearance-none cursor-pointer">
                          <option>Select an HR Admin...</option>
                          <option>Sarah HR Manager</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Resource Request */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h3 className="text-[18px] font-bold text-[#0F172A] mb-1">Resource Request</h3>
                    <p className="text-[13px] text-[#64748B] mb-6">Define the specific roles and quantities needed to execute this project.</p>
                    
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 mb-6">
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">Role Needed</label>
                          <select value={roleInput} onChange={e => setRoleInput(e.target.value)} className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#2563EB]">
                            <option value="">Select a role...</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Full Stack Intern">Full Stack Intern</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[12px] font-bold text-[#0F172A] mb-1.5">Quantity</label>
                          <input type="number" min="1" value={qtyInput} onChange={e => setQtyInput(parseInt(e.target.value))} className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-[13px] outline-none focus:border-[#2563EB]" />
                        </div>
                        <button onClick={handleAddRoleRequest} className="bg-[#0F172A] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#334155] transition-colors h-[38px]">
                          Add Request
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {newProject.requestedRoles.map((req, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px] text-[#2563EB]">person_search</span>
                            <span className="text-[14px] font-bold text-[#0F172A]">{req.role}</span>
                          </div>
                          <span className="text-[12px] font-bold text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full">Qty: {req.qty}</span>
                        </div>
                      ))}
                      {newProject.requestedRoles.length === 0 && (
                        <div className="text-center py-6 text-[13px] font-medium text-[#94A3B8] border-2 border-dashed border-[#E2E8F0] rounded-xl">
                          No resource requests added yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Team Assembly */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 h-full flex flex-col">
                    <div>
                      <h3 className="text-[18px] font-bold text-[#0F172A] mb-1">Assemble Isolated Team</h3>
                      <p className="text-[13px] text-[#64748B]">Select employees to fulfill your resource requests. These members will be isolated to this project.</p>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-6 mt-4">
                      {/* Left: Global Pool */}
                      <div className="border border-[#E2E8F0] rounded-2xl flex flex-col overflow-hidden bg-[#F8FAFC]">
                        <div className="p-3 border-b border-[#E2E8F0] bg-white">
                          <h4 className="text-[13px] font-bold text-[#0F172A]">Company Directory</h4>
                        </div>
                        <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar">
                          {AVAILABLE_EMPLOYEES.map(emp => {
                            const isSelected = newProject.selectedTeam.some(m => m.id === emp.id);
                            return (
                              <div key={emp.id} className="flex items-center justify-between p-2.5 bg-white border border-[#E2E8F0] rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${emp.bg} ${emp.text}`}>
                                    {emp.initial}
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{emp.name}</p>
                                    <p className="text-[11px] text-[#64748B]">{emp.role}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => toggleTeamMember(emp)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-[#EF4444] text-white' : 'bg-[#E2E8F0] text-[#475569] hover:bg-[#CBD5E1]'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[16px]">{isSelected ? 'remove' : 'add'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Selected Team */}
                      <div className="border border-[#2563EB] rounded-2xl flex flex-col overflow-hidden bg-[#EFF6FF]">
                        <div className="p-3 border-b border-[#BFDBFE] bg-white">
                          <h4 className="text-[13px] font-bold text-[#1D4ED8] flex justify-between">
                            Isolated Team
                            <span className="bg-[#DBEAFE] px-2 py-0.5 rounded-full">{newProject.selectedTeam.length} Selected</span>
                          </h4>
                        </div>
                        <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar">
                          {newProject.selectedTeam.map(emp => (
                            <div key={emp.id} className="flex items-center gap-3 p-2.5 bg-white border border-[#BFDBFE] rounded-xl shadow-sm">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${emp.bg} ${emp.text}`}>
                                {emp.initial}
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{emp.name}</p>
                                <p className="text-[11px] text-[#64748B]">{emp.role}</p>
                              </div>
                            </div>
                          ))}
                          {newProject.selectedTeam.length === 0 && (
                            <div className="text-center py-10 text-[12px] font-bold text-[#93C5FD]">
                              No members selected yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center shrink-0">
                <button 
                  onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setIsWizardOpen(false)}
                  className="px-5 py-2 border border-[#E2E8F0] bg-white text-[#0F172A] rounded-lg text-[13px] font-bold hover:bg-[#F1F5F9] transition-colors"
                >
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>
                
                {wizardStep < 3 ? (
                  <button 
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="px-5 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-bold hover:bg-[#1D4ED8] transition-colors flex items-center gap-2"
                  >
                    Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <button 
                    onClick={finishWizard}
                    className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-[13px] font-bold hover:bg-[#059669] transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">done_all</span> Launch Isolated Project
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
