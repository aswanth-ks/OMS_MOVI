import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { TaskDetailModal } from '../../components/pmo/TaskDetailModal';
import { GraduationCap, X } from 'lucide-react';

// --- MOCK DATA ---
const PROJECTS = [
  { id: 'p1', name: 'Cloud Migration Phase 2' },
  { id: 'p2', name: 'Internal Tools v3.0' },
  { id: 'p3', name: 'Q3 Financial Reporting' }
];

const INITIAL_TASKS = [
  { id: 't1', title: 'Setup AWS RDS Instances', projectId: 'p1', assignees: [{ initial: 'S', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]' }], priority: 'critical', status: 'in-progress', effort: '8 pts', blocked: false },
  { id: 't2', title: 'Migrate User Data table', projectId: 'p1', assignees: [{ initial: 'M', bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]' }], priority: 'high', status: 'backlog', effort: '5 pts', blocked: true },
  { id: 't3', title: 'Update internal dashboard UI', projectId: 'p2', assignees: [{ initial: 'A', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' }], priority: 'medium', status: 'qa', effort: '3 pts', blocked: false },
  { id: 't4', title: 'Generate PDF reports', projectId: 'p3', assignees: [{ initial: 'S', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]' }], priority: 'high', status: 'completed', effort: '5 pts', blocked: false },
  { id: 't5', title: 'Configure VPC Peering', projectId: 'p1', assignees: [{ initial: 'A', bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' }], priority: 'high', status: 'qa', effort: '3 pts', blocked: false },
];

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'border-l-[#64748B]' },
  { id: 'in-progress', title: 'In Progress', color: 'border-l-[#2563EB]' },
  { id: 'qa', title: 'QA / Review', color: 'border-l-[#F59E0B]' },
  { id: 'completed', title: 'Completed', color: 'border-l-[#10B981]' },
];

const PRIORITY_STYLES = {
  low: { icon: 'keyboard_arrow_down', color: 'text-[#64748B]', bg: 'bg-[#F1F5F9]' },
  medium: { icon: 'drag_handle', color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]' },
  high: { icon: 'keyboard_arrow_up', color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]' },
  critical: { icon: 'priority_high', color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' },
};

export default function PMOTaskBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState('p1');
  const [selectedTask, setSelectedTask] = useState(null);
  const [internAssignTask, setInternAssignTask] = useState(null);

  // Drag and Drop
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      setTasks(prev => prev.map(t => t.id === draggedTask.id ? { ...t, status: targetStatus } : t));
    }
    setDraggedTask(null);
  };

  const projectTasks = tasks.filter(t => t.projectId === selectedProject);

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-[calc(100vh-100px)] overflow-hidden gap-6 max-w-[1600px] mx-auto pb-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 shrink-0">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Project Task Board</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Manage deliverables, track effort, and clear blockers for your active projects.
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">folder</span>
              <select 
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[13px] font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 shadow-sm appearance-none cursor-pointer"
              >
                {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px] pointer-events-none">expand_more</span>
            </div>

            <button className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Task
            </button>
          </div>
        </div>

        {/* BOARD WRAPPER */}
        <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 pt-2">
          {COLUMNS.map(col => {
            const columnTasks = projectTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="w-[320px] shrink-0 flex flex-col bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className={`px-4 py-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between border-l-4 ${col.color}`}>
                  <h3 className="text-[14px] font-bold text-[#0F172A]">{col.title}</h3>
                  <div className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[12px] font-bold text-[#64748B]">
                    {columnTasks.length}
                  </div>
                </div>

                {/* Column Body */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                  {columnTasks.map(task => {
                    const pStyles = PRIORITY_STYLES[task.priority];
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => setSelectedTask(task)}
                        className={`bg-white p-4 rounded-xl shadow-sm border transition-all cursor-pointer group relative ${task.blocked ? 'border-[#FCA5A5] bg-[#FEF2F2]/50 hover:border-[#EF4444]' : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-md'}`}
                      >
                        {/* Assign to Intern Button (Hover) */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setInternAssignTask(task); }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-[#E2E8F0] rounded-full shadow-sm items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors hidden group-hover:flex z-10"
                          title="Assign to Intern"
                        >
                          <GraduationCap size={16} />
                        </button>

                        {/* Tags */}
                        <div className="flex justify-between items-start mb-3">
                          <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${pStyles.bg} ${pStyles.color}`}>
                            <span className="material-symbols-outlined text-[12px]">{pStyles.icon}</span>
                            {task.priority}
                          </div>
                          
                          {task.blocked && (
                            <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EF4444] text-white flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-[12px]">block</span>
                              Blocked
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug mb-4">{task.title}</h4>

                        {/* Footer */}
                        <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[14px]">psychiatry</span>
                            {task.effort}
                          </div>
                          
                          <div className="flex -space-x-1.5">
                            {task.assignees.map((a, i) => (
                              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white relative z-[${10-i}] ${a.bg} ${a.text}`}>
                                {a.initial}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  {columnTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-[12px] font-semibold text-[#94A3B8]">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {internAssignTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Assign to Intern</h3>
              <button onClick={() => setInternAssignTask(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-600 mb-2">Select an intern to assign to <strong>{internAssignTask.title}</strong>.</p>
              <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600">
                <option>Select an intern...</option>
                <option>Rahul Mehta (NIT Trichy)</option>
                <option>Ananya Iyer (VIT Vellore)</option>
              </select>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setInternAssignTask(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={() => setInternAssignTask(null)} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg">Assign</button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
}
