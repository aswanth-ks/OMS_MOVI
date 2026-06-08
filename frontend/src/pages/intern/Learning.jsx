import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { Play, FileText, ExternalLink, GraduationCap, CalendarDays, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/intern/learning/resources
const mockResources = [
  { 
    _id: "res001", title: "React 18 Fundamentals", type: "Course", url: "https://reactjs.org/docs",
    assignedBy: { name: "Aswanth K", role: "PMO Lead" }, dueDate: "2024-10-20T23:59:59Z",
    estimatedMinutes: 120, status: "In Progress", completedAt: null 
  },
  { 
    _id: "res002", title: "Tailwind CSS Complete Guide", type: "Document", url: "https://tailwindcss.com/docs",
    assignedBy: { name: "Sarah Johnson", role: "HR Manager" }, dueDate: "2024-10-15T23:59:59Z",
    estimatedMinutes: 60, status: "Completed", completedAt: "2024-10-10T14:30:00Z" 
  },
  { 
    _id: "res003", title: "Git & GitHub for Teams", type: "Video", url: "#",
    assignedBy: { name: "Aswanth K", role: "PMO Lead" }, dueDate: "2024-10-25T23:59:59Z",
    estimatedMinutes: 45, status: "Pending", completedAt: null 
  },
  { 
    _id: "res004", title: "OWMS Onboarding Guide", type: "Document", url: "#",
    assignedBy: { name: "Sarah Johnson", role: "HR Manager" }, dueDate: "2024-10-05T23:59:59Z",
    estimatedMinutes: 30, status: "Completed", completedAt: "2024-09-15T10:00:00Z" 
  },
  { 
    _id: "res005", title: "MongoDB Basics", type: "Link", url: "https://www.mongodb.com/docs",
    assignedBy: { name: "Aswanth K", role: "PMO Lead" }, dueDate: "2024-11-01T23:59:59Z",
    estimatedMinutes: 90, status: "Pending", completedAt: null 
  },
];

const RESOURCE_TYPES = {
  Video: { icon: Play, bg: 'bg-[#FEF2F2]', color: 'text-[#DC2626]' },
  Document: { icon: FileText, bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]' },
  Link: { icon: ExternalLink, bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
  Course: { icon: GraduationCap, bg: 'bg-[#F5F3FF]', color: 'text-[#7C3AED]' },
};

const formatDate = (isoStr) => {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getUrgencyClass = (isoStr) => {
  const date = new Date(isoStr);
  const now = new Date('2024-10-12T00:00:00Z'); // Fixed mock date
  const diffTime = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (diffTime < 0) return 'text-[#DC2626]'; // Overdue
  if (diffTime <= 3) return 'text-[#D97706]'; // Due soon
  return 'text-[#64748B]';
};

export default function InternLearning() {
  const [resources, setResources] = useState(mockResources);
  const [filter, setFilter] = useState('All');

  const completedCount = resources.filter(r => r.status === 'Completed').length;
  const totalCount = resources.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const pendingCount = resources.filter(r => r.status !== 'Completed').length;
  const estRemainingMins = resources.filter(r => r.status !== 'Completed').reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  const handleStartContinue = (res) => {
    // window.open(res.url, '_blank');
    if (res.status === 'Pending') {
      setResources(prev => prev.map(r => r._id === res._id ? { ...r, status: 'In Progress' } : r));
    }
  };

  const handleMarkComplete = (id) => {
    setResources(prev => prev.map(r => {
      if (r._id === id) {
        return { ...r, status: 'Completed', completedAt: new Date().toISOString(), justCompleted: true };
      }
      return r;
    }));
    
    // Remove the completion animation flag after a delay
    setTimeout(() => {
      setResources(prev => prev.map(r => r._id === id ? { ...r, justCompleted: false } : r));
    }, 2000);
  };

  const filteredResources = resources.filter(r => filter === 'All' || r.status === filter);

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-10 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Learning Resources</h1>
            <p className="text-sm text-[#64748B] mt-1">Training materials and resources assigned to you</p>
          </div>
          <div className="bg-[#DCFCE7] text-[#16A34A] px-4 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2">
            <CheckCircle size={18} />
            {completedCount}/{totalCount} resources completed
          </div>
        </div>

        {/* OVERALL PROGRESS BAR */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm mb-2">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Your Learning Progress</h2>
          <div className="w-full h-3 bg-[#DBEAFE] rounded-full overflow-hidden mb-3">
            <motion.div 
              className="h-full bg-[#2563EB]" 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm">
            <p className="font-bold text-[#0F172A]">{progressPercentage}% complete &middot; <span className="text-[#64748B] font-normal">{completedCount} of {totalCount} resources done</span></p>
            <p className="text-[#64748B] mt-1 sm:mt-0">{pendingCount} resources remaining &middot; <span className="font-bold">Est. {Math.round(estRemainingMins/60)} hours</span></p>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                filter === f ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* RESOURCE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {filteredResources.map(res => {
              const typeStyle = RESOURCE_TYPES[res.type] || RESOURCE_TYPES.Document;
              const Icon = typeStyle.icon;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={res._id} 
                  className={`relative bg-white rounded-xl border p-5 transition-all overflow-hidden ${
                    res.status === 'Completed' ? 'border-[#16A34A]/30' : 'border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-sm'
                  }`}
                >
                  {/* Completion Animation Overlay */}
                  <AnimatePresence>
                    {res.justCompleted && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#DCFCE7]/90 z-10 flex items-center justify-center backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <CheckCircle size={60} className="text-[#16A34A]" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeStyle.bg} ${typeStyle.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      {res.status === 'Pending' && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Pending</span>}
                      {res.status === 'In Progress' && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">In Progress</span>}
                      {res.status === 'Completed' && <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded">Completed</span>}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] leading-snug mb-1">{res.title}</h3>
                  <p className="text-xs text-[#64748B] mb-4">Assigned by {res.assignedBy.name}</p>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className={getUrgencyClass(res.dueDate)} />
                      <span className={`text-xs font-semibold ${getUrgencyClass(res.dueDate)}`}>
                        {formatDate(res.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#64748B]" />
                      <span className="text-xs font-medium text-[#64748B]">{res.estimatedMinutes} mins</span>
                    </div>
                  </div>

                  {res.status === 'Completed' && res.completedAt && (
                    <div className="flex items-center gap-1.5 mb-5 text-[#16A34A]">
                      <CheckCircle size={14} />
                      <span className="text-xs font-semibold text-[#16A34A]">Completed on {formatDate(res.completedAt)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E2E8F0] flex gap-3 mt-auto">
                    {res.status === 'Pending' && (
                      <button onClick={() => handleStartContinue(res)} className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors w-fit shadow-sm">
                        Start Learning
                      </button>
                    )}
                    {res.status === 'In Progress' && (
                      <>
                        <button onClick={() => handleStartContinue(res)} className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors w-fit shadow-sm">
                          Continue
                        </button>
                        <button onClick={() => handleMarkComplete(res._id)} className="border border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4] text-sm font-bold py-2 px-4 rounded-lg transition-colors w-fit">
                          Mark Complete
                        </button>
                      </>
                    )}
                    {res.status === 'Completed' && (
                      <button onClick={() => handleStartContinue(res)} className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] text-sm font-bold py-2 px-4 rounded-lg transition-colors w-fit">
                        Review Again
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredResources.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#64748B]">
              No resources found for the selected filter.
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
