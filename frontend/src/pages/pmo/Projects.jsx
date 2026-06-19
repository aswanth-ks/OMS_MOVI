import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { Eye, Plus, Calendar, User, Layers } from 'lucide-react';
import { pmoAPI, adminAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function PMOProjects() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Active');
  const [search, setSearch] = useState('');
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    department: '',
    requestedRoles: [],
    selectedTeam: [],
    hrRep: ''
  });
  
  // Temporary state for the wizard inputs
  const [roleInput, setRoleInput] = useState('');
  const [qtyInput, setQtyInput] = useState(1);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const projRes = await pmoAPI.getProjects();
      setProjects(projRes.data.data || []);
      
      const empRes = await pmoAPI.getAvailableMembers();
      setAvailableEmployees(empRes.data.data || []);
      
      try {
        const deptRes = await adminAPI.getDepartments();
        setDepartments(deptRes.data.data || []);
      } catch (deptErr) {
        // Fallback if the user does not have permission to view all departments
        if (currentUser?.department) {
          setDepartments([currentUser.department]);
        }
      }
    } catch (err) {
      toast.error('Failed to load projects or resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await pmoAPI.getProjects();
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error('Failed to reload projects');
    }
  };

  // Filter available employees for HR
  const hrRepresentatives = availableEmployees.filter(emp => 
    emp.designation?.toLowerCase().includes('hr') || 
    emp.role?.slug === 'hr-manager'
  );

  // Filter non-HR employees for project assembly
  const projectAssemblyPool = availableEmployees.filter(emp => 
    !emp.designation?.toLowerCase().includes('hr') && 
    emp.role?.slug !== 'hr-manager'
  );

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.code?.toLowerCase().includes(search.toLowerCase());
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
      const isSelected = prev.selectedTeam.find(m => m._id === emp._id);
      if (isSelected) {
        return { ...prev, selectedTeam: prev.selectedTeam.filter(m => m._id !== emp._id) };
      } else {
        return { ...prev, selectedTeam: [...prev.selectedTeam, emp] };
      }
    });
  };

  const finishWizard = async () => {
    if (!newProject.name) {
      toast.error('Project Name is required.');
      return;
    }

    const resolvedDept = newProject.department || (departments[0]?._id || departments[0]);
    if (!resolvedDept) {
      toast.error('Project Department is required.');
      return;
    }

    try {
      // 1. Create project
      const projectPayload = {
        name: newProject.name,
        description: newProject.description,
        department: resolvedDept,
        priority: newProject.priority,
        endDate: newProject.dueDate ? new Date(newProject.dueDate) : undefined,
      };
      
      const res = await pmoAPI.createProject(projectPayload);
      const createdProject = res.data.data;
      
      // 2. Build complete team payload (selected members + HR rep if assigned)
      const teamMembers = newProject.selectedTeam.map(emp => ({
        userId: emp._id,
        role: emp.designation || 'Developer'
      }));

      if (newProject.hrRep) {
        teamMembers.push({
          userId: newProject.hrRep,
          role: 'HR Representative'
        });
      }
      
      if (teamMembers.length > 0) {
        await pmoAPI.addProjectTeam(createdProject._id, teamMembers);
      }
      
      toast.success('Project created and team assembled successfully!');
      setIsWizardOpen(false);
      setWizardStep(1);
      
      // Reset state
      setNewProject({
        name: '',
        code: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        department: '',
        requestedRoles: [],
        selectedTeam: [],
        hrRep: ''
      });
      
      // Reload projects list
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            onClick={() => {
              if (departments.length > 0 && !newProject.department) {
                setNewProject(prev => ({ ...prev, department: departments[0]._id || departments[0] }));
              }
              setIsWizardOpen(true);
            }}
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
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map(p => {
              let healthColor = 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]';
              if (p.healthStatus === 'On Track') healthColor = 'text-[#10B981] bg-[#ECFDF5] border-[#D1FAE5]';
              else if (p.healthStatus === 'At Risk') healthColor = 'text-[#F59E0B] bg-[#FFFBEB] border-[#FEF3C7]';
              else if (p.healthStatus === 'Delayed') healthColor = 'text-[#EF4444] bg-[#FEF2F2] border-[#FEE2E2]';

              let progressBarColor = 'bg-[#2563EB]';
              if (p.healthStatus === 'On Track') progressBarColor = 'bg-[#10B981]';
              else if (p.healthStatus === 'At Risk') progressBarColor = 'bg-[#F59E0B]';
              else if (p.healthStatus === 'Delayed') progressBarColor = 'bg-[#EF4444]';

              return (
                <div key={p._id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer text-left">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md w-fit border border-[#E2E8F0]">{p.code}</span>
                        <h3 className="text-[16px] font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors">{p.name}</h3>
                      </div>
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-full border ${healthColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {p.healthStatus || 'Planning'}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#64748B] leading-relaxed mb-6 line-clamp-2 flex-1">{p.description || 'No description provided.'}</p>
                    <div className="mb-6">
                      <div className="flex justify-between text-[11px] font-bold text-[#0F172A] mb-2">
                        <span>Progress</span><span>{p.completionPercent || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className={`h-full ${progressBarColor} rounded-full transition-all`} style={{ width: `${p.completionPercent || 0}%` }} />
                      </div>
                    </div>
                    <div className="pt-5 border-t border-[#F1F5F9] flex items-center justify-between mt-auto">
                      <div className="flex -space-x-2">
                        {p.team && p.team.slice(0, 4).map((member, i) => {
                          const name = member.user?.name || 'Unknown';
                          const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                          return (
                            <div 
                              key={member.user?._id || i} 
                              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-[11px] bg-[#EFF6FF] text-[#1D4ED8]"
                              title={`${name} (${member.role})`}
                            >
                              {initial}
                            </div>
                          );
                        })}
                        {p.team && p.team.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] bg-slate-100 text-slate-600">
                            +{p.team.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0]">
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          {formatDate(p.endDate)}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/pmo/projects/${p._id}`); }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] hover:bg-[#EFF6FF] border border-transparent hover:border-[#BFDBFE] px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <p className="text-[#64748B] font-medium">No projects found matching the filters.</p>
              </div>
            )}
          </div>
        )}

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
                  <div className="space-y-6 animate-in slide-in-from-right-4 text-left">
                    <h3 className="text-[18px] font-bold text-[#0F172A] mb-4">Project Foundation</h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Project Name</label>
                        <input type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB]" placeholder="e.g. Website Redesign" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5">Department</label>
                        <select 
                          value={newProject.department} 
                          onChange={e => setNewProject({...newProject, department: e.target.value})} 
                          className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] cursor-pointer"
                        >
                          {departments.map(d => (
                            <option key={d._id || d} value={d._id || d}>{d.name || d}</option>
                          ))}
                        </select>
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
                        <select 
                          value={newProject.hrRep} 
                          onChange={e => setNewProject({...newProject, hrRep: e.target.value})} 
                          className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[14px] outline-none focus:border-[#2563EB] cursor-pointer"
                        >
                          <option value="">Select an HR Rep...</option>
                          {hrRepresentatives.map(hr => (
                            <option key={hr._id} value={hr._id}>{hr.name} ({hr.designation || 'HR'})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Resource Request */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 text-left">
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
                  <div className="space-y-6 animate-in slide-in-from-right-4 h-full flex flex-col text-left">
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
                        <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar max-h-[300px]">
                          {projectAssemblyPool.map(emp => {
                            const isSelected = newProject.selectedTeam.some(m => m._id === emp._id);
                            const initial = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                              <div key={emp._id} className="flex items-center justify-between p-2.5 bg-white border border-[#E2E8F0] rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] bg-purple-100 text-purple-700">
                                    {initial}
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{emp.name}</p>
                                    <p className="text-[11px] text-[#64748B]">{emp.designation || emp.role?.name}</p>
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
                        <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar max-h-[300px]">
                          {newProject.selectedTeam.map(emp => {
                            const initial = emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                              <div key={emp._id} className="flex items-center gap-3 p-2.5 bg-white border border-[#BFDBFE] rounded-xl shadow-sm">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] bg-blue-100 text-blue-700">
                                  {initial}
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{emp.name}</p>
                                  <p className="text-[11px] text-[#64748B]">{emp.designation || emp.role?.name}</p>
                                </div>
                              </div>
                            );
                          })}
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
