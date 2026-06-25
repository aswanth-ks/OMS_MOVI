import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { hrAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Star, ShieldAlert, Plus, X, Award, Users } from 'lucide-react';

export default function HRPerformance() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null);
  
  // Rating form state
  const [newWeek, setNewWeek] = useState(1);
  const [newRating, setNewRating] = useState(5);
  const [newNote, setNewNote] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadInterns = async () => {
    try {
      setLoading(true);
      const res = await hrAPI.getInterns();
      setInterns(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load performance records:', err);
      toast.error('Failed to load performance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterns();
  }, []);

  const calculateAvgRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleAddRating = async (e) => {
    e.preventDefault();
    if (!selectedIntern) return;

    try {
      setSubmittingRating(true);
      await hrAPI.addInternPerformance(selectedIntern._id, {
        week: Number(newWeek),
        rating: Number(newRating),
        note: newNote
      });

      toast.success('Performance rating submitted successfully');
      
      // Clear form
      setNewWeek(prev => prev + 1);
      setNewNote('');

      // Reload intern list and update selected intern details
      const res = await hrAPI.getInterns();
      const freshInterns = res.data?.data || [];
      setInterns(freshInterns);

      const updatedIntern = freshInterns.find(i => i._id === selectedIntern._id);
      if (updatedIntern) {
        setSelectedIntern(updatedIntern);
      }
    } catch (err) {
      console.error('Error adding performance rating:', err);
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredInterns = useMemo(() => {
    return interns.filter(emp => 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [interns, searchTerm]);

  // Overall aggregates
  const globalAvgRating = useMemo(() => {
    const allRatings = interns.flatMap(i => i.performanceRatings || []);
    if (allRatings.length === 0) return '0.0';
    return (allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length).toFixed(1);
  }, [interns]);

  const totalReviewsSubmitted = useMemo(() => {
    return interns.reduce((acc, curr) => acc + (curr.performanceRatings?.length || 0), 0);
  }, [interns]);

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full gap-6 max-w-[1600px] mx-auto pb-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Intern Performance Ratings</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Submit weekly performance evaluations and track progress metrics for all interns.
            </p>
          </div>
        </div>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Average Rating</p>
              <div className="flex items-end gap-2">
                <h2 className="text-[28px] font-bold text-[#0F172A] leading-none">{globalAvgRating}</h2>
                <span className="text-[13px] text-[#64748B] mb-1">/ 5.0 stars</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Star size={24} fill="#2563EB" />
            </div>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Reviews Submitted</p>
              <h2 className="text-[28px] font-bold text-[#0F172A] leading-none">{totalReviewsSubmitted}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <Award size={24} className="text-[#10B981]" />
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Managed Interns</p>
              <h2 className="text-[28px] font-bold text-[#0F172A] leading-none">{interns.length}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <Users size={24} className="text-[#D97706]" />
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* LEFT TABLE: INTERNS LIST */}
          <div className={`flex-1 flex flex-col bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden ${selectedIntern ? 'hidden lg:flex lg:w-2/3' : 'w-full'}`}>
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
               <div className="relative w-64">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                 <input
                   type="text"
                   placeholder="Search interns by name..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full border border-[#E2E8F0] rounded-md py-1.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-[#2563EB] transition-colors"
                 />
               </div>
               <button onClick={loadInterns} className="border border-[#E2E8F0] text-[#0F172A] bg-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#F1F5F9] transition-colors flex items-center gap-1.5">
                 <span className="material-symbols-outlined text-[16px]">sync</span> Refresh
               </button>
            </div>

            {loading && (
              <div className="text-center py-12 text-[14px] text-[#64748B]">Loading intern performance list...</div>
            )}

            {!loading && (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Intern</th>
                      <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">ID</th>
                      <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">College</th>
                      <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Ratings Count</th>
                      <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Avg Score</th>
                      <th className="px-4 py-3 text-[12px] font-semibold text-[#64748B] uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterns.length > 0 ? (
                      filteredInterns.map((emp) => {
                        const avg = calculateAvgRating(emp.performanceRatings);
                        return (
                          <tr 
                            key={emp._id} 
                            onClick={() => setSelectedIntern(emp)}
                            className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0 cursor-pointer ${selectedIntern?._id === emp._id ? 'bg-[#EFF6FF]' : ''}`}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-[12px] shrink-0">
                                  {emp.name ? emp.name.split(' ').map(n=>n[0]).join('') : 'I'}
                                </div>
                                <div>
                                  <div className="text-[14px] font-medium text-[#0F172A]">{emp.name}</div>
                                  <div className="text-[12px] text-[#64748B] mt-0.5">{emp.designation || 'Intern'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[13px] font-mono text-[#64748B]">
                              {emp.employeeId || '-'}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#64748B]">
                              {emp.college || '-'}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#64748B]">
                              {emp.performanceRatings?.length || 0} Week(s)
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-amber-500" fill="currentColor" />
                                <span className="text-[13px] font-bold text-[#0F172A]">{avg}</span>
                                <span className="text-[11px] text-[#64748B]">/5</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedIntern(emp); }}
                                className="text-[#2563EB] hover:underline text-[12px] font-semibold flex items-center gap-1 ml-auto"
                              >
                                <Plus size={14} /> Evaluate
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#64748B]">
                          No interns found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT SIDE PANEL: RATING SYSTEM */}
          {selectedIntern && (
            <div className="w-full lg:w-1/3 bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[800px]">
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">{selectedIntern.name}</h3>
                  <p className="text-[12px] text-[#64748B]">Intern Performance Manager</p>
                </div>
                <button 
                  onClick={() => setSelectedIntern(null)}
                  className="text-[#64748B] hover:bg-[#E2E8F0] p-1.5 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                
                {/* Form to submit a new rating */}
                <form onSubmit={handleAddRating} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-4">
                  <h4 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <Plus size={16} /> Submit Weekly Evaluation
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">Week Number</label>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        max="52" 
                        value={newWeek} 
                        onChange={e => setNewWeek(e.target.value)}
                        className="w-full border border-[#E2E8F0] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">Rating (Stars)</label>
                      <select 
                        value={newRating} 
                        onChange={e => setNewRating(e.target.value)}
                        className="w-full border border-[#E2E8F0] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] cursor-pointer"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">Evaluation Note / Comments</label>
                    <textarea 
                      placeholder="Add detailed feedback on execution, learnings, and areas of improvement..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className="w-full border border-[#E2E8F0] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] h-20 resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingRating}
                    className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submittingRating ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </form>

                {/* Rating history list */}
                <div className="space-y-3">
                  <h4 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider">Evaluation History</h4>
                  
                  {selectedIntern.performanceRatings && selectedIntern.performanceRatings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedIntern.performanceRatings.map((rating, idx) => (
                        <div key={idx} className="border border-[#E2E8F0] rounded-xl p-3 bg-white space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#0F172A]">Week {rating.week}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  fill={i < rating.rating ? "currentColor" : "none"} 
                                  className={i < rating.rating ? "text-amber-500" : "text-[#E2E8F0]"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[12px] text-[#64748B] leading-relaxed">{rating.note || 'No comments entered.'}</p>
                          <p className="text-[10px] text-[#94A3B8]">Submitted on {new Date(rating.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center p-4">
                      <ShieldAlert className="text-slate-300 mb-2" size={24} />
                      <p className="text-[12px] text-[#64748B] font-medium">No reviews logged yet</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">Evaluate to register performance history.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
