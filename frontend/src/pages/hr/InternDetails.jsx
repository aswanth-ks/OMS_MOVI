import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UploadCloud, FileText, Play, ExternalLink, GraduationCap, 
  CalendarDays, CheckCircle, Clock
} from 'lucide-react';

// --- SUB-COMPONENTS ---
const AssignMaterialModal = ({ isOpen, onClose, internName, onAssign }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Document');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) return;
    
    onAssign({
      _id: `mat-${Date.now()}`,
      title,
      type,
      deadline,
      description,
      status: 'Pending',
      assignedAt: new Date().toISOString()
    });
    
    // Reset
    setTitle('');
    setType('Document');
    setDeadline('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Assign Learning Material</h2>
              <p className="text-sm text-[#64748B]">To: {internName}</p>
            </div>
            <button onClick={onClose} className="text-[#64748B] hover:bg-[#E2E8F0] p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="overflow-y-auto p-6">
            <form id="assign-material-form" onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Topic / Title *</label>
                <input 
                  type="text" required value={title} onChange={e=>setTitle(e.target.value)}
                  placeholder="e.g. React 18 Fundamentals"
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Material Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Document', 'Video', 'Course', 'Link'].map(t => (
                    <button
                      key={t} type="button" onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-colors ${type === t ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Deadline *</label>
                <input 
                  type="date" required value={deadline} onChange={e=>setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Instructions / Description</label>
                <textarea 
                  value={description} onChange={e=>setDescription(e.target.value)}
                  placeholder="Add any specific instructions for the intern..."
                  className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Upload File / Images <span className="text-[#64748B] font-normal">(Optional)</span></label>
                <button type="button" className="w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors group">
                  <UploadCloud size={24} className="mx-auto text-[#94A3B8] group-hover:text-[#2563EB] mb-2" />
                  <p className="text-sm font-bold text-[#0F172A]">Click to upload or drag and drop</p>
                  <p className="text-xs text-[#64748B] mt-1">PDF, JPG, PNG, MP4 &middot; Max 50MB</p>
                </button>
              </div>

            </form>
          </div>
          
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" form="assign-material-form" className="px-5 py-2 text-sm font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors">
              Assign Material
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function HRInternDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Mock Intern Data
  const emp = {
    id: id || 'INT-001',
    name: 'Alex Wong',
    email: 'alex.w@movicloudlabs.com',
    phone: '+1 (555) 123-4567',
    university: 'Massachusetts Institute of Technology',
    major: 'Computer Science',
    department: 'Engineering',
    designation: 'Software Engineering Intern',
    type: 'Intern',
    status: 'Active',
    joined: 'Jan 10, 2024',
    endDate: 'Jul 10, 2024',
    duration: '6 Months',
    mentor: 'Sarah Jenkins',
    hrRepresentative: 'Amanda Reed',
    location: 'San Francisco, CA (HQ)',
    stipend: '$5,000 / month',
    leaveBalance: '5 Days (Pro-rated)',
    sickLeave: '3 Days'
  };

  const activityHistory = [
    { id: 1, action: 'Mid-term evaluation submitted by mentor', time: 'April 15, 2024', icon: 'star_rate', color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 2, action: 'Completed module: "Frontend Architecture Basics"', time: 'March 10, 2024', icon: 'school', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 3, action: 'First pull request merged into main branch', time: 'Feb 20, 2024', icon: 'code', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 4, action: 'Assigned to "Cloud Migration Phase 2" project', time: 'Jan 15, 2024', icon: 'work', color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 5, action: 'Onboarding completed successfully', time: 'Jan 12, 2024', icon: 'verified', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const [learningMaterials, setLearningMaterials] = useState([
    { _id: "m1", title: "OWMS Internal Guidelines", type: "Document", deadline: "2024-02-01", status: "Completed", assignedAt: "2024-01-11T10:00:00Z" },
    { _id: "m2", title: "React Performance Optimization", type: "Video", deadline: "2024-03-15", status: "Completed", assignedAt: "2024-02-20T10:00:00Z" },
    { _id: "m3", title: "Advanced MongoDB Aggregations", type: "Course", deadline: "2024-05-30", status: "In Progress", assignedAt: "2024-04-10T10:00:00Z" },
  ]);

  const handleAssignMaterial = (newMaterial) => {
    setLearningMaterials([newMaterial, ...learningMaterials]);
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'Video': return <Play size={16} className="text-[#DC2626]" />;
      case 'Document': return <FileText size={16} className="text-[#2563EB]" />;
      case 'Link': return <ExternalLink size={16} className="text-[#16A34A]" />;
      case 'Course': return <GraduationCap size={16} className="text-[#7C3AED]" />;
      default: return <FileText size={16} className="text-[#64748B]" />;
    }
  };

  const getBgForType = (type) => {
    switch(type) {
      case 'Video': return 'bg-[#FEF2F2]';
      case 'Document': return 'bg-[#EFF6FF]';
      case 'Link': return 'bg-[#DCFCE7]';
      case 'Course': return 'bg-[#F5F3FF]';
      default: return 'bg-slate-100';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <PageWrapper>
      <div className="font-sans text-[#0F172A] max-w-6xl mx-auto space-y-6 pb-20">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[13px] text-[#64748B] font-medium pt-2">
          <button onClick={() => navigate('/hr/interns')} className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">school</span> Interns
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#0F172A]">{emp.name}</span>
        </div>

        {/* Profile Summary Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-[32px] font-bold shrink-0 relative border border-[#A7F3D0]">
                {emp.name.split(' ').map(n=>n[0]).join('')}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#16A34A] border-2 border-white rounded-full"></div>
              </div>
              
              {/* Name & Primary Details */}
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A] leading-none">{emp.name}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#16A34A]/10 text-[#16A34A]">
                    {emp.status}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-emerald-100 text-emerald-700">
                    {emp.type}
                  </span>
                </div>
                <p className="text-[15px] text-[#0F172A] font-medium mb-1">
                  {emp.designation} <span className="text-[#CBD5E1] mx-1">•</span> {emp.department}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#64748B] mt-3">
                   <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      Mentor: <span className="font-medium text-[#2563EB] cursor-pointer hover:underline">{emp.mentor}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">badge</span>
                      Assigned HR: <span className="font-medium text-[#2563EB] cursor-pointer hover:underline">{emp.hrRepresentative}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {emp.location}
                   </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-3 shrink-0">
              <button className="border border-[#E2E8F0] bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
              </button>
              <button className="border border-[#E2E8F0] bg-white text-[#2563EB] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">chat</span> Message
              </button>
            </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-[#E2E8F0] px-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'overview' ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            Overview
            {activeTab === 'overview' && <motion.div layoutId="hrInternTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />}
          </button>
          <button 
            onClick={() => setActiveTab('learning')}
            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'learning' ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            Learning Management
            {activeTab === 'learning' && <motion.div layoutId="hrInternTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />}
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 3-Column Information Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Identity & Education */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                    <span className="material-symbols-outlined text-[#64748B]">badge</span>
                    Identity & Education
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Intern ID</span>
                      <span className="text-[14px] font-medium text-[#0F172A] font-mono">{emp.id}</span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">University / College</span>
                      <span className="text-[14px] font-medium text-[#0F172A]">{emp.university}</span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Major / Degree</span>
                      <span className="text-[14px] font-medium text-[#0F172A]">{emp.major}</span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Contact Details</span>
                      <div className="flex flex-col gap-1 mt-1">
                        <a href={`mailto:${emp.email}`} className="text-[13px] font-medium text-[#2563EB] hover:underline">{emp.email}</a>
                        <span className="text-[13px] font-medium text-[#0F172A]">{emp.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Mentorship & Progress */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                    <span className="material-symbols-outlined text-[#64748B]">group</span>
                    Mentorship & Progress
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Assigned Mentor</span>
                      <div className="flex items-center gap-2 mt-1 cursor-pointer group">
                        <div className="w-6 h-6 rounded-full bg-[#E2E8F0] text-[#475569] flex items-center justify-center text-[10px] font-bold">SJ</div>
                        <span className="text-[14px] font-medium text-[#2563EB] group-hover:underline">{emp.mentor}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Overall Progress Score</span>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] w-[85%] rounded-full"></div>
                        </div>
                        <span className="text-[13px] font-bold text-[#10B981]">85%</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Evaluations Completed</span>
                      <span className="text-[14px] font-medium text-[#0F172A]">1 of 2 (Mid-Term Done)</span>
                    </div>
                    <div>
                      <button className="text-[13px] font-medium text-[#2563EB] border border-[#2563EB] hover:bg-blue-50 px-3 py-1.5 rounded transition-colors w-full">
                        Request Final Evaluation
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Internship Details */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-6 relative">
                  <button className="absolute top-6 right-6 text-[12px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">request_quote</span> Stipend
                  </button>
                  <h2 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                    <span className="material-symbols-outlined text-[#64748B]">work</span>
                    Internship Details
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Duration</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                        {emp.duration} ({emp.joined} to {emp.endDate})
                      </span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Monthly Stipend</span>
                      <span className="text-[14px] font-medium text-[#0F172A]">{emp.stipend}</span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Annual Leave Balance</span>
                      <span className="text-[14px] font-medium text-[#16A34A] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                        {emp.leaveBalance}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#64748B] mb-1">Sick Leave Balance</span>
                      <span className="text-[14px] font-medium text-[#D97706] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">medical_services</span>
                        {emp.sickLeave}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Intern Progress Timeline */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8">
                <div className="flex justify-between items-center mb-8 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0F172A]">Internship Progress Tracker</h2>
                    <p className="text-[13px] text-[#64748B] mt-1">A chronological timeline of {emp.name.split(' ')[0]}'s key milestones and evaluations.</p>
                  </div>
                  <button className="border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">history</span> Full Event Log
                  </button>
                </div>
                
                <div className="relative pl-4 sm:pl-8">
                  <div className="absolute left-[27px] sm:left-[43px] top-4 bottom-4 w-[2px] bg-[#E2E8F0]"></div>
                  <div className="space-y-8">
                    {activityHistory.map((item, index) => (
                      <div key={item.id} className="relative flex items-start gap-6 group">
                        <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center border-4 border-white shadow-sm relative z-10 shrink-0 group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pt-2 gap-2">
                          <div>
                            <p className="text-[15px] font-medium text-[#0F172A]">{item.action}</p>
                            {index === 0 && <p className="text-[13px] text-[#64748B] mt-0.5">Rating: Exceeds Expectations. Noted strong problem-solving skills.</p>}
                            {index === 1 && <p className="text-[13px] text-[#64748B] mt-0.5">Score: 95%. Required module completed.</p>}
                          </div>
                          <span className="text-[13px] font-medium text-[#94A3B8] whitespace-nowrap">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative flex items-center gap-6 mt-8">
                    <div className="w-10 h-10 flex items-center justify-center relative z-10 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-[#CBD5E1] border-2 border-white shadow-sm"></div>
                    </div>
                    <span className="text-[13px] font-medium text-[#94A3B8]">Start of Internship</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Assigned Learning Materials</h2>
                  <p className="text-sm text-[#64748B] mt-1">Manage and track learning resources assigned to {emp.name.split(' ')[0]}.</p>
                </div>
                <button 
                  onClick={() => setIsAssignModalOpen(true)}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  <UploadCloud size={18} /> Assign Material
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Material</th>
                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Assigned</th>
                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Deadline</th>
                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learningMaterials.length === 0 && (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-[#64748B]">No materials assigned yet.</td></tr>
                      )}
                      {learningMaterials.map(mat => (
                        <tr key={mat._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getBgForType(mat.type)}`}>
                                {getIconForType(mat.type)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#0F172A]">{mat.title}</p>
                                <p className="text-xs text-[#64748B] mt-0.5">{mat.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#0F172A]">{formatDate(mat.assignedAt)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-[#0F172A]">
                              <CalendarDays size={14} className="text-[#64748B]" /> {formatDate(mat.deadline)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {mat.status === 'Completed' && <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-1 rounded"><CheckCircle size={12} /> Completed</span>}
                            {mat.status === 'In Progress' && <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded"><Clock size={12} /> In Progress</span>}
                            {mat.status === 'Pending' && <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      <AssignMaterialModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        internName={emp.name}
        onAssign={handleAssignMaterial}
      />
    </PageWrapper>
  );
}
