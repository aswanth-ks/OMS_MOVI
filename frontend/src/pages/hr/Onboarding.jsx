import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Clock, CheckCircle2, 
  Filter, AlertCircle, FileText, Check 
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { hrAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ONBOARDING_TASKS = [
  { key: 'welcomeEmail', text: 'Send Welcome Email' },
  { key: 'idCardIssued', text: 'Issue Company ID Card' },
  { key: 'systemAccess', text: 'Set Up Workspace & System Access' },
  { key: 'deptIntroduction', text: 'Department Introduction' },
  { key: 'equipmentAssigned', text: 'Assign Equipment & Laptop' },
  { key: 'hrDocumentation', text: 'Complete HR Documentation' },
  { key: 'mentorAssigned', text: 'Assign Mentor' },
  { key: 'firstWeekSchedule', text: 'Share First Week Schedule' },
];

export default function HROnboarding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' = in-progress, 'completed' = onboarding complete
  const [selectedOnboardee, setSelectedOnboardee] = useState(null);
  const [pendingOnboarding, setPendingOnboarding] = useState([]);
  const [completedOnboarding, setCompletedOnboarding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      const [pendingRes, completedRes] = await Promise.all([
        hrAPI.getPendingOnboarding(),
        hrAPI.getCompletedOnboarding()
      ]);
      setPendingOnboarding(pendingRes.data?.data || []);
      setCompletedOnboarding(completedRes.data?.data || []);
    } catch (err) {
      console.error('Error loading onboarding records:', err);
      toast.error('Failed to load onboarding records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const handleToggleTask = async (userId, taskKey, isChecked) => {
    try {
      await hrAPI.updateOnboardingChecklist(userId, {
        item: taskKey,
        completed: isChecked
      });
      
      // Reload pending and completed lists
      const [pendingRes, completedRes] = await Promise.all([
        hrAPI.getPendingOnboarding(),
        hrAPI.getCompletedOnboarding()
      ]);
      const newPending = pendingRes.data?.data || [];
      setPendingOnboarding(newPending);
      setCompletedOnboarding(completedRes.data?.data || []);

      // If the checklist is completed, it might shift to the completed tab
      const stillPending = newPending.find(u => u._id === userId);
      if (stillPending) {
        setSelectedOnboardee(stillPending);
      } else {
        setSelectedOnboardee(null);
        toast.success('Onboarding checklist completed!');
      }
    } catch (err) {
      console.error('Error updating checklist:', err);
      toast.error(err.response?.data?.message || 'Failed to update checklist item');
    }
  };

  const filteredPending = pendingOnboarding.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompleted = completedOnboarding.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] w-full flex flex-col h-full">
        
        {/* HEADER */}
        <div className="px-6 py-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Onboarding & Requests</h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Submit hiring requests and track onboarding checklists for new hires.
            </p>
          </div>
          <button 
            onClick={() => navigate('/hr/employees/new')}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Submit New Hire Request
          </button>
        </div>

        {/* TABS */}
        <div className="px-6 border-b border-[#E2E8F0] bg-white shrink-0 flex items-center gap-6">
          <button 
            onClick={() => { setActiveTab('pending'); setSelectedOnboardee(null); }}
            className={`py-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pending' 
                ? 'border-[#2563EB] text-[#2563EB]' 
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Clock size={16} />
            In Progress
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              {filteredPending.length}
            </span>
          </button>
          <button 
            onClick={() => { setActiveTab('completed'); setSelectedOnboardee(null); }}
            className={`py-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'completed' 
                ? 'border-[#2563EB] text-[#2563EB]' 
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <CheckCircle2 size={16} />
            Completed
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              {filteredCompleted.length}
            </span>
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-hidden flex bg-[#F8FAFC]">
          
          {/* LIST VIEW */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${selectedOnboardee ? 'hidden lg:block lg:w-2/3 border-r border-[#E2E8F0]' : 'w-full'}`}>
            
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
               <div className="relative w-64">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                 <input
                   className="w-full border border-[#E2E8F0] rounded-md py-1.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-[#2563EB] bg-white shadow-sm"
                   placeholder="Search records..."
                   type="text"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               <button onClick={loadOnboardingData} className="border border-[#E2E8F0] text-[#0F172A] bg-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#F1F5F9] transition-colors flex items-center gap-2 shadow-sm">
                 <span className="material-symbols-outlined text-[16px]">sync</span> Refresh
               </button>
            </div>

            {loading && (
              <div className="text-center py-12 text-[14px] text-[#64748B]">Loading onboarding records...</div>
            )}

            {/* TAB CONTENT: PENDING (IN PROGRESS) */}
            {!loading && activeTab === 'pending' && (
              <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
                   <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                   <div>
                     <h3 className="text-[13px] font-semibold text-amber-900">Onboarding Checklists In Progress</h3>
                     <p className="text-[12px] text-amber-700 mt-0.5">Click on any candidate row below to open their onboarding checklist drawer and complete tasks.</p>
                   </div>
                </div>
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Candidate</th>
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Role & Dept</th>
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Created Date</th>
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase text-right">Onboarding Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPending.length > 0 ? (
                      filteredPending.map((req) => (
                        <tr 
                          key={req._id} 
                          onClick={() => setSelectedOnboardee(req)}
                          className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0 cursor-pointer ${selectedOnboardee?._id === req._id ? 'bg-[#EFF6FF]' : ''}`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="text-[14px] font-medium text-[#0F172A]">{req.name}</div>
                            <div className="text-[12px] text-[#64748B] font-mono mt-0.5">{req.employeeId || '-'}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-[13px] text-[#0F172A]">{req.role?.name || '-'}</div>
                            <div className="text-[12px] text-[#64748B] mt-0.5">{req.department?.name || '-'}</div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-[#64748B]">
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                             <div className="flex items-center justify-end gap-3">
                               <div className="w-24 bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${req.onboardingProgress || 0}%` }}></div>
                               </div>
                               <span className="text-[12px] font-semibold text-[#0F172A]">{req.onboardingProgress || 0}%</span>
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-sm text-[#64748B]">No onboarding candidates in progress.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: COMPLETED */}
            {!loading && activeTab === 'completed' && (
              <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Employee</th>
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Role</th>
                      <th className="px-5 py-3 text-[12px] font-semibold text-[#64748B] uppercase">Completion Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompleted.length > 0 ? (
                      filteredCompleted.map((person) => (
                        <tr 
                          key={person._id} 
                          className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors last:border-0"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center font-bold text-[12px] shrink-0">
                                {person.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div>
                                <div className="text-[14px] font-medium text-[#0F172A]">{person.name}</div>
                                <div className="text-[12px] text-[#64748B] font-mono mt-0.5">{person.employeeId || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-[#64748B]">{person.role?.name || '-'}</td>
                          <td className="px-5 py-3.5 text-[13px] text-[#64748B]">
                            {person.updatedAt ? new Date(person.updatedAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-sm text-[#64748B]">No completed onboarding records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: CHECKLIST DRAWER */}
          {(!loading && activeTab === 'pending' && selectedOnboardee) && (
            <div className="w-full lg:w-1/3 bg-white border-l border-[#E2E8F0] flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
              <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-start bg-[#F8FAFC]">
                <div>
                  <h2 className="text-[16px] font-bold text-[#0F172A]">Onboarding Checklist</h2>
                  <p className="text-[13px] text-[#64748B] mt-1">For <span className="font-semibold text-[#0F172A]">{selectedOnboardee.name}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedOnboardee(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[13px] font-bold text-[#1E40AF]">Overall Progress</span>
                     <span className="text-[13px] font-bold text-[#1D4ED8]">{selectedOnboardee.onboardingProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#DBEAFE] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#2563EB] h-full rounded-full transition-all duration-500" style={{ width: `${selectedOnboardee.onboardingProgress || 0}%` }}></div>
                  </div>
                </div>

                <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-4">HR Action Items</h3>
                
                <div className="space-y-3">
                  {ONBOARDING_TASKS.map((task) => {
                    const isChecked = !!selectedOnboardee.onboardingChecklist?.[task.key];
                    return (
                      <div 
                        key={task.key} 
                        onClick={() => handleToggleTask(selectedOnboardee._id, task.key, !isChecked)}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${isChecked ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white border-[#CBD5E1] shadow-sm'} transition-colors cursor-pointer group`}
                      >
                        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#94A3B8] group-hover:border-[#2563EB]'}`}>
                           {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className={`text-[13px] leading-snug ${isChecked ? 'text-[#64748B] line-through' : 'text-[#0F172A] font-medium'}`}>
                          {task.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                  <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-4">Resources</h3>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors mb-3 text-left">
                     <FileText className="text-[#2563EB]" size={18} />
                     <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">Welcome Packet.pdf</div>
                        <div className="text-[11px] text-[#64748B]">2.4 MB</div>
                     </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors text-left">
                     <FileText className="text-[#2563EB]" size={18} />
                     <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">IT Security Guidelines.pdf</div>
                        <div className="text-[11px] text-[#64748B]">1.1 MB</div>
                     </div>
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </PageWrapper>
  );
}
