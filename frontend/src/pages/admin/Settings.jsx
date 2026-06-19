import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, Shield, Bell, Palette, Database, Globe, Server,
  AlertTriangle, CheckCircle, EyeOff, ShieldCheck, Mail, ImagePlus,
  Download, Plus, Key, RefreshCw
} from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';
import { adminAPI } from '../../utils/api';

// ── Shared UI primitives ──────────────────────────────────────────────────────

const Toast = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed top-4 right-4 z-[100] bg-[#16A34A] text-white rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-lg"
      >
        <CheckCircle size={16} />
        <span className="text-[13px] font-medium">Settings saved successfully</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const TabNav = ({ tabs, activeTab, setActiveTab, isDirty }) => (
  <div className="w-52 min-w-[208px] bg-[#F8FAFC] border-r border-[#E2E8F0] p-2.5 flex flex-col gap-1 shrink-0">
    <div className="text-[10px] font-semibold text-[#94A3B8] tracking-widest px-2.5 py-1.5 mb-0.5">CONFIGURATION</div>
    <div className="flex-1 space-y-0.5">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setActiveTab(id)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-[13px] ${
            activeTab === id ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
          }`}
        >
          <Icon size={15} />
          <span className="flex-1 text-left">{label}</span>
          {isDirty && activeTab === id && <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />}
        </button>
      ))}
    </div>
    <div className="border-t border-[#E2E8F0] mt-2 pt-2 mx-1">
      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-2.5 flex items-start gap-1.5">
        <AlertTriangle size={12} className="text-[#D97706] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#92400E] leading-snug">Security and System changes take effect immediately.</p>
      </div>
    </div>
  </div>
);

const Section = ({ title, description, children, isDanger = false }) => (
  <div className={isDanger ? 'border border-[#DC2626] rounded-xl p-4 bg-[#FEF2F2]/30' : ''}>
    <h3 className={`text-[13px] font-semibold mb-0.5 ${isDanger ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>{title}</h3>
    {description && <p className="text-[12px] text-[#64748B] mb-3">{description}</p>}
    <div className="space-y-4">{children}</div>
  </div>
);

const Divider = () => <div className="border-t border-[#E2E8F0] my-5" />;

const Field = ({ label, helper, warning, error, children }) => (
  <div>
    <label className="block text-[12px] font-medium text-[#0F172A] mb-1">{label}</label>
    {children}
    {helper && !error && <p className="text-[11px] text-[#64748B] mt-1">{helper}</p>}
    {error && <p className="text-[11px] text-[#DC2626] mt-1 font-medium">{error}</p>}
    {warning && !error && (
      <div className="mt-1.5 bg-[#FEF3C7] border border-[#FDE68A] rounded p-1.5 text-[11px] text-[#92400E]">{warning}</div>
    )}
  </div>
);

const Toggle = ({ label, description, checked, onChange, isDanger = false }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <div className="text-[13px] font-medium text-[#0F172A] leading-snug">{label}</div>
      {description && <div className="text-[11px] text-[#64748B] mt-0.5">{description}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? (isDanger ? 'bg-[#DC2626]' : 'bg-[#2563EB]') : 'bg-[#CBD5E1]'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </button>
  </div>
);

const inputCls = 'w-full border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB] bg-white';
const selectCls = inputCls;
const inputErrCls = 'w-full border border-[#DC2626] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#DC2626] bg-white';

// ── Default state (matches schema defaults exactly) ────────────────────────────

const DEFAULTS = {
  // General
  appName: 'Office Workspace Management System', appShortName: 'OWMS',
  appUrl: 'https://owms.movicloudlabs.com', orgName: 'Movi Cloud Labs',
  orgDomain: 'movicloudlabs.com', timezone: '(GMT+05:30) Chennai, Mumbai, New Delhi',
  dateFormat: 'DD/MM/YYYY', timeFormat: '24-hour', language: 'English (US)',
  currency: 'INR', itemsPerPage: 25, defaultDashboard: 'Overview', sidebarDefault: 'Expanded',
  // Security
  minPasswordLength: 12, requireUppercase: true, requireLowercase: true,
  requireNumbers: true, requireSpecial: true, passwordExpiry: false,
  passwordExpiryDays: 90, passwordHistory: true, passwordHistoryCount: 5,
  sessionTimeout: '1 hour', maxConcurrentSessions: 3, rememberMe: true, rememberMeDays: 30,
  twoFactorPolicy: 'Optional', twoFactorMethods: { totp: true, email: true, sms: false },
  maxFailedLogins: 5, lockoutDuration: '15 min', ipAllowlist: false,
  ipAllowlistRanges: '192.168.1.0/24\n10.0.0.0/8',
  // Notifications
  smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUser: '', smtpPass: '',
  smtpEncryption: 'TLS', fromEmail: 'noreply@movicloudlabs.com', fromName: 'OWMS Notifications',
  notifyNewUser: true, notifyDeactivated: true, notifyFailedLogin: true,
  notifyPermissionChange: true, notifyReportGenerated: false, notifySystemErrors: true,
  notifyAuditExport: false, notifyNewDept: false, dailyDigest: false,
  dailyDigestTime: '08:00', weeklySummary: false, weeklySummaryDay: 'Monday',
  // Branding
  primaryColor: '#2563EB', accentColor: '#0F172A', loginTitle: 'Welcome to OWMS',
  loginSubtitle: 'Office Workspace Management System', showLogoOnLogin: true, loginBgStyle: 'Solid Color',
  // Data
  activityLogsRetention: '1 year', auditLogsRetention: '2 years',
  reportFilesRetention: '90 days', deletedRecords: 'Keep for 30 days',
  autoBackup: false, backupFrequency: 'Daily', backupTime: '02:00', backupRetention: 7,
  // System
  maintenanceMode: false, maintenanceMessage: 'System is under maintenance. Please check back later.',
  apiEnabled: true, apiRateLimit: 100,
};

// Flatten a nested settings document from the API into a single-level state object
const flattenSettings = (d) => ({
  ...(d.general      || {}),
  ...(d.security     || {}),
  twoFactorMethods: { ...DEFAULTS.twoFactorMethods, ...(d.security?.twoFactorMethods || {}) },
  ...(d.notifications || {}),
  ...(d.branding     || {}),
  ...(d.data         || {}),
  ...(d.system       || {}),
});

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty]     = useState(false);
  const [lastSaved, setLastSaved] = useState('Not saved yet');
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});

  const [s, setS] = useState(DEFAULTS);

  // Single updater — all tabs share one state object; switching tabs never loses edits
  const set = (key, val) => {
    setS(prev => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const fetchSettings = async () => {
    try {
      const res = await adminAPI.getSettings();
      const d = res.data?.data;
      if (d) setS({ ...DEFAULTS, ...flattenSettings(d) });
    } catch {
      // keep defaults on failure
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const validate = () => {
    const errs = {};
    const len = Number(s.minPasswordLength);
    if (isNaN(len) || len < 6 || len > 32) {
      errs.minPasswordLength = 'Must be a number between 6 and 32';
    }
    const rateLimit = Number(s.apiRateLimit);
    if (isNaN(rateLimit) || rateLimit < 1) {
      errs.apiRateLimit = 'Must be a positive number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await adminAPI.updateSettings({
        general: {
          appName: s.appName, appShortName: s.appShortName, appUrl: s.appUrl,
          orgName: s.orgName, orgDomain: s.orgDomain, timezone: s.timezone,
          dateFormat: s.dateFormat, timeFormat: s.timeFormat, language: s.language,
          currency: s.currency, itemsPerPage: s.itemsPerPage,
          defaultDashboard: s.defaultDashboard, sidebarDefault: s.sidebarDefault,
        },
        security: {
          minPasswordLength: Number(s.minPasswordLength),
          requireUppercase: s.requireUppercase, requireLowercase: s.requireLowercase,
          requireNumbers: s.requireNumbers, requireSpecial: s.requireSpecial,
          passwordExpiry: s.passwordExpiry, passwordExpiryDays: Number(s.passwordExpiryDays),
          passwordHistory: s.passwordHistory, passwordHistoryCount: Number(s.passwordHistoryCount),
          sessionTimeout: s.sessionTimeout, maxConcurrentSessions: Number(s.maxConcurrentSessions),
          rememberMe: s.rememberMe, rememberMeDays: Number(s.rememberMeDays),
          twoFactorPolicy: s.twoFactorPolicy,
          twoFactorMethods: { totp: s.twoFactorMethods.totp, email: s.twoFactorMethods.email, sms: s.twoFactorMethods.sms },
          maxFailedLogins: Number(s.maxFailedLogins), lockoutDuration: s.lockoutDuration,
          ipAllowlist: s.ipAllowlist, ipAllowlistRanges: s.ipAllowlistRanges,
        },
        notifications: {
          smtpHost: s.smtpHost, smtpPort: Number(s.smtpPort),
          smtpUser: s.smtpUser, smtpPass: s.smtpPass, smtpEncryption: s.smtpEncryption,
          fromEmail: s.fromEmail, fromName: s.fromName,
          notifyNewUser: s.notifyNewUser, notifyDeactivated: s.notifyDeactivated,
          notifyFailedLogin: s.notifyFailedLogin, notifyPermissionChange: s.notifyPermissionChange,
          notifyReportGenerated: s.notifyReportGenerated, notifySystemErrors: s.notifySystemErrors,
          notifyAuditExport: s.notifyAuditExport, notifyNewDept: s.notifyNewDept,
          dailyDigest: s.dailyDigest, dailyDigestTime: s.dailyDigestTime,
          weeklySummary: s.weeklySummary, weeklySummaryDay: s.weeklySummaryDay,
        },
        branding: {
          primaryColor: s.primaryColor, accentColor: s.accentColor,
          loginTitle: s.loginTitle, loginSubtitle: s.loginSubtitle,
          showLogoOnLogin: s.showLogoOnLogin, loginBgStyle: s.loginBgStyle,
        },
        data: {
          activityLogsRetention: s.activityLogsRetention,
          auditLogsRetention: s.auditLogsRetention,
          reportFilesRetention: s.reportFilesRetention,
          deletedRecords: s.deletedRecords,
          autoBackup: s.autoBackup, backupFrequency: s.backupFrequency,
          backupTime: s.backupTime, backupRetention: Number(s.backupRetention),
        },
        system: {
          maintenanceMode: s.maintenanceMode, maintenanceMessage: s.maintenanceMessage,
          apiEnabled: s.apiEnabled, apiRateLimit: Number(s.apiRateLimit),
        },
      });
      // Re-fetch from backend to confirm what was actually persisted
      await fetchSettings();
      setIsDirty(false);
      const now = new Date();
      setLastSaved(`Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      // keep dirty state so user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    await fetchSettings();
    setIsDirty(false);
    setErrors({});
  };

  const tabs = [
    { id: 'general',       label: 'General',       icon: SlidersHorizontal },
    { id: 'security',      label: 'Security',       icon: Shield },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
    { id: 'branding',      label: 'Branding',       icon: Palette },
    { id: 'data',          label: 'Data & Storage', icon: Database },
    { id: 'integrations',  label: 'Integrations',   icon: Globe },
    { id: 'system',        label: 'System',         icon: Server },
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        <Toast show={showToast} />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-[#0F172A]">Settings</h1>
            <p className="text-[12px] text-[#64748B] mt-0.5">Configure global application parameters, security policies, and system behavior.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
            <CheckCircle size={14} className="text-[#16A34A]" />
            Last saved: {lastSaved}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-5">
          <div className="bg-white rounded-xl border border-[#E2E8F0] h-full flex overflow-hidden shadow-sm">

            <TabNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} isDirty={isDirty} />

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 pb-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-2xl"
                >

                  {/* ── GENERAL ─────────────────────────────────────────────── */}
                  {activeTab === 'general' && (
                    <>
                      <Section title="Application Identity" description="Basic information identifying this application instance.">
                        <Field label="Application Name">
                          <input type="text" value={s.appName} onChange={e => set('appName', e.target.value)} className={inputCls} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Short Name / Acronym" helper="Used in browser tabs and compact areas">
                            <input type="text" value={s.appShortName} onChange={e => set('appShortName', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Application URL">
                            <input type="url" value={s.appUrl} onChange={e => set('appUrl', e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Organization Name">
                            <input type="text" value={s.orgName} onChange={e => set('orgName', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Organization Domain" helper="Used for email validation during onboarding">
                            <input type="text" value={s.orgDomain} onChange={e => set('orgDomain', e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Localization">
                        <Field label="Timezone">
                          <select value={s.timezone} onChange={e => set('timezone', e.target.value)} className={selectCls}>
                            <option>(GMT+05:30) Chennai, Mumbai, New Delhi</option>
                            <option>(GMT+00:00) London</option>
                            <option>(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                            <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                          </select>
                        </Field>
                        <div className="grid grid-cols-3 gap-4">
                          <Field label="Date Format">
                            <select value={s.dateFormat} onChange={e => set('dateFormat', e.target.value)} className={selectCls}>
                              {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD','DD MMM YYYY'].map(f => <option key={f}>{f}</option>)}
                            </select>
                          </Field>
                          <Field label="Time Format">
                            <select value={s.timeFormat} onChange={e => set('timeFormat', e.target.value)} className={selectCls}>
                              <option value="12-hour">12-hour (AM/PM)</option>
                              <option value="24-hour">24-hour</option>
                            </select>
                          </Field>
                          <Field label="Language">
                            <select value={s.language} onChange={e => set('language', e.target.value)} className={selectCls}>
                              {['English (US)','English (UK)','Spanish','French','German'].map(l => <option key={l}>{l}</option>)}
                            </select>
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Currency" helper="Used in financial reports">
                            <select value={s.currency} onChange={e => set('currency', e.target.value)} className={selectCls}>
                              {['USD','EUR','GBP','INR','JPY'].map(c => <option key={c}>{c}</option>)}
                            </select>
                          </Field>
                          <Field label="Items Per Page">
                            <select value={s.itemsPerPage} onChange={e => set('itemsPerPage', Number(e.target.value))} className={selectCls}>
                              {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </Field>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Display Preferences">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Default Dashboard View">
                            <select value={s.defaultDashboard} onChange={e => set('defaultDashboard', e.target.value)} className={selectCls}>
                              {['Overview','Analytics','Activity Feed'].map(v => <option key={v}>{v}</option>)}
                            </select>
                          </Field>
                          <Field label="Sidebar Default State">
                            <select value={s.sidebarDefault} onChange={e => set('sidebarDefault', e.target.value)} className={selectCls}>
                              <option>Expanded</option>
                              <option>Collapsed</option>
                            </select>
                          </Field>
                        </div>
                      </Section>
                    </>
                  )}

                  {/* ── SECURITY ────────────────────────────────────────────── */}
                  {activeTab === 'security' && (
                    <>
                      <Section title="Password Policy" description="Define requirements for all user passwords.">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Minimum Length" helper="Recommended: 12+" error={errors.minPasswordLength}>
                            <input
                              type="number" min="6" max="32"
                              value={s.minPasswordLength}
                              onChange={e => set('minPasswordLength', e.target.value)}
                              className={errors.minPasswordLength ? inputErrCls : inputCls}
                            />
                          </Field>
                          <Field label="Complexity">
                            <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC] space-y-2.5">
                              <Toggle label="Uppercase letters" checked={s.requireUppercase} onChange={v => set('requireUppercase', v)} />
                              <Toggle label="Lowercase letters" checked={s.requireLowercase} onChange={v => set('requireLowercase', v)} />
                              <Toggle label="Numbers"           checked={s.requireNumbers}   onChange={v => set('requireNumbers', v)} />
                              <Toggle label="Special characters" checked={s.requireSpecial}  onChange={v => set('requireSpecial', v)} />
                            </div>
                          </Field>
                        </div>
                        <div className="space-y-3">
                          <Toggle label="Enable password expiry" checked={s.passwordExpiry} onChange={v => set('passwordExpiry', v)} />
                          {s.passwordExpiry && (
                            <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1">
                              <Field label="Expire after (days)">
                                <input type="number" value={s.passwordExpiryDays} onChange={e => set('passwordExpiryDays', e.target.value)} className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]" />
                              </Field>
                            </div>
                          )}
                          <Toggle label="Prevent reuse of previous passwords" checked={s.passwordHistory} onChange={v => set('passwordHistory', v)} />
                          {s.passwordHistory && (
                            <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1">
                              <Field label="Cannot reuse last (n) passwords">
                                <input type="number" value={s.passwordHistoryCount} onChange={e => set('passwordHistoryCount', e.target.value)} className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]" />
                              </Field>
                            </div>
                          )}
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Session Management">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Session Timeout" helper="Auto-logout after inactivity" warning={s.sessionTimeout === 'Never' ? 'Never is not recommended for security' : null}>
                            <select value={s.sessionTimeout} onChange={e => set('sessionTimeout', e.target.value)} className={selectCls}>
                              {['15 min','30 min','1 hour','2 hours','4 hours','8 hours','Never'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </Field>
                          <Field label="Max Concurrent Sessions" helper="Devices a user can be logged in from">
                            <input type="number" value={s.maxConcurrentSessions} onChange={e => set('maxConcurrentSessions', e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                        <Toggle label="Allow Remember Me across browser sessions" description="Users can stay logged in" checked={s.rememberMe} onChange={v => set('rememberMe', v)} />
                        {s.rememberMe && (
                          <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1">
                            <Field label="Remember Me duration (days)">
                              <input type="number" value={s.rememberMeDays} onChange={e => set('rememberMeDays', e.target.value)} className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]" />
                            </Field>
                          </div>
                        )}
                      </Section>

                      <Divider />

                      <Section title="Two-Factor Authentication">
                        <Field label="2FA Policy">
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            {[
                              { val: 'Disabled', icon: EyeOff,    label: 'Disabled', desc: 'No 2FA required' },
                              { val: 'Optional', icon: Shield,     label: 'Optional', desc: "User's choice" },
                              { val: 'Required', icon: ShieldCheck, label: 'Required', desc: 'All users must set up' },
                            ].map(({ val, icon: Icon, label, desc }) => (
                              <div key={val} onClick={() => set('twoFactorPolicy', val)}
                                className={`border rounded-lg p-3 cursor-pointer transition-colors text-center ${
                                  s.twoFactorPolicy === val
                                    ? val === 'Required' ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#2563EB] bg-[#EFF6FF]'
                                    : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                                }`}
                              >
                                <Icon size={18} className={`mx-auto mb-1 ${s.twoFactorPolicy === val ? (val === 'Required' ? 'text-[#DC2626]' : 'text-[#2563EB]') : 'text-[#64748B]'}`} />
                                <div className={`text-[12px] font-semibold ${s.twoFactorPolicy === val ? (val === 'Required' ? 'text-[#DC2626]' : 'text-[#2563EB]') : 'text-[#0F172A]'}`}>{label}</div>
                                <div className="text-[11px] text-[#64748B] mt-0.5">{desc}</div>
                              </div>
                            ))}
                          </div>
                          {s.twoFactorPolicy === 'Required' && (
                            <p className="text-[11px] text-[#DC2626] mt-1.5 font-medium">All users will be forced to set up 2FA on next login.</p>
                          )}
                        </Field>
                        <Field label="Allowed 2FA Methods">
                          <div className="flex gap-5 mt-1">
                            {[['totp','Authenticator App'],['email','Email OTP'],['sms','SMS OTP']].map(([k,lbl]) => (
                              <label key={k} className="flex items-center gap-1.5 text-[13px] text-[#0F172A] cursor-pointer">
                                <input type="checkbox" checked={s.twoFactorMethods[k]}
                                  onChange={e => set('twoFactorMethods', { ...s.twoFactorMethods, [k]: e.target.checked })}
                                  className="w-3.5 h-3.5 text-[#2563EB] border-[#CBD5E1] rounded" />
                                {lbl}
                              </label>
                            ))}
                          </div>
                        </Field>
                      </Section>

                      <Divider />

                      <Section title="Login &amp; Access">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Max Failed Login Attempts" helper="Account locks after this many failures">
                            <input type="number" value={s.maxFailedLogins} onChange={e => set('maxFailedLogins', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Account Lockout Duration">
                            <select value={s.lockoutDuration} onChange={e => set('lockoutDuration', e.target.value)} className={selectCls}>
                              {['5 min','15 min','30 min','1 hour','Until admin unlocks'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </Field>
                        </div>
                        <Toggle label="Restrict access to specific IP ranges" description="IP Allowlist" checked={s.ipAllowlist} onChange={v => set('ipAllowlist', v)} />
                        {s.ipAllowlist && (
                          <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1">
                            <Field label="IP Ranges (one per line)">
                              <textarea rows={3} value={s.ipAllowlistRanges} onChange={e => set('ipAllowlistRanges', e.target.value)} className={`${inputCls} font-mono`} />
                            </Field>
                          </div>
                        )}
                      </Section>
                    </>
                  )}

                  {/* ── NOTIFICATIONS ────────────────────────────────────────── */}
                  {activeTab === 'notifications' && (
                    <>
                      <Section title="Email / SMTP">
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="SMTP Host">
                              <input type="text" placeholder="smtp.gmail.com" value={s.smtpHost} onChange={e => set('smtpHost', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="SMTP Port">
                              <input type="number" value={s.smtpPort} onChange={e => set('smtpPort', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Username">
                              <input type="text" value={s.smtpUser} onChange={e => set('smtpUser', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Password">
                              <input type="password" value={s.smtpPass} onChange={e => set('smtpPass', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Encryption">
                              <select value={s.smtpEncryption} onChange={e => set('smtpEncryption', e.target.value)} className={selectCls}>
                                <option>None</option><option>TLS</option><option>SSL</option>
                              </select>
                            </Field>
                          </div>
                          <button type="button" className="flex items-center gap-1.5 text-[13px] font-medium text-[#2563EB] hover:text-blue-700 transition-colors">
                            <Mail size={14} /> Send Test Email
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="From Email">
                            <input type="email" value={s.fromEmail} onChange={e => set('fromEmail', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="From Name">
                            <input type="text" value={s.fromName} onChange={e => set('fromName', e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="System Event Notifications" description="Which events trigger email alerts to admins.">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                          <Toggle label="New User Created"      checked={s.notifyNewUser}          onChange={v => set('notifyNewUser', v)} />
                          <Toggle label="User Deactivated"      checked={s.notifyDeactivated}      onChange={v => set('notifyDeactivated', v)} />
                          <Toggle label="Failed Login Attempts" checked={s.notifyFailedLogin}      onChange={v => set('notifyFailedLogin', v)} />
                          <Toggle label="Permission Changes"    checked={s.notifyPermissionChange} onChange={v => set('notifyPermissionChange', v)} />
                          <Toggle label="Report Generated"      checked={s.notifyReportGenerated}  onChange={v => set('notifyReportGenerated', v)} />
                          <Toggle label="System Errors"         checked={s.notifySystemErrors}     onChange={v => set('notifySystemErrors', v)} />
                          <Toggle label="Audit Log Exports"     checked={s.notifyAuditExport}      onChange={v => set('notifyAuditExport', v)} />
                          <Toggle label="New Department Created" checked={s.notifyNewDept}         onChange={v => set('notifyNewDept', v)} />
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Digest Emails">
                        <Toggle label="Daily Digest" description="Send daily summary to admins" checked={s.dailyDigest} onChange={v => set('dailyDigest', v)} />
                        {s.dailyDigest && (
                          <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1">
                            <Field label="Send at">
                              <input type="time" value={s.dailyDigestTime} onChange={e => set('dailyDigestTime', e.target.value)} className="w-32 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]" />
                            </Field>
                          </div>
                        )}
                        <Toggle label="Weekly Summary" description="Send weekly activity report" checked={s.weeklySummary} onChange={v => set('weeklySummary', v)} />
                        {s.weeklySummary && (
                          <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1">
                            <Field label="Send on">
                              <select value={s.weeklySummaryDay} onChange={e => set('weeklySummaryDay', e.target.value)} className="w-36 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]">
                                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d}>{d}</option>)}
                              </select>
                            </Field>
                          </div>
                        )}
                      </Section>
                    </>
                  )}

                  {/* ── BRANDING ─────────────────────────────────────────────── */}
                  {activeTab === 'branding' && (
                    <>
                      <Section title="Visual Identity">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Application Logo">
                            <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center flex flex-col items-center bg-[#F8FAFC]">
                              <ImagePlus className="text-[#94A3B8] mb-2" size={24} />
                              <span className="text-[12px] font-medium text-[#0F172A] mb-0.5">Upload Logo</span>
                              <span className="text-[11px] text-[#64748B] mb-3">SVG/PNG · Max 2MB · 200×50px</span>
                              <button type="button" className="text-[12px] font-medium text-[#2563EB] hover:text-blue-700">Browse Files</button>
                            </div>
                          </Field>
                          <Field label="Favicon">
                            <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center flex flex-col items-center bg-[#F8FAFC] h-full justify-center">
                              <ImagePlus className="text-[#94A3B8] mb-2" size={20} />
                              <span className="text-[11px] text-[#64748B] mb-3">ICO/PNG · 32×32px</span>
                              <button type="button" className="text-[12px] font-medium text-[#2563EB] hover:text-blue-700">Browse Files</button>
                            </div>
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Primary Color" helper="Buttons, active states, links">
                            <div className="flex items-center gap-2">
                              <input type="color" value={s.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                              <input type="text" value={s.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-28 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]" />
                              <span style={{ backgroundColor: s.primaryColor }} className="text-white text-[11px] px-2.5 py-1 rounded font-medium">Preview</span>
                            </div>
                          </Field>
                          <Field label="Accent Color">
                            <div className="flex items-center gap-2">
                              <input type="color" value={s.accentColor} onChange={e => set('accentColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                              <input type="text" value={s.accentColor} onChange={e => set('accentColor', e.target.value)} className="w-28 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]" />
                            </div>
                          </Field>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Login Page">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Title">
                            <input type="text" value={s.loginTitle} onChange={e => set('loginTitle', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Subtitle">
                            <input type="text" value={s.loginSubtitle} onChange={e => set('loginSubtitle', e.target.value)} className={inputCls} />
                          </Field>
                        </div>
                        <Toggle label="Show Organization Logo on Login" checked={s.showLogoOnLogin} onChange={v => set('showLogoOnLogin', v)} />
                        <Field label="Background Style">
                          <div className="flex gap-3 mt-1">
                            {['Solid Color','Gradient','Image'].map(style => (
                              <button key={style} type="button" onClick={() => set('loginBgStyle', style)}
                                className={`flex-1 border rounded-lg py-2 text-[12px] font-medium transition-colors ${s.loginBgStyle === style ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'}`}>
                                {style}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </Section>
                    </>
                  )}

                  {/* ── DATA & STORAGE ───────────────────────────────────────── */}
                  {activeTab === 'data' && (
                    <>
                      <Section title="Data Retention">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="User Activity Logs">
                            <select value={s.activityLogsRetention} onChange={e => set('activityLogsRetention', e.target.value)} className={selectCls}>
                              {['30 days','90 days','6 months','1 year','2 years','Forever'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </Field>
                          <Field label="Audit Logs" warning="Reducing may affect compliance reporting">
                            <select value={s.auditLogsRetention} onChange={e => set('auditLogsRetention', e.target.value)} className={selectCls}>
                              {['30 days','90 days','6 months','1 year','2 years','Forever'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </Field>
                          <Field label="Report Files">
                            <select value={s.reportFilesRetention} onChange={e => set('reportFilesRetention', e.target.value)} className={selectCls}>
                              {['7 days','30 days','90 days','1 year','Forever'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </Field>
                          <Field label="Deleted Records">
                            <select value={s.deletedRecords} onChange={e => set('deletedRecords', e.target.value)} className={selectCls}>
                              {['Permanently delete','Keep for 30 days','Keep for 90 days','Keep forever'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </Field>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Backup &amp; Export">
                        <Toggle label="Enable automatic database backups" checked={s.autoBackup} onChange={v => set('autoBackup', v)} />
                        {s.autoBackup && (
                          <div className="pl-4 border-l-2 border-[#E2E8F0] ml-1 grid grid-cols-3 gap-4">
                            <Field label="Frequency">
                              <select value={s.backupFrequency} onChange={e => set('backupFrequency', e.target.value)} className={selectCls}>
                                <option>Daily</option><option>Weekly</option><option>Monthly</option>
                              </select>
                            </Field>
                            <Field label="Time">
                              <input type="time" value={s.backupTime} onChange={e => set('backupTime', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Keep (backups)">
                              <input type="number" value={s.backupRetention} onChange={e => set('backupRetention', e.target.value)} className={inputCls} />
                            </Field>
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                          <button type="button" className="flex items-center gap-1.5 px-4 py-2 border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-[13px] font-medium transition-colors">
                            <Download size={14} /> Export All Data
                          </button>
                          <span className="text-[11px] text-[#64748B]">Exports all system data. May take several minutes.</span>
                        </div>
                      </Section>
                    </>
                  )}

                  {/* ── INTEGRATIONS ─────────────────────────────────────────── */}
                  {activeTab === 'integrations' && (
                    <>
                      <Section title="Connected Services" description="Manage third-party integrations and API connections.">
                        <div className="space-y-2">
                          {[
                            { name: 'Slack',             desc: 'Send notifications to Slack channels',   color: 'bg-purple-100' },
                            { name: 'Microsoft Teams',   desc: 'Integrate with Teams for alerts',        color: 'bg-indigo-100' },
                            { name: 'Google Workspace',  desc: 'Sync users with Google Directory',       color: 'bg-blue-100'   },
                            { name: 'JIRA',              desc: 'Link projects and tasks with JIRA',      color: 'bg-sky-100'    },
                            { name: 'GitHub',            desc: 'Connect repositories to projects',       color: 'bg-gray-200'   },
                            { name: 'Zapier',            desc: 'Automate workflows with 5000+ apps',     color: 'bg-orange-100' },
                          ].map(svc => (
                            <div key={svc.name} className="border border-[#E2E8F0] rounded-lg px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[13px] text-[#0F172A]/70 ${svc.color}`}>
                                  {svc.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-[13px] font-medium text-[#0F172A]">{svc.name}</div>
                                  <div className="text-[11px] text-[#64748B]">{svc.desc}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Not Connected</span>
                                <button type="button" className="text-[12px] font-medium text-[#2563EB] hover:text-blue-700">Configure</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Section>

                      <Divider />

                      <Section title="API Access">
                        <Toggle label={s.apiEnabled ? 'API Active' : 'API Disabled'} description="Allow external applications via REST API" checked={s.apiEnabled} onChange={v => set('apiEnabled', v)} />
                        <Field label="Rate Limit" error={errors.apiRateLimit}>
                          <div className="flex items-center gap-2">
                            <input type="number"
                              value={s.apiRateLimit}
                              onChange={e => set('apiRateLimit', e.target.value)}
                              className={`w-28 border ${errors.apiRateLimit ? 'border-[#DC2626]' : 'border-[#E2E8F0]'} rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2563EB]`}
                            />
                            <span className="text-[12px] text-[#64748B]">requests / minute</span>
                          </div>
                        </Field>
                        <div className="flex items-center gap-3 pt-1">
                          <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg text-[13px] font-medium transition-colors">
                            <Key size={14} className="text-[#64748B]" /> View API Keys
                          </button>
                          <button type="button" className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white hover:bg-blue-700 rounded-lg text-[13px] font-medium transition-colors">
                            <Plus size={14} /> Generate API Key
                          </button>
                        </div>
                      </Section>
                    </>
                  )}

                  {/* ── SYSTEM ───────────────────────────────────────────────── */}
                  {activeTab === 'system' && (
                    <>
                      <Section title="System Information">
                        <div className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-3">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                            {[
                              ['OWMS Version','v2.4.1'], ['Build Number','#20241012-a3f9'],
                              ['Environment','Production'], ['Node.js','v20.11.0'],
                              ['Database','MongoDB'], ['Last Deployed','Oct 12, 2024'],
                              ['Server Region','Asia South (Mumbai)'], ['Uptime','14 days, 6 hours'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                                <span className="text-[12px] text-[#64748B]">{k}</span>
                                <span className={`text-[12px] font-medium ${k === 'Environment' ? 'text-[#16A34A]' : 'text-[#0F172A]'} font-mono`}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Maintenance">
                        <Toggle label="Maintenance Mode" description="Non-admin users will be locked out" checked={s.maintenanceMode} onChange={v => set('maintenanceMode', v)} isDanger />
                        {s.maintenanceMode && (
                          <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-lg p-3">
                            <p className="text-[12px] font-medium text-[#DC2626] mb-2">⚠ Maintenance mode is ACTIVE.</p>
                            <Field label="Message shown to locked-out users">
                              <textarea rows={2} value={s.maintenanceMessage} onChange={e => set('maintenanceMessage', e.target.value)} className={`${inputCls} border-[#DC2626] focus:border-[#DC2626]`} />
                            </Field>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#D97706] hover:bg-[#FEF3C7] rounded-lg text-[13px] font-medium transition-colors">
                            <RefreshCw size={13} /> Clear Cache
                          </button>
                          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg text-[13px] font-medium transition-colors">
                            <Database size={13} className="text-[#64748B]" /> Re-index Search
                          </button>
                        </div>
                      </Section>

                      <Divider />

                      <Section title="Danger Zone" isDanger>
                        <div className="space-y-3">
                          {[
                            { label: 'Reset All User Passwords', desc: 'Forces all users to reset on next login', btn: 'Reset Passwords' },
                            { label: 'Clear All Audit Logs', desc: 'Permanently deletes all audit records. Cannot be undone.', btn: 'Clear Audit Logs' },
                            { label: 'Factory Reset', desc: 'Resets all settings to defaults. User data is preserved.', btn: 'Factory Reset' },
                          ].map(({ label, desc, btn }) => (
                            <div key={label} className="flex items-center justify-between border-b border-[#FECACA] pb-3 last:border-0 last:pb-0">
                              <div>
                                <div className="text-[13px] font-medium text-[#0F172A]">{label}</div>
                                <p className="text-[11px] text-[#64748B] mt-0.5">{desc}</p>
                              </div>
                              <button type="button" className="px-3 py-1.5 border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg text-[12px] font-medium transition-colors shrink-0 ml-4">
                                {btn}
                              </button>
                            </div>
                          ))}
                        </div>
                      </Section>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-52 right-0 bg-white border-t border-[#E2E8F0] px-6 py-3 flex items-center justify-between z-50 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <><div className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /><span className="text-[13px] text-[#D97706] font-medium">Unsaved changes</span></>
            ) : (
              <><CheckCircle size={14} className="text-[#16A34A]" /><span className="text-[13px] text-[#64748B]">All changes saved</span></>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button type="button" onClick={handleDiscard}
                className="text-[13px] font-medium text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] px-4 py-2 rounded-lg transition-colors">
                Discard
              </button>
            )}
            <button type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 ${isDirty ? 'bg-[#2563EB] hover:bg-blue-700 text-white' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'}`}
            >
              {saving && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
