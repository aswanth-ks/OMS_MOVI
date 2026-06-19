import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { 
  Camera, Mail, Building2, Briefcase, User, Calendar, Clock, 
  Pencil, Lock, Check, X, Eye, EyeOff 
} from 'lucide-react';
import { employeeAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const formatDate = (isoStr) => {
  if (!isoStr || isoStr === "N/A") return "N/A";
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    linkedIn: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    bio: ''
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getProfile();
      const user = res.data.data;
      setProfile(user);
      
      const parts = (user.name || '').split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        phone: user.phone || '',
        address: user.address || '',
        linkedIn: user.linkedIn || '',
        emergencyContactName: user.emergencyContact?.name || '',
        emergencyContactPhone: user.emergencyContact?.phone || '',
        emergencyContactRelation: user.emergencyContact?.relation || '',
        bio: user.bio || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        phone: formData.phone,
        address: formData.address,
        linkedIn: formData.linkedIn,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        }
      };
      await employeeAPI.updateProfile(payload);
      toast.success('Personal info updated successfully');
      setIsEditingInfo(false);
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update personal info');
    }
  };

  const handleBioSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.updateProfile({ bio: formData.bio });
      toast.success('Bio updated successfully');
      setIsEditingBio(false);
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update bio');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await employeeAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center py-24">
          <span className="material-symbols-outlined text-[32px] text-[#2563EB] animate-spin">sync</span>
        </div>
      </PageWrapper>
    );
  }

  const userAvatar = profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PM';

  return (
    <PageWrapper>
      <div className="w-full flex flex-col gap-4 max-w-[1200px] mx-auto pb-8 font-sans text-left">
        
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
              <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white text-xl font-bold flex items-center justify-center relative group overflow-hidden">
                {userAvatar}
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mt-3">{profile?.name}</h2>
              <div className="bg-[#F1F5F9] font-mono text-xs text-[#64748B] px-2 py-0.5 rounded mt-1.5">{profile?.employeeId}</div>
              <div className="flex gap-1.5 mt-2.5">
                <span className="bg-[#DCFCE7] text-[#16A34A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">PMO</span>
                <span className="bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{profile?.department?.name || 'Management'}</span>
              </div>
            </div>

            <hr className="border-[#E2E8F0] my-4" />

            {/* Info List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate" title={profile?.email}>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">{profile?.college || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">{profile?.designation || 'PMO Lead'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#64748B] shrink-0" />
                <span className="text-xs text-[#0F172A] font-medium truncate">Joined: {formatDate(profile?.joinDate || profile?.createdAt)}</span>
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
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs bg-[#F8FAFC] text-[#64748B] cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled className="w-full p-2 border border-[#E2E8F0] rounded-md text-xs bg-[#F8FAFC] text-[#64748B] cursor-not-allowed" />
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

            {/* Section 2: Bio */}
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

          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
