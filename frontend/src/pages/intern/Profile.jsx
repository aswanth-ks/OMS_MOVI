import React, { useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { internAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const labelClass = 'text-[11px] uppercase tracking-wider font-semibold text-[#64748B]';
const valueClass = 'text-[14px] text-[#0F172A] font-medium';

export default function InternProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await internAPI.getProfile();
      setProfile(res.data?.data || null);
    } catch (error) {
      toast.error('Failed to load intern profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const relations = useMemo(() => ([
    { label: 'Mentor', value: profile?.mentor?.name || '-' },
    { label: 'HR Manager', value: profile?.hrManager?.name || '-' },
    { label: 'PMO Lead', value: profile?.pmoLead?.name || '-' },
    { label: 'Assigned Project', value: profile?.project?.name || 'Not assigned' },
  ]), [profile]);

  const onPasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setPasswordSaving(true);
      await internAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="py-20 text-center text-[#64748B]">Loading profile...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6 pb-10 font-sans">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0F172A]">Intern Profile</h1>
          <p className="text-sm text-[#64748B] mt-1">Your internship is connected with mentor, HR, and PMO for coordinated guidance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Identity</h2>
            <div className="space-y-3">
              <div><p className={labelClass}>Name</p><p className={valueClass}>{profile?.name || '-'}</p></div>
              <div><p className={labelClass}>Intern ID</p><p className={valueClass}>{profile?.employeeId || '-'}</p></div>
              <div><p className={labelClass}>Email</p><p className={valueClass}>{profile?.email || '-'}</p></div>
              <div><p className={labelClass}>College</p><p className={valueClass}>{profile?.college || '-'}</p></div>
              <div><p className={labelClass}>Department</p><p className={valueClass}>{profile?.department?.name || '-'}</p></div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Connected Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relations.map((item) => (
                <div key={item.label} className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC]">
                  <p className={labelClass}>{item.label}</p>
                  <p className={valueClass}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-[#E2E8F0] rounded-lg p-3 bg-white">
              <p className={labelClass}>Internship Duration</p>
              <p className={valueClass}>
                {profile?.internshipStart ? new Date(profile.internshipStart).toLocaleDateString() : '-'} - {profile?.internshipEnd ? new Date(profile.internshipEnd).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onPasswordSave} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="password" className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm" placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))} required />
            <input type="password" className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm" placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} required />
            <input type="password" className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm" placeholder="Confirm password" value={passwords.confirmPassword} onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))} required />
          </div>
          <button disabled={passwordSaving} className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-semibold disabled:opacity-50">
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}
