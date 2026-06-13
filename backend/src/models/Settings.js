import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Settings Model
 * Singleton pattern — only ONE document ever exists (key: 'global').
 * Controls app-wide configuration: security policies, notification prefs, system flags.
 */
const SettingsSchema = new Schema({
  key: { type: String, default: 'global', unique: true },

  general: {
    appName: { type: String, default: 'Office Workspace Management System' },
    appShortName: { type: String, default: 'OWMS' },
    orgName: { type: String, default: 'Movi Cloud Labs' },
    orgDomain: { type: String, default: 'movicloudlabs.com' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '24' },
    language: { type: String, default: 'en-US' },
    itemsPerPage: { type: Number, default: 25 },
  },

  security: {
    minPasswordLength: { type: Number, default: 8 },
    requireUppercase: { type: Boolean, default: true },
    requireNumbers: { type: Boolean, default: true },
    requireSpecial: { type: Boolean, default: false },
    sessionTimeout: { type: String, default: '1hour' },
    maxFailedLogins: { type: Number, default: 5 },
    lockoutDuration: { type: String, default: '15min' },
    twoFactorPolicy: { type: String, default: 'optional' },
    passwordExpiryDays: { type: Number, default: 90 },
  },

  notifications: {
    notifyNewUser: { type: Boolean, default: true },
    notifyFailedLogin: { type: Boolean, default: true },
    notifyPermissionChange: { type: Boolean, default: true },
    notifySystemErrors: { type: Boolean, default: true },
  },

  system: {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'System under maintenance.' },
    apiEnabled: { type: Boolean, default: true },
    apiRateLimit: { type: Number, default: 100 },
    auditLogsRetention: { type: Number, default: 730 }, // days — 730 = 2 years
  },
}, { timestamps: true });

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
