import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Columns, List, CalendarDays, RefreshCw, Eye, X, CheckCircle, 
  Paperclip, MessageSquare, Download, UploadCloud, Search, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const mockProjects = [
  { _id: 'proj001', name: 'OWMS Internal Platform v2' },
  { _id: 'proj002', name: 'Data Pipeline Automation' },
];

const mockTasks = [
  {
    _id: "task001",
    title: "Build Login Page UI",
    description: "Create the login page for OWMS using React 18 and Tailwind CSS.",
    project: mockProjects[0],
    assignedBy: { _id: "pmo001", name: "Aswanth K", role: "PMO Lead", avatar: "AK" },
    assignedTo: "emp001",
    sharedWith: [
      { name: "Sarah Connor", avatar: "SC" }
    ],
    priority: "High",
    status: "In Progress",
    effortPoints: 5,
    dueDate: "2024-10-15T23:59:59Z",
    subtasks: [
      { _id: "sub001", title: "Design mobile layout", completed: true, assignedTo: "emp001" },
      { _id: "sub002", title: "Add form validation", completed: false, assignedTo: "emp001" },
    ],
    comments: [
      { _id: "com001", author: { name: "Aswanth K", avatar: "AK" }, text: "Make sure to follow the design system", createdAt: "2024-10-10T10:00:00Z" },
    ],
    attachments: [],
    createdAt: "2024-10-08T09:00:00Z",
    blocked: false,
    overdue: false
  },
  {
    _id: "task002",
    title: "API Integration for Auth",
    description: "Connect the login form to the backend JWT authentication endpoints.",
    project: mockProjects[0],
    assignedBy: { _id: "pmo001", name: "Aswanth K", role: "PMO Lead", avatar: "AK" },
    assignedTo: "emp001",
    sharedWith: [],
    priority: "Critical",
    status: "Todo",
    effortPoints: 8,
    dueDate: "2024-10-12T23:59:59Z",
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: "2024-10-10T09:00:00Z",
    blocked: false,
    overdue: true
  },
  {
    _id: "task003",
    title: "Data Ingestion Script",
    description: "Write Python script to ingest CRM data into data warehouse.",
    project: mockProjects[1],
    assignedBy: { _id: "pmo002", name: "John Smith", role: "PMO Lead", avatar: "JS" },
    assignedTo: "emp001",
    sharedWith: [
      { name: "John Doe", avatar: "JD" }
    ],
    priority: "Medium",
    status: "In Review",
    effortPoints: 13,
    dueDate: "2024-10-25T23:59:59Z",
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: "2024-10-09T09:00:00Z",
    blocked: false,
    overdue: false
  },
  {
    _id: "task004",
    title: "Fix Pipeline Memory Leak",
    description: "Resolve memory issues during massive ETL runs.",
    project: mockProjects[1],
    assignedBy: { _id: "pmo002", name: "John Smith", role: "PMO Lead", avatar: "JS" },
    assignedTo: "emp001",
    sharedWith: [],
    priority: "High",
    status: "Blocked",
    effortPoints: 5,
    dueDate: "2024-10-05T23:59:59Z",
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: "2024-10-01T09:00:00Z",
    blocked: true,
    overdue: true
  }
];

const COLUMNS = [
  { id: 'Todo', title: 'Todo', color: 'border-l-slate-500' },
  { id: 'In Progress', title: 'In Progress', color: 'border-l-blue-600' },
  { id: 'In Review', title: 'In Review', color: 'border-l-purple-600' },
  { id: 'Done', title: 'Done', color: 'border-l-green-600' }
];

const PRIORITY_STYLES = {
  Low: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  Medium: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  High: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  Critical: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const formatDate = (isoStr) => {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRelativeTime = (isoStr) => {
  const date = new Date(isoStr);
  const now = new Date('2024-10-12T00:00:00Z');
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// --- SUB-COMPONENTS ---
const TaskDetailModal = ({ task, onClose, onStatusChange }) => {
  const [commentText, setCommentText] = useState('');
  
  if (!task) return null;

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
              <button onClick={onClose} className="absolute top-5 right-5 text-[#64748B] hover:bg-[#E2E8F0] p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${PRIORITY_STYLES[task.priority].color}`}>
                  {task.priority} Priority
                </span>
                {task.status === 'Blocked' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-100 text-red-700">Blocked</span>
                )}
                {task.status !== 'Blocked' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">{task.status}</span>
                )}
                {task.overdue && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-500 text-white animate-pulse">Overdue</span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-[#0F172A] leading-tight pr-10">{task.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-[#EFF6FF] text-[#2563EB] font-bold px-2 py-0.5 rounded">{task.project.name}</span>
                <span className="text-sm text-[#64748B]">Assigned by {task.assignedBy.name}</span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col sm:flex-row">
              
              {/* LEFT MAIN CONTENT */}
              <div className="flex-1 p-6 space-y-8">
                
                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Description</h4>
                  <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>

                {/* Subtasks */}
                {task.subtasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase">Subtasks</h4>
                      <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-2 py-0.5 rounded-full">
                        {completedSubtasks}/{task.subtasks.length}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {task.subtasks.map(sub => (
                         <div key={sub._id} className="flex items-start gap-3 p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors group">
                           <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${sub.completed ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#CBD5E1] group-hover:border-[#2563EB]'}`}>
                             {sub.completed && <CheckSquare size={14} />}
                           </div>
                           <div className="flex-1 flex justify-between items-center">
                             <span className={`text-sm ${sub.completed ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]'}`}>{sub.title}</span>
                             {(!sub.assignedTo || sub.assignedTo !== 'emp001') && !sub.completed && (
                               <button className="text-[10px] font-bold text-[#2563EB] hover:underline px-2 py-1 rounded bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity">Assign to Me</button>
                             )}
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-3">Attachments</h4>
                  {task.attachments.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {task.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                              <Paperclip size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0F172A]">{att.name}</p>
                              <p className="text-xs text-[#64748B]">{att.size}</p>
                            </div>
                          </div>
                          <button className="text-[#64748B] hover:text-[#2563EB] p-1.5 rounded-full hover:bg-[#E2E8F0] transition-colors">
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#64748B] italic mb-3">No attachments</p>
                  )}
                  <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-[#CBD5E1] text-[#64748B] rounded-xl hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors text-sm font-medium">
                    <UploadCloud size={16} /> Upload File
                  </button>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-4">Activity & Comments</h4>
                  <div className="space-y-4 mb-4">
                    {task.comments.length > 0 ? task.comments.map(comment => (
                      <div key={comment._id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {comment.author.avatar}
                        </div>
                        <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-tr-xl rounded-b-xl">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-bold text-[#0F172A]">{comment.author.name}</span>
                            <span className="text-xs text-[#64748B]">{getRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-[#0F172A]">{comment.text}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-[#64748B] italic text-center py-4 bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">No comments yet</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      AW
                    </div>
                    <div className="flex-1 relative">
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..." 
                        rows="2"
                        className="w-full text-sm p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
                      />
                      <button 
                        disabled={!commentText.trim()}
                        className="absolute right-2 bottom-2 p-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT SIDEBAR (Task Meta) */}
              <div className="w-full sm:w-[180px] bg-[#F8FAFC] border-t sm:border-t-0 sm:border-l border-[#E2E8F0] p-6 space-y-6">
                
                {/* Due Date */}
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Due Date</h4>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${task.overdue ? 'text-red-600' : 'text-[#0F172A]'}`}>
                    <CalendarDays size={16} className={task.overdue ? 'text-red-600' : 'text-[#64748B]'} />
                    {formatDate(task.dueDate)}
                  </div>
                </div>

                {/* Effort */}
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Effort Estimate</h4>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <div className="w-6 h-6 rounded bg-[#E2E8F0] flex items-center justify-center text-xs">
                      {task.effortPoints}
                    </div>
                    Points
                  </div>
                </div>
                
                {/* Shared With */}
                {task.sharedWith.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-2">Shared With</h4>
                    <div className="flex -space-x-2">
                      {task.sharedWith.map((user, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700" title={user.name}>
                          {user.avatar}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  {task.status !== 'Done' && (
                    <button 
                      onClick={() => {
                        onStatusChange(task._id, 'Done');
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <CheckCircle size={18} />
                      Mark Complete
                    </button>
                  )}
                  {task.status === 'Done' && (
                    <div className="w-full flex flex-col items-center justify-center gap-2 py-3 bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A] rounded-xl text-sm font-bold text-center">
                      <CheckCircle size={20} />
                      Completed
                    </div>
                  )}
                  
                  {task.status !== 'Blocked' && task.status !== 'Done' && (
                    <button 
                      onClick={() => {
                        onStatusChange(task._id, 'Blocked');
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 bg-red-50 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Report Blocker
                    </button>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function EmployeeTasks() {
  const [view, setView] = useState('board'); // 'board' or 'list'
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState(mockTasks);
  const [projectFilter, setProjectFilter] = useState('All Projects');

  const filteredTasks = tasks.filter(task => projectFilter === 'All Projects' || task.project.name === projectFilter);
  const overdueCount = tasks.filter(t => t.overdue && t.status !== 'Done').length;

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
  };

  return (
    <PageWrapper>
      <div className="w-full flex flex-col h-[calc(100vh-64px)] overflow-hidden font-sans pb-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 px-4 sm:px-6 md:px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-3">
              My Tasks
              {overdueCount > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 animate-pulse">
                  {overdueCount} Overdue
                </span>
              )}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">{tasks.length} total assigned tasks across projects</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Project Filter */}
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#2563EB] font-medium text-[#0F172A]"
            >
              <option value="All Projects">All Projects</option>
              {mockProjects.map(p => (
                <option key={p._id} value={p.name}>{p.name}</option>
              ))}
            </select>
            
            <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
              <button 
                onClick={() => setView('board')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'board' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
              >
                <Columns size={16} /> Board
              </button>
              <button 
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
              >
                <List size={16} /> List
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-hidden mt-6 px-4 sm:px-6 md:px-8">
          
          {view === 'board' ? (
            // --- BOARD VIEW ---
            <div className="flex gap-6 h-full overflow-x-auto custom-scrollbar pb-4">
              {COLUMNS.map(col => (
                <div key={col.id} className="w-[300px] sm:w-[320px] shrink-0 flex flex-col h-full bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                  {/* Column Header */}
                  <div className={`p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white rounded-t-2xl border-t-4 ${col.color}`}>
                    <h3 className="font-bold text-[#0F172A]">{col.title}</h3>
                    <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-2.5 py-1 rounded-full">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  
                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {filteredTasks.filter(t => t.status === col.id).map(task => (
                      <div 
                        key={task._id} 
                        onClick={() => setSelectedTask(task)}
                        className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative ${task.overdue ? 'border-red-300 bg-red-50/30' : 'border-[#E2E8F0]'}`}
                      >
                        {task.overdue && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 m-2 animate-pulse" />}
                        {task.status === 'Blocked' && (
                          <div className="absolute top-0 right-0 text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded m-2">BLOCKED</div>
                        )}
                        
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${PRIORITY_STYLES[task.priority].color}`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0F172A] mb-1 leading-tight group-hover:text-[#2563EB] transition-colors pr-4">{task.title}</h4>
                        
                        {/* Show Project explicitly on card */}
                        <div className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded inline-block mb-3 truncate max-w-full">
                          {task.project.name}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                          <div className="flex -space-x-1">
                            <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white relative z-10" title={`Assigned by ${task.assignedBy.name}`}>
                              {task.assignedBy.avatar}
                            </div>
                            {task.sharedWith.map((u, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold border-2 border-white relative z-0">
                                {u.avatar}
                              </div>
                            ))}
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs font-semibold ${task.overdue ? 'text-red-600' : 'text-[#64748B]'}`}>
                            <CalendarDays size={14} />
                            {formatDate(task.dueDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // --- LIST VIEW ---
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-[#E2E8F0] flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-[#F8FAFC] sticky top-0 z-10 border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Priority</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Task</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Project</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Due Date</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Effort</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => (
                      <tr key={task._id} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors ${task.overdue && task.status !== 'Done' ? 'bg-red-50/30' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${PRIORITY_STYLES[task.priority].dot}`} />
                            <span className="text-sm font-medium text-[#0F172A]">{task.priority}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] cursor-pointer" onClick={() => setSelectedTask(task)}>
                            {task.title}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs bg-[#EFF6FF] text-[#2563EB] font-bold px-2 py-0.5 rounded">{task.project.name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className={`text-sm ${task.overdue && task.status !== 'Done' ? 'text-red-600 font-bold' : 'text-[#64748B]'}`}>
                            {formatDate(task.dueDate)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-[#0F172A] flex items-center gap-1.5">
                            <span className="font-bold">{task.effortPoints}</span> <span className="text-xs text-[#64748B]">pts</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {task.status === 'Blocked' ? (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700">Blocked</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">{task.status}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => setSelectedTask(task)}
                            className="text-[#64748B] hover:text-[#2563EB] p-2 rounded-lg hover:bg-[#E2E8F0] transition-colors"
                          >
                            <Eye size={18} />
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
      </div>

      {/* Detail Modal */}
      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onStatusChange={handleStatusChange}
      />

    </PageWrapper>
  );
}
