import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Camera, Mail, Briefcase, User, Calendar, 
  Pencil, Lock, Check, X, Eye, EyeOff, XCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
// BACKEND: GET /api/employee/profile
const mockEmployee = {
  _id: "emp001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@movicloudlabs.com",
  employeeId: "EMP-2024-001",
  avatar: "JD",
  designation: "Developer",
  department: { name: "Engineering" },
  manager: { name: "Aswanth K" },
  startDate: "2023-05-10T00:00:00Z",
  phone: "+91 9876543210",
  address: "123 Tech Park, Bangalore",
  linkedIn: "linkedin.com/in/johndoe",
  emergencyContact: { name: "Jane Doe", phone: "+91 9876500000", relation: "Wife" },
  bio: "Experienced full-stack developer with a passion for building scalable web applications and intuitive user interfaces.",
  skills: ["React", "Node.js", "MongoDB", "Tailwind CSS", "JavaScript"]
};

const formatDate = (isoStr) => {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- SUB-COMPONENTS ---
const PasswordStrength = ({ password }) => {
  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) }
  ];
  
  const validCount = rules.filter(r => r.valid).length;
  let strength = 'Weak';
  let colors = ['bg-slate-200', 'bg-slate-200', 'bg-slate-200', 'bg-slate-200'];
  let textColor = 'text-[#64748B]';

  if (validCount === 1) { strength = 'Weak'; colors[0] = 'bg-[#DC2626]'; textColor = 'text-[#DC2626]'; }
  else if (validCount === 2) { strength = 'Fair'; colors[0] = 'bg-[#D97706]'; colors[1] = 'bg-[#D97706]'; textColor = 'text-[#D97706]'; }
  else if (validCount === 3) { strength = 'Good'; colors[0] = 'bg-[#2563EB]'; colors[1] = 'bg-[#2563EB]'; colors[2] = 'bg-[#2563EB]'; textColor = 'text-[#2563EB]'; }
  else if (validCount === 4) { strength = 'Strong'; colors = ['bg-[#16A34A]', 'bg-[#16A34A]', 'bg-[#16A34A]', 'bg-[#16A34A]']; textColor = 'text-[#16A34A]'; }

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5 mb-2 w-full">
        {colors.map((c, i) => <div key={i} className={`flex-1 rounded-full transition-colors ${c}`} />)}
      </div>
      <div className={`text-xs font-bold mb-3 ${password ? textColor : 'text-transparent'}`}>
        {password ? strength : '-'}
      </div>
      <div className="space-y-1.5">
        {rules.map((r, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs ${r.valid ? 'text-[#16A34A] font-medium' : 'text-[#64748B]'}`}>
            {r.valid ? <Check size={14} /> : <X size={14} />} {r.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function EmployeeProfile() {
  // Edit states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: mockEmployee.firstName,
    phone: mockEmployee.phone,
    address: mockEmployee.address,
    linkedIn: mockEmployee.linkedIn,
    emergencyContactName: mockEmployee.emergencyContact.name,
    emergencyContactPhone: mockEmployee.emergencyContact.phone,
    emergencyContactRelation: mockEmployee.emergencyContact.relation,
    bio: mockEmployee.bio,
    skills: [...mockEmployee.skills]
  });

  const [newSkill, setNewSkill] = useState('');

  // Password data
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    setIsEditingInfo(false);
    // BACKEND: PATCH /api/employee/profile
  };

  const handleBioSubmit = (e) => {
    e.preventDefault();
    setIsEditingBio(false);
  };

  const handleSkillsSubmit = (e) => {
    e.preventDefault();
    setIsEditingSkills(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return; // Validation
    // BACKEND: POST /api/employee/auth/change-password
    setPasswords({ current: '', new: '', confirm: '' });
    alert('Password updated successfully');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-6 max-w-[1200px] mx-auto pb-10 font-sans px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 shrink-0 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">My Profile</h1>
            <p className="text-sm text-[#64748B] mt-1">Manage your personal information and settings</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT COLUMN 35% */}
          <div className="w-full lg:w-[35%] bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm sticky top-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#7C3AED] text-white text-2xl font-bold flex items-center justify-center relative group cursor-pointer overflow-hidden">
                {mockEmployee.avatar}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white mb-1" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] mt-4">{mockEmployee.firstName} {mockEmployee.lastName}</h2>
              <div className="bg-[#F1F5F9] font-mono text-sm text-[#64748B] px-3 py-1 rounded mt-2">{mockEmployee.employeeId}</div>
              <div className="flex gap-2 mt-3">
                <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Employee</span>
                <span className="bg-[#F3E8FF] text-[#9333EA] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{mockEmployee.department.name}</span>
              </div>
            </div>

            <hr className="border-[#E2E8F0] my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#64748B]" />
                <span className="text-sm text-[#0F172A] font-medium truncate" title={mockEmployee.email}>{mockEmployee.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase size={16} className="text-[#64748B]" />
                <span className="text-sm text-[#0F172A] font-medium truncate">{mockEmployee.designation}</span>
              </div>
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#64748B]" />
                <span className="text-sm text-[#0F172A] font-medium truncate">Manager: {mockEmployee.manager.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[#64748B]" />
                <span className="text-sm text-[#0F172A] font-medium truncate">Joined: {formatDate(mockEmployee.startDate)}</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN 65% */}
          <div className="w-full lg:w-[65%] space-y-4">
            
            {/* Section 1: Personal Information */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-[#0F172A]">Personal Information</h2>
                {!isEditingInfo && (
                  <button onClick={() => setIsEditingInfo(true)} className="text-sm font-bold text-[#2563EB] hover:bg-[#EFF6FF] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
              
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                  <div className="relative group">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1">Last Name <Lock size={12} /></label>
                    <input type="text" value={mockEmployee.lastName} disabled className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] text-[#64748B] cursor-not-allowed" />
                    <div className="absolute top-0 right-0 mt-8 hidden group-hover:block bg-[#1E293B] text-white text-[10px] px-2 py-1 rounded z-10">Contact HR to update</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">LinkedIn Profile</label>
                    <input type="text" name="linkedIn" value={formData.linkedIn} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditingInfo} rows="2" className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none resize-none" />
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Name</label>
                      <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Relation</label>
                      <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Phone</label>
                      <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                    </div>
                  </div>
                </div>

                {isEditingInfo && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                    <button type="button" onClick={() => setIsEditingInfo(false)} className="px-4 py-2 text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
                  </div>
                )}
              </form>
            </div>

            {/* Section 2: About Me */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-[#0F172A]">Bio</h2>
                {!isEditingBio && (
                  <button onClick={() => setIsEditingBio(true)} className="text-sm font-bold text-[#2563EB] hover:bg-[#EFF6FF] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleBioSubmit}>
                {isEditingBio ? (
                  <>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleInputChange} 
                      maxLength={500} rows="4" 
                      placeholder="Write a short bio about yourself..."
                      className="w-full p-3 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-[#64748B]">{formData.bio.length}/500</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setIsEditingBio(false)} className="px-3 py-1.5 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors">Save Bio</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#0F172A] leading-relaxed">{formData.bio || <span className="text-[#94A3B8] italic">No bio provided.</span>}</p>
                )}
              </form>
            </div>

            {/* Section 3: Skills & Expertise */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-[#0F172A]">Skills & Expertise</h2>
                {!isEditingSkills && (
                  <button onClick={() => setIsEditingSkills(true)} className="text-sm font-bold text-[#2563EB] hover:bg-[#EFF6FF] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>
              
              {isEditingSkills ? (
                <form onSubmit={handleSkillsSubmit}>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={newSkill} 
                      onChange={(e) => setNewSkill(e.target.value)} 
                      placeholder="Add a new skill (e.g. Docker, Figma)" 
                      className="flex-1 p-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <button type="button" onClick={addSkill} className="px-4 py-2.5 bg-[#F1F5F9] text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors flex items-center gap-1">
                      <Plus size={18} /> <span className="text-sm font-bold">Add</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <AnimatePresence>
                      {formData.skills.map(skill => (
                        <motion.div 
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-3 py-1.5 rounded-full text-sm font-semibold"
                        >
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                            <XCircle size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
                    <button type="button" onClick={() => setIsEditingSkills(false)} className="px-3 py-1.5 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors">Save Skills</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map(skill => (
                      <span key={skill} className="bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#94A3B8] italic">No skills listed.</span>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Change Password */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="font-semibold text-[#0F172A] mb-5">Change Password</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="sm:col-span-2 max-w-[320px]">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showPwd.current ? "text" : "password"} value={passwords.current} onChange={e=>setPasswords({...passwords, current: e.target.value})} className="w-full p-2.5 pr-10 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none" required />
                      <button type="button" onClick={()=>setShowPwd({...showPwd, current: !showPwd.current})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"><Eye size={16} /></button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showPwd.new ? "text" : "password"} value={passwords.new} onChange={e=>setPasswords({...passwords, new: e.target.value})} className="w-full p-2.5 pr-10 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none" required />
                      <button type="button" onClick={()=>setShowPwd({...showPwd, new: !showPwd.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">{showPwd.new ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    <PasswordStrength password={passwords.new} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input type={showPwd.confirm ? "text" : "password"} value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm: e.target.value})} className={`w-full p-2.5 pr-10 border rounded-lg text-sm text-[#0F172A] focus:outline-none ${passwords.confirm && passwords.confirm !== passwords.new ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#2563EB]'}`} required />
                      <button type="button" onClick={()=>setShowPwd({...showPwd, confirm: !showPwd.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">{showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    {passwords.confirm && passwords.confirm !== passwords.new && <p className="text-xs text-[#DC2626] mt-1.5 font-medium">Passwords do not match</p>}
                  </div>
                  
                  <div className="sm:col-span-2 pt-2">
                    <button type="submit" disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm} className="px-5 py-2.5 text-sm font-bold bg-[#0F172A] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
