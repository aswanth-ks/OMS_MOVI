import mongoose from 'mongoose';

const { Schema } = mongoose;

const SettingsSchema = new Schema({
  key: { type: String, default: 'global', unique: true },

  general: {
    appName:          { type: String, default: 'Office Workspace Management System' },
    appShortName:     { type: String, default: 'OWMS' },
    appUrl:           { type: String, default: 'https://owms.movicloudlabs.com' },
    orgName:          { type: String, default: 'Movi Cloud Labs' },
    orgDomain:        { type: String, default: 'movicloudlabs.com' },
    timezone:         { type: String, default: '(GMT+05:30) Chennai, Mumbai, New Delhi' },
    dateFormat:       { type: String, default: 'DD/MM/YYYY' },
    timeFormat:       { type: String, default: '24-hour' },
    language:         { type: String, default: 'English (US)' },
    currency:         { type: String, default: 'INR' },
    itemsPerPage:     { type: Number, default: 25 },
    defaultDashboard: { type: String, default: 'Overview' },
    sidebarDefault:   { type: String, default: 'Expanded' },
  },

  security: {
    minPasswordLength:    { type: Number, default: 12 },
    requireUppercase:     { type: Boolean, default: true },
    requireLowercase:     { type: Boolean, default: true },
    requireNumbers:       { type: Boolean, default: true },
    requireSpecial:       { type: Boolean, default: true },
    passwordExpiry:       { type: Boolean, default: false },
    passwordExpiryDays:   { type: Number, default: 90 },
    passwordHistory:      { type: Boolean, default: true },
    passwordHistoryCount: { type: Number, default: 5 },
    sessionTimeout:       { type: String, default: '1 hour' },
    maxConcurrentSessions:{ type: Number, default: 3 },
    rememberMe:           { type: Boolean, default: true },
    rememberMeDays:       { type: Number, default: 30 },
    twoFactorPolicy:      { type: String, default: 'Optional' },
    twoFactorMethods: {
      totp:  { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms:   { type: Boolean, default: false },
    },
    maxFailedLogins:  { type: Number, default: 5 },
    lockoutDuration:  { type: String, default: '15 min' },
    ipAllowlist:      { type: Boolean, default: false },
    ipAllowlistRanges:{ type: String, default: '192.168.1.0/24\n10.0.0.0/8' },
  },

  notifications: {
    smtpHost:              { type: String, default: 'smtp.gmail.com' },
    smtpPort:              { type: Number, default: 587 },
    smtpUser:              { type: String, default: '' },
    smtpPass:              { type: String, default: '' },
    smtpEncryption:        { type: String, default: 'TLS' },
    fromEmail:             { type: String, default: 'noreply@movicloudlabs.com' },
    fromName:              { type: String, default: 'OWMS Notifications' },
    notifyNewUser:         { type: Boolean, default: true },
    notifyDeactivated:     { type: Boolean, default: true },
    notifyFailedLogin:     { type: Boolean, default: true },
    notifyPermissionChange:{ type: Boolean, default: true },
    notifyReportGenerated: { type: Boolean, default: false },
    notifySystemErrors:    { type: Boolean, default: true },
    notifyAuditExport:     { type: Boolean, default: false },
    notifyNewDept:         { type: Boolean, default: false },
    dailyDigest:           { type: Boolean, default: false },
    dailyDigestTime:       { type: String, default: '08:00' },
    weeklySummary:         { type: Boolean, default: false },
    weeklySummaryDay:      { type: String, default: 'Monday' },
  },

  branding: {
    primaryColor:   { type: String, default: '#2563EB' },
    accentColor:    { type: String, default: '#0F172A' },
    loginTitle:     { type: String, default: 'Welcome to OWMS' },
    loginSubtitle:  { type: String, default: 'Office Workspace Management System' },
    showLogoOnLogin:{ type: Boolean, default: true },
    loginBgStyle:   { type: String, default: 'Solid Color' },
  },

  data: {
    activityLogsRetention: { type: String, default: '1 year' },
    auditLogsRetention:    { type: String, default: '2 years' },
    reportFilesRetention:  { type: String, default: '90 days' },
    deletedRecords:        { type: String, default: 'Keep for 30 days' },
    autoBackup:            { type: Boolean, default: false },
    backupFrequency:       { type: String, default: 'Daily' },
    backupTime:            { type: String, default: '02:00' },
    backupRetention:       { type: Number, default: 7 },
  },

  system: {
    maintenanceMode:    { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'System is under maintenance. Please check back later.' },
    apiEnabled:         { type: Boolean, default: true },
    apiRateLimit:       { type: Number, default: 100 },
  },
}, { timestamps: true });

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
