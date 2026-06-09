import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { 
  Users, CalendarDays, CheckSquare, ChevronRight, X, AlertCircle, Circle, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const mockProjects = [
  {
    _id: "proj001",
    name: "OWMS Internal Platform v2",
    status: "Active",
    priority: "High",
    description: "A massive internal refactoring project to upgrade legacy systems to the new React 18 architecture, implement full access control, and enhance the UI/UX.",
    role: "Developer",
    myTasks: { done: 8, total: 12 },
    stats: { team: 6, due: "Nov 30, 2026", pm: "Aswanth K", hr: "Sarah Johnson" },
    health: "On Track",
    milestones: [
      { title: "Design Sign-off", date: "Sep 15, 2026", status: "completed" },
      { title: "Frontend Core Framework", date: "Oct 10, 2026", status: "completed" },
      { title: "Authentication Module", date: "Oct 25, 2026", status: "current" },
      { title: "Beta Release", date: "Nov 15, 2026", status: "upcoming" }
    ],
    team: [
      { name: "Aswanth K", role: "PMO Lead", avatar: "AK", color: "bg-purple-600" },
      { name: "Alex Wong", role: "Developer", avatar: "AW", color: "bg-blue-600" },
      { name: "Sarah Connor", role: "Product Manager", avatar: "SC", color: "bg-emerald-600" },
      { name: "Rahul Mehta", role: "Intern", avatar: "RM", color: "bg-amber-600" }
    ],
    tasks: [
      { title: "Build Login Page UI", status: "In Progress", due: "Today" },
      { title: "API Integration for Auth", status: "Todo", due: "Today" },
      { title: "Setup Redux Store", status: "Done", due: "Last Week" }
    ]
  },
  {
    _id: "proj002",
    name: "Data Pipeline Automation",
    status: "Active",
    priority: "Medium",
    description: "Automate the daily ETL pipelines that ingest CRM data into the central data warehouse, reducing manual overhead and fixing memory leaks.",
    role: "Lead Developer",
    myTasks: { done: 15, total: 45 },
    stats: { team: 4, due: "Dec 15, 2026", pm: "John Smith", hr: "Sarah Johnson" },
    health: "At Risk",
    milestones: [
      { title: "Architecture Review", date: "Oct 01, 2026", status: "completed" },
      { title: "ETL Script Refactor", date: "Oct 20, 2026", status: "current" },
      { title: "Load Testing", date: "Nov 10, 2026", status: "upcoming" }
    ],
    team: [
      { name: "John Smith", role: "PMO Lead", avatar: "JS", color: "bg-purple-600" },
      { name: "Alex Wong", role: "Lead Developer", avatar: "AW", color: "bg-blue-600" },
      { name: "John Doe", role: "Developer", avatar: "JD", color: "bg-slate-600" }
    ],
    tasks: [
      { title: "Data Ingestion Script", status: "In Review", due: "Oct 25" },
      { title: "Fix Pipeline Memory Leak", status: "Blocked", due: "Oct 05" }
    ]
  },
  {
    _id: "proj003",
    name: "CRM Module",
    status: "Planning",
    priority: "Low",
    description: "Initial planning and requirements gathering phase for the new CRM integration module.",
    role: "Developer",
    myTasks: { done: 0, total: 5 },
    stats: { team: 3, due: "Jan 10, 2027", pm: "Aswanth K", hr: "Sarah Johnson" },
    health: "On Track",
    milestones: [
      { title: "Requirements Gathering", date: "Oct 30, 2026", status: "current" },
      { title: "DB Schema Design", date: "Nov 15, 2026", status: "upcoming" }
    ],
    team: [
      { name: "Aswanth K", role: "PMO Lead", avatar: "AK", color: "bg-purple-600" },
      { name: "Alex Wong", role: "Developer", avatar: "AW", color: "bg-blue-600" }
    ],
    tasks: [
      { title: "Review CRM APIs", status: "Todo", due: "Oct 20" },
      { title: "Draft Data Models", status: "Todo", due: "Oct 28" }
    ]
  }
];

// --- SUB-COMPONENTS ---
const ProjectDrawer = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <button onClick={onClose} className="absolute top-5 right-5 text-[#64748B] hover:bg-[#E2E8F0] p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${project.status === 'Active' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-slate-200 text-slate-700'}`}>
                  {project.status}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${project.priority === 'High' || project.priority === 'Critical' ? 'bg-red-100 text-red-700' : project.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {project.priority} Priority
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-[#0F172A] leading-tight pr-10 mb-1">{project.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-[#EFF6FF] text-[#2563EB] font-bold px-2 py-0.5 rounded">Role: {project.role}</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Description</h4>
                <p className="text-sm text-[#0F172A] leading-relaxed">{project.description}</p>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-4">Milestones</h4>
                <div className="relative border-l-2 border-[#E2E8F0] ml-2 space-y-5">
                  {project.milestones.map((ms, idx) => (
                    <div key={idx} className="relative pl-5">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${ms.status === 'completed' ? 'bg-[#16A34A]' : ms.status === 'current' ? 'bg-[#2563EB] ring-2 ring-blue-100' : 'bg-[#CBD5E1]'}`} />
                      <div>
                        <p className={`text-sm font-bold ${ms.status === 'upcoming' ? 'text-[#64748B]' : 'text-[#0F172A]'}`}>{ms.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{ms.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Tasks Snapshot */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-3">My Tasks</h4>
                <div className="space-y-2">
                  {project.tasks.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckSquare size={16} className={t.status === 'Done' ? 'text-[#16A34A]' : 'text-[#94A3B8]'} />
                        <span className={`text-sm font-medium ${t.status === 'Done' ? 'text-[#64748B] line-through' : 'text-[#0F172A]'}`}>{t.title}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{t.status}</span>
                        <span className="text-[10px] text-[#64748B] mt-1">{t.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Snapshot */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-3">Team Snapshot</h4>
                <div className="space-y-3">
                  {project.team.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${user.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0F172A]">{user.name}</p>
                        <p className="text-xs text-[#64748B]">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Management Contacts */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-3">Contacts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Project Manager:</span>
                    <span className="font-semibold text-[#0F172A]">{project.stats.pm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">HR Manager:</span>
                    <span className="font-semibold text-[#0F172A]">{project.stats.hr}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


export default function EmployeeProjects() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);

  const getHealthColor = (health) => {
    switch (health) {
      case 'On Track': return 'text-[#16A34A]';
      case 'At Risk': return 'text-[#D97706]';
      case 'Delayed': return 'text-[#DC2626]';
      default: return 'text-[#64748B]';
    }
  };

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-8 font-sans px-4 sm:px-6 mt-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Projects</h1>
          <p className="text-sm text-[#64748B] mt-1">{mockProjects.length} active projects assigned to you</p>
        </div>

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {mockProjects.map(proj => (
            <div key={proj._id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Header section */}
              <div 
                className="p-6 cursor-pointer group hover:bg-[#F8FAFC] transition-colors border-b border-[#E2E8F0]"
                onClick={() => setSelectedProject(proj)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1 pr-4">{proj.name}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${proj.status === 'Active' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-slate-100 text-slate-600'}`}>{proj.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${proj.priority === 'High' || proj.priority === 'Critical' ? 'bg-red-50 text-red-600' : proj.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                    {proj.priority} Priority
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB]">
                    My Role: {proj.role}
                  </div>
                </div>

                <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Progress & Stats section */}
              <div className="p-6 bg-white flex-1 flex flex-col justify-between">
                
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5"><CheckSquare size={14} className="text-[#64748B]" /> My Tasks</span>
                    <span className="text-xs font-bold text-[#2563EB]">{proj.myTasks.done}/{proj.myTasks.total} done</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${proj.myTasks.total > 0 ? (proj.myTasks.done/proj.myTasks.total)*100 : 0}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#64748B] mb-5">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} /> <span>{proj.stats.team} members</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} /> <span>Due: {proj.stats.due}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <span>PM: {proj.stats.pm}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] font-medium">Health:</span>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Circle size={10} className={`fill-current ${getHealthColor(proj.health)}`} />
                      <span className={getHealthColor(proj.health)}>{proj.health}</span>
                    </div>
                  </div>
                  
                  {proj.health === 'At Risk' && <AlertCircle size={16} className="text-[#D97706]" />}
                  {proj.health === 'Delayed' && <AlertCircle size={16} className="text-[#DC2626]" />}
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="flex border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <button 
                  onClick={() => navigate('/employee/tasks')}
                  className="flex-1 py-3 text-sm font-bold text-[#0F172A] hover:text-[#2563EB] hover:bg-white transition-colors border-r border-[#E2E8F0] flex items-center justify-center gap-2"
                >
                  <CheckSquare size={16} /> View My Tasks
                </button>
                <button 
                  onClick={() => navigate('/employee/team')}
                  className="flex-1 py-3 text-sm font-bold text-[#0F172A] hover:text-[#2563EB] hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <Users size={16} /> View Team
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
    </PageWrapper>
  );
}
