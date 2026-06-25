import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, Shield, Bell, Palette, Server,
  Save, CheckCircle2, AlertTriangle,
  Eye, EyeOff, Upload, Mail, Lock, RefreshCw,
  AlertCircle, X,
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import AccessDenied from '../../components/shared/AccessDenied';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  blue:    '#2563EB',
  dark:    '#0F172A',
  gray:    '#64748B',
  lgray:   '#F8FAFC',
  border:  '#E2E8F0',
  green:   '#16A34A',
  red:     '#DC2626',
  amber:   '#D97706',
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex items-center rounded-full transition-colors duration-150 focus:outline-none shrink-0
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
    style={{ width: 44, height: 24, background: checked ? C.blue : C.border }}
  >
    <span
      className="inline-block rounded-full bg-white shadow transition-transform duration-150"
      style={{ width: 18, height: 18, transform: checked ? 'translateX(22px)' : 'translateX(3px)' }}
    />
  </button>
);

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, helper, error, children, required }) => (
  <div className="mb-5 last:mb-0">
    {label && (
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error  && <p className="text-xs text-[#DC2626] mt-1">{error}</p>}
    {helper && !error && <p className="text-xs text-[#64748B] mt-1">{helper}</p>}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ error, className = '', ...props }) => (
  <input
    className={`bg-white border rounded-lg px-3 py-2 text-sm text-[#0F172A] w-full
      focus:outline-none focus:ring-1 transition
      ${error
        ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
        : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'}
      disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
      ${className}`}
    {...props}
  />
);

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({ error, children, className = '', ...props }) => (
  <select
    className={`bg-white border rounded-lg px-3 py-2 text-sm text-[#0F172A] w-full
      focus:outline-none focus:ring-1 transition
      ${error
        ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
        : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]'}
      disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
      ${className}`}
    {...props}
  >
    {children}
  </select>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Card = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6 ${className}`}>
    {title && <h3 className="text-sm font-semibold text-[#0F172A] mb-0.5">{title}</h3>}
    {subtitle && <p className="text-xs text-[#64748B] mb-5">{subtitle}</p>}
    {!title && !subtitle ? children : <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>}
  </div>
);

// ─── Segment button group ─────────────────────────────────────────────────────
const SegmentGroup = ({ options, value, onChange, disabled }) => (
  <div className="flex rounded-lg overflow-hidden border border-[#E2E8F0]">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(opt.value)}
        className={`flex-1 px-3 py-2 text-sm font-medium transition-colors
          ${value === opt.value
            ? 'bg-[#2563EB] text-white'
            : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ label, sub, checked, onChange, disabled, border = true }) => (
  <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-[#F1F5F9] last:border-0' : ''}`}>
    <div>
      <p className="text-sm text-[#0F172A]">{label}</p>
      {sub && <p className="text-xs text-[#64748B] mt-0.5">{sub}</p>}
    </div>
    <Toggle checked={!!checked} onChange={onChange} disabled={disabled} />
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDatePreview = (fmt) => {
  const d = new Date();
  const dd  = String(d.getDate()).padStart(2, '0');
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (fmt === 'DD/MM/YYYY')  return `${dd}/${mm}/${yyyy}`;
  if (fmt === 'MM/DD/YYYY')  return `${mm}/${dd}/${yyyy}`;
  if (fmt === 'YYYY-MM-DD')  return `${yyyy}-${mm}-${dd}`;
  if (fmt === 'DD MMM YYYY') return `${dd} ${months[d.getMonth()]} ${yyyy}`;
  return '';
};

const TIMEZONES = [
  { value: 'Asia/Kolkata',        label: '(GMT+05:30) Chennai, Mumbai, New Delhi' },
  { value: 'UTC',                  label: '(GMT+00:00) UTC' },
  { value: 'America/New_York',     label: '(GMT-05:00) Eastern Time' },
  { value: 'America/Chicago',      label: '(GMT-06:00) Central Time' },
  { value: 'America/Los_Angeles',  label: '(GMT-08:00) Pacific Time' },
  { value: 'Europe/London',        label: '(GMT+00:00) London' },
  { value: 'Europe/Paris',         label: '(GMT+01:00) Paris, Berlin' },
  { value: 'Europe/Moscow',        label: '(GMT+03:00) Moscow' },
  { value: 'Asia/Dubai',           label: '(GMT+04:00) Dubai' },
  { value: 'Asia/Singapore',       label: '(GMT+08:00) Singapore, KL' },
  { value: 'Asia/Tokyo',           label: '(GMT+09:00) Tokyo' },
  { value: 'Australia/Sydney',     label: '(GMT+11:00) Sydney' },
];

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SettingsSkeleton = () => (
  <div className="flex bg-white rounded-xl border border-[#E2E8F0] overflow-hidden min-h-[600px]">
    <div className="w-56 bg-[#F8FAFC] border-r border-[#E2E8F0] p-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-[#E2E8F0] rounded-lg mb-2 animate-pulse" />
      ))}
    </div>
    <div className="flex-1 p-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`h-4 bg-[#E2E8F0] rounded animate-pulse mb-3 ${i % 3 === 2 ? 'w-1/2 mb-6' : ''}`} />
      ))}
    </div>
  </div>
);

// ─── Danger Confirmation Modal ────────────────────────────────────────────────
const DangerModal = ({ action, onCancel, onConfirm, loading }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const messages = {
    'factory-reset': {
      title: 'Reset to Factory Defaults?',
      body: 'This will restore ALL settings to their factory defaults. Your SMTP configuration, branding, security policy, and all other customisations will be permanently lost.',
      btn: 'Yes, Reset Settings',
    },
    'reset-passwords': {
      title: 'Force Password Reset?',
      body: 'All users will be required to set a new password on their next login. They will be unable to access OWMS until they do.',
      btn: 'Yes, Reset Passwords',
    },
  };
  const m = messages[action];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-[#FEE2E2] rounded-full p-3 mb-4">
              <AlertTriangle size={36} className="text-[#DC2626]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">{m.title}</h2>
            <p className="text-sm text-[#64748B]">{m.body}</p>
          </div>

          <div className="mb-5">
            <p className="text-sm text-[#64748B] mb-2">To confirm, type <strong className="text-[#0F172A]">CONFIRM</strong> below:</p>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type CONFIRM here"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 border border-[#E2E8F0] text-[#64748B] rounded-lg px-4 py-2 text-sm hover:bg-[#F8FAFC] transition"
            >
              Cancel
            </button>
            <button
              onClick={() => text === 'CONFIRM' && onConfirm()}
              disabled={text !== 'CONFIRM' || loading}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition
                ${text === 'CONFIRM' && !loading
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                  : 'bg-[#DC2626]/40 cursor-not-allowed'}`}
            >
              {loading ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" />Working…</span> : m.btn}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── TAB 1: General ───────────────────────────────────────────────────────────
const GeneralTab = ({ s, update, errors, canEdit }) => (
  <div>
    <Card title="Application Identity" subtitle="Core names used across the system, emails, and reports.">
      <Field label="Application Name" required error={errors['general.appName']}
        helper="Displayed in the browser tab and page header">
        <Input
          value={s.appName || ''}
          onChange={e => update('appName', e.target.value)}
          disabled={!canEdit}
          error={errors['general.appName']}
          placeholder="Office Workspace Management System"
        />
      </Field>
      <Field label="Organization Name" required error={errors['general.orgName']}
        helper="Used in emails and generated reports">
        <Input
          value={s.orgName || ''}
          onChange={e => update('orgName', e.target.value)}
          disabled={!canEdit}
          error={errors['general.orgName']}
          placeholder="Movi Cloud Labs"
        />
      </Field>
    </Card>

    <Card title="Localization" subtitle="Controls timestamps, date displays, and report formatting.">
      <Field label="Timezone" helper="Affects all timestamps and scheduled reports">
        <Select value={s.timezone || 'Asia/Kolkata'} onChange={e => update('timezone', e.target.value)} disabled={!canEdit}>
          {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
        </Select>
      </Field>

      <Field label="Date Format">
        <Select value={s.dateFormat || 'DD/MM/YYYY'} onChange={e => update('dateFormat', e.target.value)} disabled={!canEdit}>
          {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD','DD MMM YYYY'].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </Select>
        <p className="text-xs text-[#2563EB] mt-1.5 font-medium">
          Preview: {formatDatePreview(s.dateFormat || 'DD/MM/YYYY')}
        </p>
      </Field>

      <Field label="Time Format">
        <SegmentGroup
          options={[{ value: '12', label: '12-hour (AM/PM)' }, { value: '24', label: '24-hour' }]}
          value={s.timeFormat || '24'}
          onChange={v => update('timeFormat', v)}
          disabled={!canEdit}
        />
      </Field>
    </Card>

    <Card title="Display Preferences" subtitle="Controls default pagination across all list views.">
      <Field label="Default Items Per Page" error={errors['general.itemsPerPage']}>
        <SegmentGroup
          options={[10,25,50,100].map(n => ({ value: n, label: String(n) }))}
          value={s.itemsPerPage || 25}
          onChange={v => update('itemsPerPage', v)}
          disabled={!canEdit}
        />
      </Field>
    </Card>
  </div>
);

// ─── TAB 2: Security ──────────────────────────────────────────────────────────
const SecurityTab = ({ s, update, errors, canEdit }) => {
  const reqList = [];
  if (s.requireUppercase) reqList.push('uppercase letters');
  if (s.requireLowercase) reqList.push('lowercase letters');
  if (s.requireNumbers)   reqList.push('numbers');
  if (s.requireSpecial)   reqList.push('special characters');
  const policyDesc = reqList.length
    ? `at least ${s.minPasswordLength || 8} characters and contain ${reqList.join(', ')}`
    : `at least ${s.minPasswordLength || 8} characters`;

  return (
    <div>
      <Card title="Password Policy" subtitle="Rules applied when users create or change their password.">
        <Field label="Minimum Password Length" error={errors['security.minPasswordLength']}>
          <div className="flex items-center gap-4">
            <input
              type="range" min={6} max={32} step={1}
              value={s.minPasswordLength || 8}
              onChange={e => update('minPasswordLength', parseInt(e.target.value))}
              disabled={!canEdit}
              className="flex-1 accent-[#2563EB] disabled:opacity-40"
            />
            <span className="text-sm font-semibold text-[#2563EB] w-20 text-right shrink-0">
              {s.minPasswordLength || 8} chars
            </span>
          </div>
          {errors['security.minPasswordLength'] && (
            <p className="text-xs text-[#DC2626] mt-1">{errors['security.minPasswordLength']}</p>
          )}
        </Field>

        <Field label="Password Requirements">
          <div className="space-y-0">
            {[
              { field: 'requireUppercase', label: 'Require uppercase letters (A–Z)' },
              { field: 'requireLowercase', label: 'Require lowercase letters (a–z)' },
              { field: 'requireNumbers',   label: 'Require numbers (0–9)' },
              { field: 'requireSpecial',   label: 'Require special characters (!@#$…)' },
            ].map(row => (
              <ToggleRow
                key={row.field}
                label={row.label}
                checked={!!s[row.field]}
                onChange={v => update(row.field, v)}
                disabled={!canEdit}
              />
            ))}
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-3 mt-3 text-xs text-[#64748B]">
            A valid password must be <span className="font-medium text-[#0F172A]">{policyDesc}</span>.
          </div>
        </Field>

        <Field label="Password Expiry">
          <ToggleRow
            label="Enable password expiry"
            sub="Users will be forced to reset their password periodically"
            checked={!!s.passwordExpiryEnabled}
            onChange={v => update('passwordExpiryEnabled', v)}
            disabled={!canEdit}
            border={false}
          />
          <AnimatePresence>
            {s.passwordExpiryEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden mt-3"
              >
                <Field label="Expire passwords every (days)" helper="Users will be forced to reset after this many days">
                  <Input
                    type="number" min={30} max={365}
                    value={s.passwordExpiryDays || 90}
                    onChange={e => update('passwordExpiryDays', parseInt(e.target.value))}
                    disabled={!canEdit}
                    className="w-32"
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </Field>
      </Card>

      <Card title="Session & Account Lockout" subtitle="Controls how long sessions last and how failed logins are handled.">
        <Field label="Session Timeout">
          <Select
            value={s.sessionTimeout || '1hour'}
            onChange={e => update('sessionTimeout', e.target.value)}
            disabled={!canEdit}
          >
            {[
              { v: '15min',  l: '15 minutes' },
              { v: '30min',  l: '30 minutes' },
              { v: '1hour',  l: '1 hour' },
              { v: '2hours', l: '2 hours' },
              { v: '4hours', l: '4 hours' },
              { v: '8hours', l: '8 hours' },
              { v: 'never',  l: 'Never' },
            ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </Select>
          {s.sessionTimeout === 'never' && (
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded p-2 mt-2 text-xs text-[#92400E] flex items-start gap-2">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              Setting session timeout to Never is not recommended for enterprise security.
            </div>
          )}
        </Field>

        <Field label="Max Failed Login Attempts"
          helper="Account will be locked after this many consecutive failed attempts"
          error={errors['security.maxFailedLogins']}>
          <Input
            type="number" min={3} max={10}
            value={s.maxFailedLogins || 5}
            onChange={e => update('maxFailedLogins', parseInt(e.target.value))}
            disabled={!canEdit}
            className="w-28"
          />
        </Field>

        <Field label="Account Lockout Duration">
          <Select
            value={s.lockoutDuration || '15min'}
            onChange={e => update('lockoutDuration', e.target.value)}
            disabled={!canEdit}
          >
            {[
              { v: '5min',               l: '5 minutes' },
              { v: '15min',              l: '15 minutes' },
              { v: '30min',              l: '30 minutes' },
              { v: '1hour',              l: '1 hour' },
              { v: 'until_admin_unlock', l: 'Until admin manually unlocks' },
            ].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </Select>
        </Field>
      </Card>

      <Card title="Two-Factor Authentication" subtitle="Controls the 2FA requirement across all user accounts.">
        <div className="space-y-2">
          {[
            { v: 'disabled', icon: <EyeOff size={18} />, title: 'Disabled',  sub: 'No 2FA required for any user' },
            { v: 'optional', icon: <Shield  size={18} />, title: 'Optional',  sub: 'Users can choose to enable 2FA' },
            { v: 'required', icon: <Lock    size={18} />, title: 'Required',  sub: 'All users must complete 2FA setup' },
          ].map(opt => {
            const active = (s.twoFactorPolicy || 'optional') === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                disabled={!canEdit}
                onClick={() => canEdit && update('twoFactorPolicy', opt.v)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition
                  ${active
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'}
                  ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className={active ? 'text-[#2563EB]' : 'text-[#64748B]'}>{opt.icon}</span>
                <div>
                  <p className={`text-sm font-medium ${active ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>{opt.title}</p>
                  <p className="text-xs text-[#64748B]">{opt.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
        {s.twoFactorPolicy === 'required' && (
          <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-lg p-3 mt-3 text-xs text-[#DC2626]">
            <strong>Warning:</strong> Enabling Required 2FA will force ALL users to set up two-factor authentication on their next login. Users without 2FA will be blocked until they complete setup.
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── TAB 3: Notifications ─────────────────────────────────────────────────────
const NotificationsTab = ({ s, update, errors, canEdit, userEmail }) => {
  const [showPass, setShowPass]           = useState(false);
  const [testing, setTesting]             = useState(false);
  const [testResult, setTestResult]       = useState(null); // null | { ok, msg }

  const handleTestEmail = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await adminAPI.testEmail();
      setTestResult({ ok: true, msg: res.data.message || `Test email sent to ${userEmail}` });
      setTimeout(() => setTestResult(null), 5000);
    } catch (err) {
      setTestResult({ ok: false, msg: err.response?.data?.message || 'Failed to connect to SMTP server.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <Card title="Email Configuration" subtitle="SMTP server settings used to send all system emails.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="SMTP Host">
            <Input
              value={s.smtpHost || ''}
              onChange={e => update('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
              disabled={!canEdit}
            />
          </Field>
          <Field label="SMTP Port">
            <Input
              type="number"
              value={s.smtpPort || 587}
              onChange={e => update('smtpPort', parseInt(e.target.value))}
              disabled={!canEdit}
              className="w-full"
            />
          </Field>
          <Field label="SMTP Username">
            <Input
              value={s.smtpUser || ''}
              onChange={e => update('smtpUser', e.target.value)}
              placeholder="your@email.com"
              disabled={!canEdit}
            />
          </Field>
          <Field label="SMTP Password">
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                value={s.smtpPass || ''}
                onChange={e => update('smtpPass', e.target.value)}
                placeholder="Leave blank to keep existing"
                disabled={!canEdit}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Leave blank to keep the currently stored password.</p>
          </Field>
        </div>

        <Field label="Encryption">
          <SegmentGroup
            options={[
              { value: 'none', label: 'None' },
              { value: 'TLS',  label: 'TLS'  },
              { value: 'SSL',  label: 'SSL'  },
            ]}
            value={s.smtpEncryption || 'TLS'}
            onChange={v => update('smtpEncryption', v)}
            disabled={!canEdit}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="From Email Address" error={errors['notifications.fromEmail']}>
            <Input
              type="email"
              value={s.fromEmail || ''}
              onChange={e => update('fromEmail', e.target.value)}
              placeholder="noreply@movicloudlabs.com"
              disabled={!canEdit}
              error={errors['notifications.fromEmail']}
            />
          </Field>
          <Field label="From Display Name" helper="Appears as sender name in all system emails">
            <Input
              value={s.fromName || ''}
              onChange={e => update('fromName', e.target.value)}
              placeholder="OWMS Notifications"
              disabled={!canEdit}
            />
          </Field>
        </div>

        <div className="mt-2">
          {!testResult ? (
            <button
              onClick={handleTestEmail}
              disabled={testing || !canEdit}
              className="flex items-center gap-2 bg-[#EFF6FF] border border-[#2563EB] text-[#2563EB] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#DBEAFE] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing
                ? <><RefreshCw size={14} className="animate-spin" /> Sending…</>
                : <><Mail size={14} /> Send Test Email</>
              }
            </button>
          ) : testResult.ok ? (
            <div className="flex items-center gap-2 text-[#16A34A] text-sm font-medium">
              <CheckCircle2 size={16} /> {testResult.msg}
            </div>
          ) : (
            <div className="flex items-start gap-2 text-[#DC2626] text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {testResult.msg}
            </div>
          )}
        </div>
      </Card>

      <Card title="System Event Notifications"
        subtitle="Configure which events trigger email notifications to system administrators.">
        {[
          { field: 'notifyNewUser',          label: 'New user created',          sub: 'When Admin creates a new user account' },
          { field: 'notifyUserDeactivated',  label: 'User deactivated',          sub: 'When a user account is disabled or removed' },
          { field: 'notifyFailedLogin',      label: 'Failed login attempts',     sub: 'When an account has 3+ consecutive failed logins' },
          { field: 'notifyPermissionChange', label: 'Permission changes',        sub: 'When Access Matrix is modified' },
          { field: 'notifySystemError',      label: 'System errors',             sub: 'When critical backend errors occur' },
          { field: 'notifyLeaveRequest',     label: 'Leave requests',            sub: 'When employees or interns submit leave requests' },
          { field: 'notifyReportGenerated',  label: 'Report generated',          sub: 'When a scheduled report completes' },
        ].map(row => (
          <ToggleRow
            key={row.field}
            label={row.label}
            sub={row.sub}
            checked={!!s[row.field]}
            onChange={v => update(row.field, v)}
            disabled={!canEdit}
          />
        ))}
      </Card>
    </div>
  );
};

// ─── TAB 4: Branding ──────────────────────────────────────────────────────────
const BrandingTab = ({ s, update, canEdit }) => {
  const fileInputRef               = useRef(null);
  const [uploading, setUploading]  = useState(false);
  const [uploadMsg, setUploadMsg]  = useState(null); // { ok, msg }
  const [preview, setPreview]      = useState(null);

  const handleLogoFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadMsg({ ok: false, msg: 'File exceeds 2 MB limit.' });
      return;
    }
    // Local preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await adminAPI.uploadLogo(fd);
      const logoUrl = res.data.data?.logoUrl;
      if (logoUrl) update('logoPath', logoUrl.replace('/uploads/avatars/', ''));
      setUploadMsg({ ok: true, msg: 'Logo uploaded successfully.' });
    } catch (err) {
      setUploadMsg({ ok: false, msg: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const logoSrc = preview || (s.logoPath ? `/uploads/avatars/${s.logoPath}` : null);

  return (
    <div>
      <Card title="Company Logo" subtitle="Displayed in the application header and generated reports.">
        {logoSrc && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <img src={logoSrc} alt="Company logo" className="h-10 object-contain" />
            <div className="flex-1">
              <p className="text-xs font-medium text-[#0F172A]">Current Logo</p>
            </div>
            {canEdit && (
              <button
                onClick={() => { update('logoPath', null); setPreview(null); }}
                className="text-xs text-[#DC2626] hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        )}

        <div
          onClick={() => canEdit && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center transition
            ${canEdit && !uploading ? 'cursor-pointer hover:border-[#2563EB] hover:bg-[#F8FAFC]' : 'opacity-50 cursor-not-allowed'}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={24} className="text-[#2563EB] animate-spin" />
              <p className="text-sm text-[#64748B]">Uploading…</p>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm text-[#64748B] mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-[#94A3B8]">SVG, PNG, JPG · Max 2 MB · Recommended: 200×50 px</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/svg+xml"
          className="hidden"
          onChange={e => handleLogoFile(e.target.files[0])}
        />
        {uploadMsg && (
          <p className={`text-xs mt-2 ${uploadMsg.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {uploadMsg.msg}
          </p>
        )}
      </Card>

      <Card title="Login Page Text" subtitle="Text displayed on the login screen.">
        <Field label="Login Page Title" helper="Large heading shown on the login page">
          <Input
            value={s.loginTitle || ''}
            onChange={e => update('loginTitle', e.target.value)}
            disabled={!canEdit}
            placeholder="Welcome to OWMS"
          />
        </Field>
        <Field label="Login Page Subtitle" helper="Smaller text below the title">
          <Input
            value={s.loginSubtitle || ''}
            onChange={e => update('loginSubtitle', e.target.value)}
            disabled={!canEdit}
            placeholder="Office Workspace Management System"
          />
        </Field>

        <div className="mt-2">
          <p className="text-xs text-[#64748B] mb-2">Login Page Preview</p>
          <div className="bg-[#1E293B] rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#334155] mx-auto mb-4 flex items-center justify-center">
              <span className="text-[#94A3B8] text-xs font-bold">OW</span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{s.loginTitle || 'Welcome to OWMS'}</p>
            <p className="text-sm text-[#94A3B8]">{s.loginSubtitle || 'Office Workspace Management System'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 5: System ────────────────────────────────────────────────────────────
const SystemTab = ({ s, update, canEdit, isSuperAdmin, onDangerAction, updatedAt }) => {
  return (
    <div>
      {/* System Information — read-only */}
      <Card title="System Information" subtitle="Read-only runtime information about this installation.">
        <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 grid grid-cols-2 gap-x-8 gap-y-3">
          {[
            { label: 'Version',        value: '1.0.0' },
            { label: 'Platform',       value: 'OWMS — Movi Cloud Labs' },
            { label: 'API Status',     value: s.apiEnabled ? 'Active' : 'Disabled',
              color: s.apiEnabled ? '#16A34A' : '#DC2626' },
            { label: 'Last Updated',   value: updatedAt
                ? new Date(updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                : '—' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-[#64748B]">{item.label}</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: item.color || '#0F172A' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <div className={`rounded-xl border p-5 transition-colors ${s.maintenanceMode ? 'bg-[#FEF2F2] border-[#DC2626]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {s.maintenanceMode
                ? <AlertTriangle size={18} className="text-[#DC2626]" />
                : <Shield size={18} className="text-[#16A34A]" />
              }
              <span className={`text-sm font-semibold ${s.maintenanceMode ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
                Maintenance Mode — {s.maintenanceMode ? 'ACTIVE' : 'Off'}
              </span>
            </div>
            <Toggle checked={!!s.maintenanceMode} onChange={v => update('maintenanceMode', v)} disabled={!canEdit} />
          </div>
          <p className="text-xs text-[#64748B] mb-3">
            {s.maintenanceMode
              ? 'All non-admin users are currently locked out.'
              : 'All users can access the system normally.'}
          </p>
          {s.maintenanceMode && (
            <div className="bg-[#DC2626] text-white text-xs rounded-lg p-2 mb-3">
              ⚠ ACTIVE: Users see the maintenance message below instead of the application.
            </div>
          )}
        </div>

        <AnimatePresence>
          {s.maintenanceMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden mt-4"
            >
              <Field label="Maintenance Message"
                helper="Shown to all non-admin users while maintenance mode is active">
                <textarea
                  rows={3}
                  value={s.maintenanceMessage || ''}
                  onChange={e => update('maintenanceMessage', e.target.value)}
                  disabled={!canEdit}
                  placeholder="System is under maintenance. Please check back soon."
                  className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] w-full
                    focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none
                    disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed"
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* API Settings */}
      <Card title="API Settings" subtitle="Controls external API access to OWMS endpoints.">
        <ToggleRow
          label="Enable external API access"
          sub="Allow external systems to call OWMS API endpoints"
          checked={!!s.apiEnabled}
          onChange={v => update('apiEnabled', v)}
          disabled={!canEdit}
        />
        <AnimatePresence>
          {s.apiEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden mt-4"
            >
              <Field label="API Rate Limit (requests per minute)"
                error={errors['system.apiRateLimit']}
                helper="Maximum API calls allowed per minute per IP">
                <Input
                  type="number" min={10} max={1000}
                  value={s.apiRateLimit || 100}
                  onChange={e => update('apiRateLimit', parseInt(e.target.value))}
                  disabled={!canEdit}
                  error={errors['system.apiRateLimit']}
                  className="w-36"
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Danger Zone */}
      <div className="border border-[#DC2626] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-[#DC2626]" />
          <h3 className="text-base font-semibold text-[#DC2626]">Danger Zone</h3>
        </div>
        <p className="text-xs text-[#64748B] mb-5">These actions are irreversible. Proceed with extreme caution.</p>

        {/* Force password reset */}
        <div className="flex items-center justify-between py-4 border-b border-[#FEE2E2]">
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Force Password Reset</p>
            <p className="text-xs text-[#64748B] mt-0.5">All users will be required to set a new password on their next login.</p>
          </div>
          <button
            onClick={() => onDangerAction('reset-passwords')}
            disabled={!canEdit}
            className="border border-[#DC2626] text-[#DC2626] text-sm px-4 py-2 rounded-lg hover:bg-[#FEE2E2] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-4"
          >
            Reset All Passwords
          </button>
        </div>

        {/* Factory reset — super admin only */}
        {isSuperAdmin && (
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Factory Reset</p>
              <p className="text-xs text-[#64748B] mt-0.5">Restore all settings to defaults. User data is not affected.</p>
            </div>
            <button
              onClick={() => onDangerAction('factory-reset')}
              disabled={!canEdit}
              className="border border-[#DC2626] text-[#DC2626] text-sm px-4 py-2 rounded-lg hover:bg-[#FEE2E2] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-4"
            >
              Factory Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Settings page ───────────────────────────────────────────────────────
export default function Settings() {
  const { hasPermission, user } = useAuth();

  const canRead   = hasPermission('Settings', 'read');
  const canEdit   = hasPermission('Settings', 'update');
  const isSuperAdmin = user?.role?.slug === 'super-admin';

  const [settings,         setSettings]         = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [activeTab,        setActiveTab]        = useState('general');
  const [isDirty,          setIsDirty]          = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [saveError,        setSaveError]        = useState('');
  const [saveSuccess,      setSaveSuccess]      = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [dangerAction,     setDangerAction]     = useState(null);
  const [dangerLoading,    setDangerLoading]    = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canRead) return;
    (async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getSettings();
        const data = res.data.data;
        setSettings(data);
        setOriginalSettings(JSON.parse(JSON.stringify(data)));
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [canRead]);

  // ── Update field helper ───────────────────────────────────────────────────
  const updateField = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setIsDirty(true);
    setSaveError('');
    const key = `${section}.${field}`;
    if (validationErrors[key]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  // Section-scoped updater factory
  const updater = (section) => (field, value) => updateField(section, field, value);

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    const s = settings.security;
    const g = settings.general;
    const sys = settings.system;
    const n = settings.notifications;

    if ((s.minPasswordLength ?? 8) < 6 || (s.minPasswordLength ?? 8) > 32)
      errors['security.minPasswordLength'] = 'Must be between 6 and 32';
    if ((g.itemsPerPage ?? 25) < 10 || (g.itemsPerPage ?? 25) > 100)
      errors['general.itemsPerPage'] = 'Must be between 10 and 100';
    if ((sys.apiRateLimit ?? 100) < 10 || (sys.apiRateLimit ?? 100) > 1000)
      errors['system.apiRateLimit'] = 'Must be between 10 and 1000';
    if (n.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.fromEmail))
      errors['notifications.fromEmail'] = 'Invalid email format';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey) setActiveTab(firstKey.split('.')[0]);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload = JSON.parse(JSON.stringify(settings));
      if (!payload.notifications?.smtpPass) delete payload.notifications.smtpPass;

      const res = await adminAPI.saveSettings(payload);
      const saved = res.data.data;
      setSettings(saved);
      setOriginalSettings(JSON.parse(JSON.stringify(saved)));
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    try {
      const res = await adminAPI.getSettings();
      const data = res.data.data;
      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data)));
    } catch {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
    }
    setIsDirty(false);
    setSaveError('');
    setValidationErrors({});
  };

  // ── Danger actions ────────────────────────────────────────────────────────
  const handleDangerConfirm = async () => {
    setDangerLoading(true);
    try {
      if (dangerAction === 'factory-reset') {
        await adminAPI.resetSettings();
        const res = await adminAPI.getSettings();
        const data = res.data.data;
        setSettings(data);
        setOriginalSettings(JSON.parse(JSON.stringify(data)));
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else if (dangerAction === 'reset-passwords') {
        // Future endpoint — show informational message
        setSaveSuccess(false);
        setSaveError('Force password reset is not yet implemented.');
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Action failed.');
    } finally {
      setDangerLoading(false);
      setDangerAction(null);
    }
  };

  // ── Tab dirty detection ───────────────────────────────────────────────────
  const tabHasDiff = (tab) => {
    if (!settings || !originalSettings) return false;
    return JSON.stringify(settings[tab]) !== JSON.stringify(originalSettings[tab]);
  };
  const tabHasError = (tab) =>
    Object.keys(validationErrors).some(k => k.startsWith(tab + '.'));

  // ── Permission guard ──────────────────────────────────────────────────────
  if (!canRead) return <AccessDenied />;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || !settings) return (
    <div className="p-6 pb-24">
      <h1 className="text-xl font-bold text-[#0F172A] mb-6">Settings</h1>
      <SettingsSkeleton />
    </div>
  );

  const TABS = [
    { key: 'general',       label: 'General',       Icon: SlidersHorizontal },
    { key: 'security',      label: 'Security',      Icon: Shield },
    { key: 'notifications', label: 'Notifications', Icon: Bell },
    { key: 'branding',      label: 'Branding',      Icon: Palette },
    { key: 'system',        label: 'System',        Icon: Server },
  ];

  return (
    <div className="p-6 pb-28">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Configure system-wide settings for your OWMS installation.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex min-h-[640px]">

        {/* ── Left nav ── */}
        <div className="w-56 min-w-[224px] bg-[#F8FAFC] border-r border-[#E2E8F0] p-3 flex flex-col shrink-0">
          <p className="text-[10px] font-semibold text-[#94A3B8] tracking-widest px-3 py-2 mb-1">CONFIGURATION</p>
          <div className="space-y-0.5">
            {TABS.map(({ key, label, Icon }) => {
              const active = activeTab === key;
              const hasErr = tabHasError(key);
              const dirty  = tabHasDiff(key);
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                    ${active
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}
                  `}
                >
                  <Icon size={15} className={active ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
                  <span className="flex-1">{label}</span>
                  {hasErr && <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />}
                  {!hasErr && dirty && <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />}
                </button>
              );
            })}
          </div>

          {isDirty && (
            <div className="mt-auto mx-2 mb-2 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-[#92400E]">
                <AlertTriangle size={11} />
                <span className="font-medium">Unsaved changes</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'general' && (
                <GeneralTab
                  s={settings.general}
                  update={updater('general')}
                  errors={validationErrors}
                  canEdit={canEdit}
                />
              )}
              {activeTab === 'security' && (
                <SecurityTab
                  s={settings.security}
                  update={updater('security')}
                  errors={validationErrors}
                  canEdit={canEdit}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab
                  s={settings.notifications}
                  update={updater('notifications')}
                  errors={validationErrors}
                  canEdit={canEdit}
                  userEmail={user?.email || ''}
                />
              )}
              {activeTab === 'branding' && (
                <BrandingTab
                  s={settings.branding}
                  update={updater('branding')}
                  canEdit={canEdit}
                />
              )}
              {activeTab === 'system' && (
                <SystemTab
                  s={settings.system}
                  update={updater('system')}
                  canEdit={canEdit}
                  isSuperAdmin={isSuperAdmin}
                  onDangerAction={setDangerAction}
                  updatedAt={settings.updatedAt}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky footer bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] px-8 py-4 flex items-center justify-between gap-4">
        {/* Left status */}
        <div className="flex items-center gap-2 min-w-0">
          {isDirty && !saveSuccess && (
            <span className="flex items-center gap-2 text-sm text-[#D97706] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse shrink-0" />
              You have unsaved changes
            </span>
          )}
          {saveSuccess && (
            <span className="flex items-center gap-2 text-sm text-[#16A34A] font-medium">
              <CheckCircle2 size={16} />
              All changes saved successfully
            </span>
          )}
          {!isDirty && !saveSuccess && (
            <span className="text-sm text-[#64748B]">Settings are up to date</span>
          )}
        </div>

        {/* Center — save error */}
        {saveError && (
          <div className="flex items-center gap-2 text-sm text-[#DC2626]">
            <AlertCircle size={14} className="shrink-0" />
            <span className="truncate max-w-xs">{saveError}</span>
            <button onClick={() => setSaveError('')}><X size={13} /></button>
          </div>
        )}

        {/* Right — actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCancel}
            disabled={!isDirty}
            className="border border-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-lg text-sm hover:bg-[#F8FAFC] transition
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel Changes
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving || !canEdit}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition
              ${isDirty && !saving && canEdit
                ? 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                : 'bg-[#94A3B8] cursor-not-allowed'}
            `}
          >
            {saving
              ? <><RefreshCw size={14} className="animate-spin" /> Saving…</>
              : <><Save size={14} /> Save Configuration</>
            }
          </button>
        </div>
      </div>

      {/* ── Danger Modal ── */}
      {dangerAction && (
        <DangerModal
          action={dangerAction}
          onCancel={() => setDangerAction(null)}
          onConfirm={handleDangerConfirm}
          loading={dangerLoading}
        />
      )}
    </div>
  );
}
