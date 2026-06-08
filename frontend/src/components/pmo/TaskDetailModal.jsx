import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertCircle, Paperclip, CheckSquare, MessageSquare, Plus, ChevronDown, Flag, UserPlus, RefreshCw, Check } from 'lucide-react';

/**
 * TaskDetailModal
 * @param {Object} props
 * @param {Object} props.task - The task object to display
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onStatusChange - Callback when status changes
 * @param {Function} props.onAssign - Callback when assignee changes
 */
export const TaskDetailModal = ({ task, onClose, onStatusChange, onAssign }) => {
  const [description, setDescription] = useState(task?.description || '');
  const [activeTab, setActiveTab] = useState('Subtasks');

  if (!task) return null;

  const priorityColors = {
    Critical: 'text-red-600 bg-red-100 border-red-200',
    High: 'text-orange-600 bg-orange-100 border-orange-200',
    Medium: 'text-amber-600 bg-amber-100 border-amber-200',
    Low: 'text-green-600 bg-green-100 border-green-200'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer" 
          onClick={onClose} 
        />
        
        {/* Modal Panel */}
        <motion.div 
          initial={{ x: 600, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          exit={{ x: 600, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                  {task.priority} Priority
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                  <RefreshCw size={12} /> {task.status || 'Todo'} <ChevronDown size={12} />
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{task.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Left Column (60%) */}
            <div className="flex-[3] p-6 space-y-8">
              
              {/* Description */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                  placeholder="Add a more detailed description..."
                />
              </section>

              {/* Subtabs for content */}
              <section>
                <div className="flex border-b border-slate-200 mb-4">
                  {['Subtasks', 'Comments', 'Attachments'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'Subtasks' && (
                  <div className="space-y-2">
                    {task.subtasks?.length > 0 ? task.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked={st.done} />
                        <span className={`text-sm ${st.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</span>
                        <button className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><X size={14}/></button>
                      </div>
                    )) : <p className="text-sm text-slate-500">No subtasks defined.</p>}
                    <button className="text-sm font-bold text-blue-600 flex items-center gap-1 mt-3 hover:underline">
                      <Plus size={16} /> Add Subtask
                    </button>
                  </div>
                )}

                {activeTab === 'Comments' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 italic">No comments yet.</p>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">ME</div>
                      <div className="flex-1">
                        <textarea className="w-full h-16 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write a comment..." />
                        <button className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Post Comment</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Attachments' && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                      <Paperclip size={24} className="text-slate-400 mb-2" />
                      <p className="text-sm font-bold text-slate-700">Drop files here</p>
                      <p className="text-xs text-slate-500">or click to browse</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column (40%) */}
            <div className="flex-[2] bg-slate-50 p-6 flex flex-col">
              
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Details</h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assignee</p>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-200 p-1.5 -ml-1.5 rounded-lg transition-colors">
                    {task.assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{task.assignee}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-400">
                          <UserPlus size={12} />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Unassigned</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Due Date</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Clock size={16} className="text-slate-400" />
                    {task.dueDate || 'No due date'}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Effort Points</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Flag size={16} className="text-slate-400" />
                    {task.effort || 0} pts
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Project</p>
                  <span className="inline-block px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600">
                    {task.project || 'No Project'}
                  </span>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-3 bg-white border border-slate-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-200 flex items-center gap-2 transition-colors">
                  <AlertCircle size={16} /> Mark as Blocked
                </button>
                <button className="w-full py-2 px-3 bg-white border border-slate-200 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-50 hover:border-purple-200 flex items-center gap-2 transition-colors">
                  <RefreshCw size={16} /> Submit for Review
                </button>
                <button className="w-full py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2 transition-colors">
                  <Check size={16} /> Mark Complete
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
