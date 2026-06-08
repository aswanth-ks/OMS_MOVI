import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Camera, Mail, Building2, Briefcase, User, Calendar, Clock, 
  Pencil, Lock, Check, X, Eye, EyeOff 
} from 'lucide-react';

// --- MOCK DATA ---
const mockProfile = {
  _id: "pmo001",
  firstName: "Aswanth",
  lastName: "K",
  email: "aswanth.k@pmo.movicloudlabs.com",
  employeeId: "PMO-2022-015",
  avatar: "AK",
  college: "University of Technology",
  department: { name: "Project Management Office" },
  project: { name: "OWMS Internal Platform" },
  mentor: { name: "Director of Operations" },
  startDate: "2022-06-10T00:00:00Z",
  endDate: "N/A",
  phone: "+1 (555) 345-6789",
  address: "789 Enterprise Blvd, Seattle, WA",
  linkedIn: "linkedin.com/in/aswanthk",
  emergencyContact: { name: "Priya K", phone: "+1 (555) 987-1234", relation: "Spouse" },
  bio: "Experienced PMO Lead driving agile transformations and ensuring project delivery excellence across multiple cross-functional teams.",
  performanceRatings: [
    { week: 1, rating: 5, note: "Successfully launched OWMS v1", date: "2024-03-30T10:00:00Z" },
    { week: 2, rating: 5, note: "Exceptional risk management", date: "2024-06-30T10:00:00Z" },
    { week: 3, rating: 4, note: "Good handling of resource constraints", date: "2024-09-30T10:00:00Z" },
    { week: 4, rating: 5, note: "Exceeded delivery targets", date: "2024-12-30T10:00:00Z" },
  ]
};

const formatDate = (isoStr) => {
  if (isoStr === "N/A") return "N/A";
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
    <div className="mt-1.5">
      <div className="flex gap-1 h-1 mb-1.5 w-full">
        {colors.map((c, i) => <div key={i} className={`flex-1 rounded-full transition-colors ${c}`} />)}
      </div>
      <div className={`text-[10px] font-bold mb-2 ${password ? textColor : 'text-transparent'}`}>
        {password ? strength : '-'}
      </div>
      <div className="space-y-1">
        {rules.map((r, i) => (
          <div key={i} className={`flex items-center gap-1.5 text-[10px] sm:text-xs ${r.valid ? 'text-[#16A34A] font-medium' : 'text-[#64748B]'}`}>
            {r.valid ? <Check size={12} /> : <X size={12} />} {r.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PMOProfile() {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: mockProfile.firstName,
    phone: mockProfile.phone,
    address: mockProfile.address,
    linkedIn: mockProfile.linkedIn,
    emergencyContactName: mockProfile.emergencyContact.name,
    emergencyContactPhone: mockProfile.emergencyContact.phone,
    emergencyContactRelation: mockProfile.emergencyContact.relation,
    bio: mockProfile.bio
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    setIsEditingInfo(false);
  };

  const handleBioSubmit = (e) => {
    e.preventDefault();
    setIsEditingBio(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return;
    setPasswords({ current: '', new: '', confirm: '' });
    alert('Password updated successfully');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageWrapper>
      {/* Compact layout */}
      <div className="w-full flex flex-col gap-4 max-w-[1200px] mx-auto pb-8 font-sans">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-4 shrink-0 mb-1">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">My Profile</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your personal information and settings</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* LEFT COLUMN 35% */}
          <div className="w-full lg:w-[35%] bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm sticky top-4">
            <div className="flex flex-col items-center">
              {/* Compact Avatar */}
              <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white text-xl font-bold flex items-center justify-center relative group cursor-pointer overflow-hidden">
                {mockProfile.avatar}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} className="text-white mb-0.5" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mt-3">{mockProfile.firstName} {mockProfile.lastName}</h2>
              <div className="bg-[#F1F5F9] font-mono text-xs text-[#64748B] px-2 py-0.5 rounded mt-1.5">{mockProfile.employeeId}</div>
              <div className="flex gap-1.5 mt-2.5">
                <span className="bg-[#DCFCE7] text-[#16A34A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">PMO</span>
                <span className="bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{mockProfile.department.name}</span>
              </div>
            </div>

            <hr className="border-[#E2E8F0] my-4" />

            {/* Compact Info List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate" title={mockProfile.email}>{mockProfile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">{mockProfile.college}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">{mockProfile.project.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">Reports to: {mockProfile.mentor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">Joined: {formatDate(mockProfile.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">Ending: {formatDate(mockProfile.endDate)}</span>
              </div>
            </div>

            <hr className="border-[#E2E8F0] my-4" />

            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Profile Completion</span>
                <span className="text-[9px] font-bold text-[#2563EB]">100% complete</span>
              </div>
              <div className="w-full h-1 bg-[#EFF6FF] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN 65% */}
          <div className="w-full lg:w-[65%] space-y-4">
            
            {/* Section 1: Personal Information */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">Personal Information</h2>
                {!isEditingInfo && (
                  <button onClick={() => setIsEditingInfo(true)} className="text-xs font-bold text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                )}
              </div>
              
              <form onSubmit={handleInfoSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                  <div className="relative group">
                    <label className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Last Name <Lock size={10} /></label>
                    <input type="text" value={mockProfile.lastName} disabled className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs bg-[#F8FAFC] text-[#64748B] cursor-not-allowed" />
                    <div className="absolute top-0 right-0 mt-6 hidden group-hover:block bg-[#1E293B] text-white text-[9px] px-1.5 py-0.5 rounded">Contact Admin</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">LinkedIn Profile</label>
                    <input type="text" name="linkedIn" value={formData.linkedIn} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditingInfo} rows="2" className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none resize-none" />
                </div>

                <div className="pt-1">
                  <h3 className="text-xs font-semibold text-[#0F172A] mb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Name</label>
                      <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Relation</label>
                      <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Phone</label>
                      <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} disabled={!isEditingInfo} className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#64748B] focus:border-[#2563EB] focus:outline-none" />
                    </div>
                  </div>
                </div>

                {isEditingInfo && (
                  <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                    <button type="button" onClick={() => setIsEditingInfo(false)} className="px-3 py-1.5 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-md transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-[#2563EB] text-white rounded-md hover:bg-blue-700 transition-colors">Save</button>
                  </div>
                )}
              </form>
            </div>

            {/* Section 2: About Me */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-[#0F172A]">Bio</h2>
                {!isEditingBio && (
                  <button onClick={() => setIsEditingBio(true)} className="text-xs font-bold text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleBioSubmit}>
                {isEditingBio ? (
                  <>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleInputChange} 
                      maxLength={500} rows="3" 
                      placeholder="Write a short bio..."
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-[#64748B]">{formData.bio.length}/500</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setIsEditingBio(false)} className="px-3 py-1.5 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-md transition-colors">Cancel</button>
                        <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-[#2563EB] text-white rounded-md hover:bg-blue-700 transition-colors">Save</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-[#0F172A] leading-relaxed">{formData.bio || <span className="text-[#94A3B8] italic">No bio provided.</span>}</p>
                )}
              </form>
            </div>

            {/* Section 3: Change Password */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                  <div className="sm:col-span-2 max-w-[280px]">
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showPwd.current ? "text" : "password"} value={passwords.current} onChange={e=>setPasswords({...passwords, current: e.target.value})} className="w-full p-2 pr-8 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none" required />
                      <button type="button" onClick={()=>setShowPwd({...showPwd, current: !showPwd.current})} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"><Eye size={14} /></button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">New Password</label>
                    <div className="relative">
                      <input type={showPwd.new ? "text" : "password"} value={passwords.new} onChange={e=>setPasswords({...passwords, new: e.target.value})} className="w-full p-2 pr-8 border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none" required />
                      <button type="button" onClick={()=>setShowPwd({...showPwd, new: !showPwd.new})} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">{showPwd.new ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                    <PasswordStrength password={passwords.new} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input type={showPwd.confirm ? "text" : "password"} value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm: e.target.value})} className={`w-full p-2 pr-8 border rounded-md text-xs text-[#0F172A] focus:outline-none ${passwords.confirm && passwords.confirm !== passwords.new ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E2E8F0] focus:border-[#2563EB]'}`} required />
                      <button type="button" onClick={()=>setShowPwd({...showPwd, confirm: !showPwd.confirm})} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]">{showPwd.confirm ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                    {passwords.confirm && passwords.confirm !== passwords.new && <p className="text-[10px] text-[#DC2626] mt-1 font-medium">Passwords mismatch</p>}
                  </div>
                  
                  <div className="sm:col-span-2 pt-1">
                    <button type="submit" disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm} className="px-4 py-2 text-xs font-bold bg-[#0F172A] text-white rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Section 4: My Performance */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Performance Ratings</h2>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
                      <th className="px-3 py-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Quarter</th>
                      <th className="px-3 py-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Rating</th>
                      <th className="px-3 py-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Note</th>
                      <th className="px-3 py-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProfile.performanceRatings.map((pr, idx) => (
                      <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-3 py-2 text-xs font-bold text-[#0F172A]">Q{pr.week}</td>
                        <td className="px-3 py-2 text-xs">
                          <div className="flex gap-0.5 text-amber-400">
                            {'★'.repeat(pr.rating)}{'☆'.repeat(5-pr.rating)}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-[#0F172A] max-w-[150px] truncate" title={pr.note}>{pr.note}</td>
                        <td className="px-3 py-2 text-xs text-[#64748B]">{formatDate(pr.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0F172A]">4.8</span>
                  <span className="text-xs font-bold text-[#64748B]">/5</span>
                </div>
                <div className="w-px h-6 bg-[#CBD5E1]"></div>
                <div>
                  <div className="flex gap-0.5 text-amber-400 text-sm mb-0.5">{'★'.repeat(5)}{'☆'.repeat(0)}</div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Annual Average</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
