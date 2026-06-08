import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, UserPlus, CalendarDays, Star, X, ChevronDown } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { InternProgressRing } from '../../components/pmo/InternProgressRing';

// --- MOCK DATA ---
const mockInterns = [
  { id: 1, name: "Rahul Mehta", college: "NIT Trichy", project: ["OWMS v2"], startDate: "2024-09-01", endDate: "2024-11-30", status: "Active", tasksTotal: 12, tasksDone: 8, tasksOverdue: 1, weeklyRatings: [4, 3, 5, 4, 4], avatar: "RM", avatarColor: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Ananya Iyer", college: "VIT Vellore", project: ["OWMS v2", "Mobile App"], startDate: "2024-10-01", endDate: "2024-12-31", status: "Active", tasksTotal: 8, tasksDone: 2, tasksOverdue: 0, weeklyRatings: [5, 4], avatar: "AI", avatarColor: "bg-purple-100 text-purple-700" },
  { id: 3, name: "Karthik Raj", college: "IIT Madras", project: ["Internal Tools"], startDate: "2024-06-01", endDate: "2024-08-31", status: "Completed", tasksTotal: 25, tasksDone: 25, tasksOverdue: 0, weeklyRatings: [5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 5], avatar: "KR", avatarColor: "bg-emerald-100 text-emerald-700" },
  { id: 4, name: "Sneha Patel", college: "BITS Pilani", project: ["Cloud Migration"], startDate: "2024-08-15", endDate: "2024-10-30", status: "Completing Soon", tasksTotal: 18, tasksDone: 15, tasksOverdue: 2, weeklyRatings: [3, 4, 3, 4, 4, 5], avatar: "SP", avatarColor: "bg-amber-100 text-amber-700" },
  { id: 5, name: "Vikram Singh", college: "Delhi Tech", project: ["Mobile App"], startDate: "2024-09-15", endDate: "2024-12-15", status: "Active", tasksTotal: 10, tasksDone: 9, tasksOverdue: 0, weeklyRatings: [4, 4, 5, 4], avatar: "VS", avatarColor: "bg-rose-100 text-rose-700" }
];

export default function PMOInterns() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null); // For drawer

  const activeInterns = mockInterns.filter(i => i.status !== 'Completed').length;
  const completingSoon = mockInterns.filter(i => i.status === 'Completing Soon').length;
  const pendingReview = 3; // mock static number

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 max-w-[1400px] mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Interns</h1>
            <p className="text-sm text-[#64748B] mt-1">Track and manage interns across all active projects</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-[#E2E8F0] text-[#2563EB] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2">
              <UserPlus size={18} /> Request New Intern
            </button>
            <button className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2">
              <Plus size={18} /> Assign Task
            </button>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between md:justify-start gap-8 shadow-sm">
          <div className="flex flex-col"><span className="text-xl font-black text-[#0F172A]">{mockInterns.length}</span><span className="text-xs font-bold text-[#64748B] uppercase">Total Interns</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#16A34A]">{activeInterns}</span><span className="text-xs font-bold text-[#64748B] uppercase">Active</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col relative"><span className="text-xl font-black text-[#D97706]">{completingSoon}</span><span className="text-xs font-bold text-[#64748B] uppercase">Completing This Month</span><span className="absolute -right-2 top-0 w-2 h-2 rounded-full bg-[#D97706] animate-ping" /></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col cursor-pointer"><span className="text-xl font-black text-[#2563EB]">{pendingReview}</span><span className="text-xs font-bold text-[#2563EB] uppercase border-b border-dashed border-[#BFDBFE]">Tasks Pending Review</span></div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Search by name, college, or project..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-2">Project <ChevronDown size={14} /></button>
            <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-2">Status <ChevronDown size={14} /></button>
            <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] flex items-center gap-2">College <ChevronDown size={14} /></button>
          </div>
        </div>

        {/* INTERN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockInterns.map(intern => (
            <div key={intern.id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col relative overflow-hidden group">
              
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${intern.avatarColor}`}>
                  {intern.avatar}
                </div>
                <div className="flex-1">
                  <h3 
                    onClick={() => setSelectedIntern(intern)}
                    className="text-base font-bold text-[#0F172A] cursor-pointer hover:text-[#2563EB] transition-colors"
                  >
                    {intern.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded inline-block mt-1">{intern.college}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                  intern.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' :
                  intern.status === 'Completing Soon' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' :
                  'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                }`}>
                  {intern.status}
                </span>
              </div>

              {/* Assignment & Duration */}
              <div className="mb-6 space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Assigned To:</p>
                  <div className="flex flex-wrap gap-1">
                    {intern.project.map(p => <span key={p} className="text-xs font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded">{p}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#475569]">
                  <CalendarDays size={14} className="text-[#94A3B8]" />
                  <span className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded">{intern.startDate} → {intern.endDate}</span>
                </div>
              </div>

              {/* Progress & Ratings */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[#E2E8F0]">
                <div className="text-center shrink-0">
                  <InternProgressRing percentage={Math.round((intern.tasksDone/intern.tasksTotal)*100)} size={64} />
                  <p className="text-[10px] font-bold text-[#64748B] mt-2">{intern.tasksDone}/{intern.tasksTotal} Tasks</p>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Latest Performance</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={14} className={star <= intern.weeklyRatings[intern.weeklyRatings.length-1] ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-[#475569] mt-1">Week {intern.weeklyRatings.length} rating</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-wrap gap-2">
                <button className="flex-1 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors">Assign Task</button>
                <button className="flex-1 py-1.5 bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F8FAFC] transition-colors">Performance Note</button>
                <button 
                  onClick={() => navigate(`/hr/interns/${intern.id}`)}
                  className="w-full py-1.5 mt-1 bg-transparent border border-transparent text-[#64748B] text-xs font-bold rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  View Profile
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* INTERN DETAIL DRAWER */}
      <AnimatePresence>
        {selectedIntern && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 cursor-pointer" onClick={() => setSelectedIntern(null)} />
            <motion.div 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0]"
            >
              <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${selectedIntern.avatarColor}`}>{selectedIntern.avatar}</div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">{selectedIntern.name}</h2>
                    <p className="text-xs text-[#64748B]">{selectedIntern.college}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedIntern(null)} className="p-2 text-[#64748B] hover:bg-[#E2E8F0] rounded-full"><X size={20}/></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-[#0F172A] mb-4">Performance History</h3>
                <div className="space-y-4">
                  {selectedIntern.weeklyRatings.map((rating, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                      <span className="text-sm font-bold text-[#475569]">Week {idx + 1}</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => <Star key={star} size={14} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} />)}
                      </div>
                    </div>
                  )).reverse()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
