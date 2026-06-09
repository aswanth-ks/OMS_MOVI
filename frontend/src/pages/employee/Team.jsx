import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Users, Search, Filter, Grid, List as ListIcon, 
  Mail, CalendarDays, X, ChevronRight, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const mockProjects = [
  { _id: 'proj001', name: 'OWMS Internal Platform v2' },
  { _id: 'proj002', name: 'Data Pipeline Automation' },
];

const mockTeam = [
  {
    _id: "tm001",
    name: "Sarah Connor",
    avatar: "SC",
    role: "Admin",
    designation: "Product Manager",
    department: "Product",
    email: "sarah.connor@movicloudlabs.com",
    sharedProjects: ['OWMS Internal Platform v2'],
    color: "bg-blue-600",
    joinDate: "2022-01-15T00:00:00Z"
  },
  {
    _id: "tm002",
    name: "John Doe",
    avatar: "JD",
    role: "employee",
    designation: "Developer",
    department: "Engineering",
    email: "john.doe@movicloudlabs.com",
    sharedProjects: ['Data Pipeline Automation'],
    color: "bg-purple-600",
    joinDate: "2023-05-10T00:00:00Z"
  },
  {
    _id: "tm003",
    name: "Aswanth K",
    avatar: "AK",
    role: "pmo",
    designation: "PMO Lead",
    department: "Management",
    email: "aswanth.k@movicloudlabs.com",
    sharedProjects: ['OWMS Internal Platform v2', 'Data Pipeline Automation'],
    color: "bg-emerald-600",
    joinDate: "2021-11-20T00:00:00Z"
  },
  {
    _id: "tm004",
    name: "Rahul Mehta",
    avatar: "RM",
    role: "intern",
    designation: "Intern",
    department: "Engineering",
    email: "rahul.mehta@intern.movicloudlabs.com",
    sharedProjects: ['OWMS Internal Platform v2'],
    color: "bg-amber-600",
    joinDate: "2024-09-01T00:00:00Z"
  },
  {
    _id: "tm005",
    name: "Neha Sharma",
    avatar: "NS",
    role: "intern",
    designation: "Intern",
    department: "Design",
    email: "neha.sharma@intern.movicloudlabs.com",
    sharedProjects: ['Data Pipeline Automation'],
    color: "bg-pink-600",
    joinDate: "2024-08-15T00:00:00Z"
  },
  {
    _id: "tm006",
    name: "Sarah Johnson",
    avatar: "SJ",
    role: "hr",
    designation: "HR Manager",
    department: "Human Resources",
    email: "sarah.johnson@movicloudlabs.com",
    sharedProjects: ['OWMS Internal Platform v2'],
    color: "bg-rose-600",
    joinDate: "2020-03-10T00:00:00Z"
  }
];

// --- SUB-COMPONENTS ---
const ProfileModal = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header Cover */}
          <div className="h-24 bg-[#1E293B] relative flex justify-end p-3">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-xl ${member.color} text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm absolute -top-10`}>
              {member.avatar}
            </div>
            
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#0F172A]">{member.name}</h2>
                {member.role === 'intern' && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Intern</span>
                )}
                {member.role !== 'intern' && (
                  <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{member.role}</span>
                )}
              </div>
              <p className="text-sm text-[#64748B] mb-4">{member.designation} &middot; {member.department}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-[#0F172A] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <Mail size={16} className="text-[#64748B]" />
                  <span className="font-medium">{member.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-[#0F172A] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <CalendarDays size={16} className="text-[#64748B]" />
                  <span className="font-medium">Joined {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Shared Projects</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.sharedProjects.map((p, idx) => (
                      <span key={idx} className="text-[11px] font-bold bg-white border border-[#E2E8F0] text-[#0F172A] px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                        <Briefcase size={12} className="text-[#64748B]" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <p className="text-[11px] text-center text-[#64748B]">To update contact info, please reach out to HR.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


export default function EmployeeTeam() {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [selectedMember, setSelectedMember] = useState(null);

  const filteredTeam = mockTeam.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || 
                          member.email.toLowerCase().includes(search.toLowerCase());
    const matchesProject = projectFilter === 'All Projects' || member.sharedProjects.includes(projectFilter);
    return matchesSearch && matchesProject;
  });

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-8 font-sans px-4 sm:px-6 mt-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">My Team</h1>
            <p className="text-sm text-[#64748B] mt-1">{mockTeam.length} colleagues across {mockProjects.length} projects</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full sm:w-auto text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#2563EB] font-medium text-[#0F172A]"
            >
              <option value="All Projects">All Projects</option>
              {mockProjects.map(p => (
                <option key={p._id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] shrink-0">
              <button 
                onClick={() => setView('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'grid' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          <input 
            type="text" 
            placeholder="Search teammates by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all bg-white shadow-sm"
          />
        </div>

        {/* CONTENT */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeam.map(member => (
              <div key={member._id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${member.color} text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm`}>
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A]">{member.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {member.role === 'intern' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700">Intern</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 border border-[#E2E8F0] text-[#64748B]">{member.designation}</span>
                      )}
                      <span className="text-[10px] text-[#64748B]">{member.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Shared Projects</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.sharedProjects.slice(0, 2).map((p, idx) => (
                      <span key={idx} className="text-[11px] font-semibold bg-[#F1F5F9] text-[#0F172A] px-2 py-1 rounded truncate max-w-full">
                        {p}
                      </span>
                    ))}
                    {member.sharedProjects.length > 2 && (
                      <span className="text-[11px] font-bold bg-[#E2E8F0] text-[#64748B] px-2 py-1 rounded">
                        +{member.sharedProjects.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#64748B] truncate mb-4">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>

                <button 
                  onClick={() => setSelectedMember(member)}
                  className="w-full py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold text-sm rounded-lg hover:bg-[#E2E8F0] transition-colors"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Teammate</th>
                    <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Designation & Dept</th>
                    <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Shared Projects</th>
                    <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Email</th>
                    <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeam.map(member => (
                    <tr key={member._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                            {member.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">{member.name}</p>
                            {member.role === 'intern' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 mt-0.5 inline-block">Intern</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[#0F172A]">{member.designation}</p>
                        <p className="text-xs text-[#64748B]">{member.department}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          {member.sharedProjects.map((p, idx) => (
                            <span key={idx} className="text-xs text-[#0F172A] line-clamp-1">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <Mail size={14} /> {member.email}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => setSelectedMember(member)}
                          className="text-[#2563EB] hover:bg-[#EFF6FF] px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      <ProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </PageWrapper>
  );
}
