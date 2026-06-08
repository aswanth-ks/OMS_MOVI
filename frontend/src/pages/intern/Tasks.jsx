import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Columns, List, CalendarDays, RefreshCw, Eye, X, CheckCircle, 
  Paperclip, MessageSquare, Download, UploadCloud, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/intern/tasks?status=all
const mockTasks = [
  {
    _id: "task001",
    title: "Build Login Page UI",
    description: "Create the login page for OWMS using React 18 and Tailwind CSS. Must include email + password fields, validation, and error states.",
    project: { _id: "proj001", name: "OWMS Internal Platform v2" },
    assignedBy: { _id: "pmo001", name: "Aswanth K", role: "PMO Lead", avatar: "AK" },
    assignedTo: "64f1a2b3c4d5e6f7a8b9c0d1",
    priority: "High",
    status: "In Progress",
    effortPoints: 5,
    dueDate: "2024-10-15T23:59:59Z",
    subtasks: [
      { _id: "sub001", title: "Design mobile layout", completed: true },
      { _id: "sub002", title: "Add form validation", completed: false },
      { _id: "sub003", title: "Write unit tests", completed: false },
    ],
    comments: [
      { _id: "com001", author: { _id: "pmo001", name: "Aswanth K", avatar: "AK", role: "PMO Lead" }, text: "Make sure to follow the design system colors", createdAt: "2024-10-10T10:00:00Z" },
      { _id: "com002", author: { _id: "64f1a2b3c4d5e6f7a8b9c0d1", name: "Rahul Mehta", avatar: "RM", role: "Intern" }, text: "Got it, will follow the #2563EB primary color", createdAt: "2024-10-10T10:30:00Z" },
    ],
    attachments: [
      { name: "design-mockup.pdf", size: "2.4 MB", url: "#" }
    ],
    createdAt: "2024-10-08T09:00:00Z",
    blocked: false
  },
  {
    _id: "task002",
    title: "API Integration for Auth",
    description: "Connect the login form to the backend JWT authentication endpoints.",
    project: { _id: "proj001", name: "OWMS Internal Platform v2" },
    assignedBy: { _id: "emp001", name: "Alex Wong", role: "Mentor", avatar: "AW" },
    assignedTo: "64f1a2b3c4d5e6f7a8b9c0d1",
    priority: "Critical",
    status: "Todo",
    effortPoints: 8,
    dueDate: "2024-10-12T23:59:59Z",
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: "2024-10-10T09:00:00Z",
    blocked: false
  },
  {
    _id: "task003",
    title: "Setup CI/CD Pipeline",
    description: "Configure GitHub actions for automated testing and deployment.",
    project: { _id: "proj001", name: "OWMS Internal Platform v2" },
    assignedBy: { _id: "pmo001", name: "Aswanth K", role: "PMO Lead", avatar: "AK" },
    assignedTo: "64f1a2b3c4d5e6f7a8b9c0d1",
    priority: "Medium",
    status: "Blocked",
    effortPoints: 13,
    dueDate: "2024-10-25T23:59:59Z",
    subtasks: [],
    comments: [
      { _id: "com003", author: { _id: "64f1a2b3c4d5e6f7a8b9c0d1", name: "Rahul Mehta", avatar: "RM", role: "Intern" }, text: "I need AWS access keys to proceed.", createdAt: "2024-10-11T14:00:00Z" }
    ],
    attachments: [],
    createdAt: "2024-10-09T09:00:00Z",
    blocked: true
  },
  {
    _id: "task004",
    title: "Fix Navbar Responsive Issue",
    description: "The navbar breaks on screens smaller than 768px.",
    project: { _id: "proj001", name: "OWMS Internal Platform v2" },
    assignedBy: { _id: "emp001", name: "Alex Wong", role: "Mentor", avatar: "AW" },
    assignedTo: "64f1a2b3c4d5e6f7a8b9c0d1",
    priority: "Medium",
    status: "In Review",
    effortPoints: 3,
    dueDate: "2024-10-13T23:59:59Z",
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: "2024-10-11T09:00:00Z",
    blocked: false
  },
  {
    _id: "task005",
    title: "Write API Documentation",
    description: "Document all endpoints using Swagger.",
    project: { _id: "proj001", name: "OWMS Internal Platform v2" },
    assignedBy: { _id: "pmo001", name: "Aswanth K", role: "PMO Lead", avatar: "AK" },
    assignedTo: "64f1a2b3c4d5e6f7a8b9c0d1",
    priority: "Low",
    status: "Done",
    effortPoints: 5,
    dueDate: "2024-10-05T23:59:59Z",
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: "2024-10-01T09:00:00Z",
    blocked: false
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
  const now = new Date('2024-10-12T00:00:00Z'); // Fixed for mock context
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
  const allSubtasksDone = completedSubtasks === task.subtasks.length && task.subtasks.length > 0;

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
                         <div key={sub._id} className="flex items-start gap-3 p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer group">
                           <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${sub.completed ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#CBD5E1] group-hover:border-[#2563EB]'}`}>
                             {sub.completed && <CheckSquare size={14} />}
                           </div>
                           <span className={`text-sm ${sub.completed ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]'}`}>{sub.title}</span>
                         </div>
                      ))}
                    </div>
                    {allSubtasksDone && (
                      <div className="bg-[#DCFCE7] border border-[#16A34A] text-[#16A34A] text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16} /> All subtasks complete! Ready to submit.
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase mb-3">Attachments</h4>
                  {task.attachments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {task.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                              <FileText size={16} />
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
                  )}
                  <button className="w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 text-center hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors group">
                    <UploadCloud size={20} className="mx-auto text-[#94A3B8] group-hover:text-[#2563EB] mb-2" />
                    <p className="text-sm font-bold text-[#0F172A]">Attach a file</p>
                    <p className="text-xs text-[#64748B] mt-0.5">PDF, JPG, PNG &middot; Max 5MB</p>
                  </button>
                </div>

                {/* Comments */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-xs font-semibold tracking-widest text-[#94A3B8] uppercase">Comments</h4>
                    <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-2 py-0.5 rounded-full">{task.comments.length}</span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {task.comments.map(comment => (
                      <div key={comment._id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {comment.author.avatar}
                        </div>
                        <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl rounded-tl-none p-3 relative">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-[#0F172A]">{comment.author.name}</span>
                            <span className="text-[10px] font-bold bg-[#E2E8F0] text-[#475569] px-1.5 py-0.5 rounded">{comment.author.role}</span>
                            <span className="text-[10px] text-[#64748B] ml-auto">{getRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-[#0F172A] leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    {task.comments.length === 0 && (
                      <div className="text-center py-4 text-sm text-[#94A3B8]">No comments yet.</div>
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      RM
                    </div>
                    <div className="flex-1">
                      <textarea 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                        rows="2"
                      />
                      <div className="flex justify-end mt-2">
                        <button disabled={!commentText.trim()} className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT SIDEBAR DETAILS */}
              <div className="w-full sm:w-[180px] bg-[#F8FAFC] border-l border-[#E2E8F0] p-5 shrink-0 flex flex-col gap-5">
                
                {/* Details List */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Status</label>
                    <select 
                      value={task.status}
                      onChange={e => onStatusChange(task._id, e.target.value)}
                      className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review" disabled>In Review</option>
                      <option value="Done" disabled>Done</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Priority</label>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${PRIORITY_STYLES[task.priority].color}`}>
                      {task.priority}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Due Date</label>
                    <div className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[#64748B]" /> {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Effort Points</label>
                    <div className="text-sm font-semibold text-[#0F172A]">{task.effortPoints} pts</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Assigned By</label>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px]">
                        {task.assignedBy.avatar}
                      </div>
                      <span className="text-sm font-semibold text-[#0F172A]">{task.assignedBy.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Project</label>
                    <div className="text-xs bg-[#EFF6FF] text-[#2563EB] font-bold px-2 py-1 rounded inline-block">{task.project.name}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-[#E2E8F0] space-y-2">
                  {task.status === 'Todo' && (
                    <button onClick={() => onStatusChange(task._id, 'In Progress')} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm">
                      Start Task
                    </button>
                  )}
                  {task.status === 'In Progress' && (
                    <>
                      <button onClick={() => onStatusChange(task._id, 'In Review')} className="w-full bg-[#7C3AED] hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm">
                        Submit for Review
                      </button>
                      <button onClick={() => onStatusChange(task._id, 'Blocked')} className="w-full border border-[#DC2626] text-[#DC2626] hover:bg-red-50 font-bold py-2 rounded-lg text-sm transition-colors">
                        Mark Blocked
                      </button>
                    </>
                  )}
                  {(task.status === 'Blocked' || task.blocked) && (
                    <button onClick={() => onStatusChange(task._id, 'In Progress')} className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm">
                      Resume Task
                    </button>
                  )}
                  {task.status === 'In Review' && (
                    <button disabled className="w-full bg-[#F1F5F9] text-[#64748B] font-bold py-2 rounded-lg text-sm cursor-not-allowed">
                      Awaiting Review
                    </button>
                  )}
                  {task.status === 'Done' && (
                    <div className="w-full bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20 font-bold py-2 rounded-lg text-sm text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <CheckCircle size={16} /> Completed
                    </div>
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

export default function InternTasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [view, setView] = useState('board'); // 'board' or 'list'
  const [selectedTask, setSelectedTask] = useState(null);
  
  // List Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t._id === taskId) {
        return { ...t, status: newStatus, blocked: newStatus === 'Blocked' };
      }
      return t;
    }));
    if (selectedTask && selectedTask._id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: newStatus, blocked: newStatus === 'Blocked' }));
    }
  };

  const getTaskAction = (task) => {
    switch(task.status) {
      case 'Todo': return <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task._id, 'In Progress'); }} className="text-[10px] font-bold border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded transition-colors">Start Task</button>;
      case 'In Progress': return <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task._id, 'In Review'); }} className="text-[10px] font-bold border border-[#7C3AED] bg-[#7C3AED] text-white hover:bg-purple-700 px-2 py-1 rounded transition-colors shadow-sm">Submit</button>;
      case 'Blocked': return <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task._id, 'In Progress'); }} className="text-[10px] font-bold border border-[#DC2626] text-[#DC2626] hover:bg-red-50 px-2 py-1 rounded transition-colors">Unblock</button>;
      case 'In Review': return <button disabled className="text-[10px] font-bold border border-transparent bg-[#F1F5F9] text-[#94A3B8] px-2 py-1 rounded cursor-not-allowed">Pending</button>;
      case 'Done': return <CheckCircle size={18} className="text-[#16A34A] mx-2" />;
      default: return null;
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageWrapper>
      <div className={`font-sans text-[#0F172A] w-full flex flex-col gap-6 max-w-[1600px] mx-auto pb-4 ${view === 'board' ? 'h-[calc(100vh-100px)] overflow-hidden' : 'min-h-screen'}`}>
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">My Tasks</h1>
            <p className="text-sm text-[#64748B] mt-1">Tasks assigned to you across your project</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] px-4 py-2 rounded-lg shadow-sm">
              {tasks.length} total &middot; {tasks.filter(t=>t.status==='In Progress').length} in progress &middot; 
              <span className="text-[#DC2626] ml-1">0 overdue</span>
            </div>

            <div className="flex bg-[#F1F5F9] p-1 rounded-lg">
              <button 
                onClick={() => setView('board')}
                className={`p-1.5 rounded-md transition-all ${view === 'board' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                title="Board View"
              >
                <Columns size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* VIEW RENDERER */}
        {view === 'board' ? (
          <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 pt-2">
            {COLUMNS.map(col => {
              const columnTasks = tasks.filter(t => t.status === col.id || (col.id === 'Blocked' && t.status === 'Blocked')); // Using strictly matching status
              return (
                <div key={col.id} className="w-[340px] shrink-0 flex flex-col bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden">
                  <div className={`px-4 py-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between border-l-4 ${col.color}`}>
                    <h3 className="text-sm font-bold text-[#0F172A]">{col.title}</h3>
                    <div className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center text-xs font-bold text-[#64748B]">
                      {columnTasks.length}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                    {columnTasks.map(task => {
                      const isOverdue = false; // Mock
                      return (
                        <div 
                          key={task._id} 
                          onClick={() => setSelectedTask(task)}
                          className={`bg-white p-4 rounded-xl shadow-sm border transition-all cursor-pointer hover:shadow-md group ${
                            task.status === 'Blocked' ? 'border-[#FCA5A5] bg-[#FEF2F2]/50 hover:border-[#EF4444]' : 'border-[#E2E8F0] hover:border-[#2563EB]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${PRIORITY_STYLES[task.priority].dot}`} />
                              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{task.priority}</span>
                            </div>
                            <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-2 py-0.5 rounded">{task.effortPoints} pts</span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-[#0F172A] leading-snug mb-1.5 group-hover:text-[#2563EB] transition-colors">{task.title}</h4>
                          <p className="text-xs text-[#64748B] line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                          
                          <div className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-4">
                            {task.project.name}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mb-3">
                            <CalendarDays size={12} className={isOverdue ? 'text-[#DC2626]' : 'text-[#64748B]'} />
                            <span className={`text-[11px] font-bold ${isOverdue ? 'text-[#DC2626] bg-[#FEE2E2] px-1 rounded' : 'text-[#64748B]'}`}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                          
                          <div className="border-t border-[#F1F5F9] pt-3 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                                {task.assignedBy.avatar}
                              </div>
                              <span className="text-[10px] text-[#64748B] font-medium hidden sm:inline-block">Assigned by {task.assignedBy.name}</span>
                            </div>
                            <div>
                              {getTaskAction(task)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {columnTasks.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-xs font-semibold text-[#94A3B8]">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* Toolbar */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="p-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Task</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Status</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Assigned By</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Due Date</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Effort</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => (
                      <tr key={task._id} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors ${task.status === 'Blocked' ? 'border-l-2 border-l-[#DC2626] bg-[#FEF2F2]/30' : ''}`}>
                        <td className="px-5 py-4 min-w-[300px]">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_STYLES[task.priority].dot}`} title={`${task.priority} Priority`} />
                            <div>
                              <p className="text-sm font-bold text-[#0F172A] leading-snug">{task.title}</p>
                              <p className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded inline-block mt-1">{task.project.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {task.status === 'Blocked' && <span className="text-[11px] font-bold px-2 py-1 rounded bg-red-100 text-red-700">Blocked</span>}
                          {task.status === 'Done' && <span className="text-[11px] font-bold px-2 py-1 rounded bg-green-100 text-green-700">Done</span>}
                          {task.status === 'In Progress' && <span className="text-[11px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">In Progress</span>}
                          {task.status === 'Todo' && <span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">Todo</span>}
                          {task.status === 'In Review' && <span className="text-[11px] font-bold px-2 py-1 rounded bg-purple-100 text-purple-700">In Review</span>}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px]">{task.assignedBy.avatar}</div>
                            <span className="text-sm font-medium text-[#0F172A]">{task.assignedBy.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-[#0F172A]">
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-2 py-1 rounded">{task.effortPoints} pts</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                          <button onClick={() => setSelectedTask(task)} className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors inline-block" title="View Details">
                            <Eye size={18} />
                          </button>
                          <div className="inline-block relative group">
                            <button className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors" title="Quick Status Change">
                              <RefreshCw size={18} />
                            </button>
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#E2E8F0] shadow-xl rounded-xl p-2 hidden group-hover:block z-20">
                              <button onClick={() => handleStatusChange(task._id, 'Todo')} className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded">Todo</button>
                              <button onClick={() => handleStatusChange(task._id, 'In Progress')} className="w-full text-left px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded">In Progress</button>
                              <button onClick={() => handleStatusChange(task._id, 'Blocked')} className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded">Blocked</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-5 py-10 text-center text-sm text-[#94A3B8]">
                          No tasks match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onStatusChange={handleStatusChange} 
      />
    </PageWrapper>
  );
}
