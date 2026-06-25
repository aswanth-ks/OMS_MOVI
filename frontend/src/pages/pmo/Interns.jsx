import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, UserPlus, CalendarDays, Star, X, ChevronDown } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { InternProgressRing } from '../../components/pmo/InternProgressRing';
import { pmoAPI, adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/shared/AccessDenied';

export default function PMOInterns() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null); // For drawer
  const [interns, setInterns] = useState([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Intern Modal State
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    projectId: '',
    department: '',
    duration: 3,
    skills: '',
    note: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [internsRes, tasksInReviewRes, projectsRes] = await Promise.all([
        pmoAPI.getInterns(),
        pmoAPI.getTasksInReview(),
        pmoAPI.getProjects()
      ]);
      setInterns(internsRes.data.data || []);
      setPendingReviewCount((tasksInReviewRes.data.data || []).length);
      setProjects(projectsRes.data.data || []);
      
      if (projectsRes.data.data?.length > 0) {
        setRequestData(prev => ({
          ...prev,
          projectId: projectsRes.data.data[0]._id,
          department: projectsRes.data.data[0].department?._id || projectsRes.data.data[0].department || ''
        }));
      }
    } catch (error) {
      toast.error('Failed to load interns details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestData.projectId || !requestData.department) {
      toast.error('Project and Department are required');
      return;
    }
    try {
      const payload = {
        ...requestData,
        skills: requestData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
      await pmoAPI.requestInterns(payload);
      toast.success('Intern request submitted to HR successfully!');
      setIsRequestOpen(false);
      setRequestData({
        projectId: projects[0]?._id || '',
        department: projects[0]?.department?._id || projects[0]?.department || '',
        duration: 3,
        skills: '',
        note: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const activeInterns = interns.filter(i => i.user?.status === 'Active').length;
  
  // Calculate interns completing this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completingSoon = interns.filter(i => {
    if (!i.user?.internshipEnd) return false;
    const endDate = new Date(i.user.internshipEnd);
    return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
  }).length;

  const filteredInterns = interns.filter(intern => {
    const term = searchTerm.toLowerCase();
    return (
      intern.user?.name?.toLowerCase().includes(term) ||
      intern.user?.college?.toLowerCase().includes(term) ||
      intern.project?.name?.toLowerCase().includes(term)
    );
  });

  const canRead = hasPermission('Interns', 'read');
  const canAssignTask = hasPermission('Tasks', 'create');

  if (!canRead) return <PageWrapper><AccessDenied message="You don't have permission to view interns." /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 max-w-[1400px] mx-auto pb-12 text-left">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Interns</h1>
            <p className="text-sm text-[#64748B] mt-1">Track and manage interns across all active projects</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsRequestOpen(true)}
              className="bg-white border border-[#E2E8F0] text-[#2563EB] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2"
            >
              <UserPlus size={18} /> Request New Intern
            </button>
            {canAssignTask && (
              <button
                onClick={() => navigate('/pmo/tasks')}
                className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus size={18} /> Assign Task
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-6 py-4 flex flex-wrap items-center justify-between md:justify-start gap-8 shadow-sm">
          <div className="flex flex-col"><span className="text-xl font-black text-[#0F172A]">{interns.length}</span><span className="text-xs font-bold text-[#64748B] uppercase">Total Interns</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col"><span className="text-xl font-black text-[#16A34A]">{activeInterns}</span><span className="text-xs font-bold text-[#64748B] uppercase">Active</span></div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col relative"><span className="text-xl font-black text-[#D97706]">{completingSoon}</span><span className="text-xs font-bold text-[#64748B] uppercase">Completing This Month</span>{completingSoon > 0 && <span className="absolute -right-2 top-0 w-2 h-2 rounded-full bg-[#D97706] animate-ping" />}</div>
          <div className="w-px h-10 bg-[#E2E8F0] hidden md:block" />
          <div className="flex flex-col cursor-pointer" onClick={() => navigate('/pmo/approvals')}><span className="text-xl font-black text-[#2563EB]">{pendingReviewCount}</span><span className="text-xs font-bold text-[#2563EB] uppercase border-b border-dashed border-[#BFDBFE]">Tasks Pending Review</span></div>
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
        </div>

        {/* INTERN CARDS */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterns.map(intern => {
              const name = intern.user?.name || 'Intern';
              const initial = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const ratings = intern.user?.performanceRatings || [];
              const latestRating = ratings.length > 0 ? ratings[ratings.length - 1].rating : 0;
              const startDateStr = intern.user?.internshipStart ? new Date(intern.user.internshipStart).toLocaleDateString() : 'N/A';
              const endDateStr = intern.user?.internshipEnd ? new Date(intern.user.internshipEnd).toLocaleDateString() : 'N/A';

              return (
                <div key={intern.user?._id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col relative overflow-hidden group">
                  
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 bg-blue-100 text-blue-700">
                      {initial}
                    </div>
                    <div className="flex-1">
                      <h3 
                        onClick={() => setSelectedIntern(intern)}
                        className="text-base font-bold text-[#0F172A] cursor-pointer hover:text-[#2563EB] transition-colors"
                      >
                        {name}
                      </h3>
                      <p className="text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded inline-block mt-1">{intern.user?.college || 'N/A'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      intern.user?.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                    }`}>
                      {intern.user?.status || 'Active'}
                    </span>
                  </div>

                  {/* Assignment & Duration */}
                  <div className="mb-6 space-y-3">
                    <div>
                      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Assigned To Project:</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-1 rounded">{intern.project?.name || 'OWMS Platform'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#475569]">
                      <CalendarDays size={14} className="text-[#94A3B8]" />
                      <span className="text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded">{startDateStr} → {endDateStr}</span>
                    </div>
                  </div>

                  {/* Progress & Ratings */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[#E2E8F0]">
                    <div className="text-center shrink-0">
                      <InternProgressRing percentage={100} size={64} />
                      <p className="text-[10px] font-bold text-[#64748B] mt-2">Active</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Latest Performance</p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={14} className={star <= latestRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} />
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-[#475569] mt-1">{ratings.length > 0 ? `Week ${ratings.length} rating` : 'No rating'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {canAssignTask && (
                      <button onClick={() => navigate('/pmo/tasks')} className="flex-1 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors">Assign Task</button>
                    )}
                    <button onClick={() => setSelectedIntern(intern)} className="flex-1 py-1.5 bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-lg hover:bg-[#F8FAFC] transition-colors">Performance Note</button>
                  </div>

                </div>
              );
            })}
            {filteredInterns.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-white text-[#64748B]">No interns found.</div>
            )}
          </div>
        )}

      </div>

      {/* REQUEST NEW INTERN MODAL */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-[#2563EB]" /> Request Interns from HR
              </h3>
              <button onClick={() => setIsRequestOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Project</label>
                  <select 
                    value={requestData.projectId} 
                    onChange={e => setRequestData({...requestData, projectId: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-none"
                    required
                  >
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                  <select 
                    value={requestData.department} 
                    onChange={e => setRequestData({...requestData, department: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-none"
                    required
                  >
                    <option value="">Select department...</option>
                    {projects.map(p => p.department && (
                      <option key={p.department._id || p.department} value={p.department._id || p.department}>{p.department.name || 'Department'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration (Months)</label>
                  <input 
                    type="number" 
                    min="1" max="12" 
                    value={requestData.duration} 
                    onChange={e => setRequestData({...requestData, duration: parseInt(e.target.value)})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Required Skills (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. React, Node.js, UI Design"
                    value={requestData.skills} 
                    onChange={e => setRequestData({...requestData, skills: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Special Instructions / Notes</label>
                  <textarea 
                    rows="3" 
                    placeholder="Provide details on project context..."
                    value={requestData.note} 
                    onChange={e => setRequestData({...requestData, note: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-600 outline-none resize-none"
                  />
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <button type="button" onClick={() => setIsRequestOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERN DETAIL DRAWER */}
      <AnimatePresence>
        {selectedIntern && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 cursor-pointer" onClick={() => setSelectedIntern(null)} />
            <motion.div 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0] text-left"
            >
              <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 bg-blue-100 text-blue-700">
                    {selectedIntern.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">{selectedIntern.user?.name}</h2>
                    <p className="text-xs text-[#64748B]">{selectedIntern.user?.college}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedIntern(null)} className="p-2 text-[#64748B] hover:bg-[#E2E8F0] rounded-full"><X size={20}/></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-[#0F172A] mb-4">Performance History</h3>
                <div className="space-y-4">
                  {selectedIntern.user?.performanceRatings && selectedIntern.user.performanceRatings.length > 0 ? (
                    selectedIntern.user.performanceRatings.map((rating, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                        <div>
                          <span className="text-sm font-bold text-[#475569]">Week {rating.week}</span>
                          {rating.note && <p className="text-xs text-slate-500 mt-0.5">{rating.note}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {[1,2,3,4,5].map(star => <Star key={star} size={14} className={star <= rating.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} />)}
                        </div>
                      </div>
                    )).reverse()
                  ) : (
                    <p className="text-xs text-slate-500 italic">No ratings added yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
