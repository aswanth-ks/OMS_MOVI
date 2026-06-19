import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

/**
 * User Model
 * Central user model for all roles: Super Admin, Admin, HR Manager,
 * PMO Lead, Employee, Intern. Role is a reference to the Role model.
 */
const UserSchema = new Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    // Auto-generated: EMP-YYYY-XXX or INT-YYYY-XXX
  },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Never returned in queries by default
  },
  avatar: { type: String, default: null }, // file path
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    default: 'Full-time',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  manager: { type: Schema.Types.ObjectId, ref: 'User' },
  hrManager: { type: Schema.Types.ObjectId, ref: 'User' },

  // Intern-specific fields
  college: String,
  internshipStart: Date,
  internshipEnd: Date,
  mentor: { type: Schema.Types.ObjectId, ref: 'User' },
  pmoLead: { type: Schema.Types.ObjectId, ref: 'User' },
  performanceRatings: [{
    week: Number,
    rating: Number,
    note: String,
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Employee-specific
  joinDate: Date,
  skills: [String],
  phone: String,
  address: String,
  linkedIn: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  bio: String,

  // HR & PMO Management
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  onboardingComplete: { type: Boolean, default: false },
  onboardingChecklist: {
    welcomeEmail: { type: Boolean, default: false },
    idCardIssued: { type: Boolean, default: false },
    systemAccess: { type: Boolean, default: false },
    deptIntroduction: { type: Boolean, default: false },
    equipmentAssigned: { type: Boolean, default: false },
    hrDocumentation: { type: Boolean, default: false },
    mentorAssigned: { type: Boolean, default: false },
    firstWeekSchedule: { type: Boolean, default: false },
  },
  notes: [{
    text: String,
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],

  // Auth
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  passwordChangedAt: Date,
  refreshToken: { type: String, select: false },

  // Soft delete
  deletedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ status: 1 });

// ─── Virtual: avatar URL ──────────────────────────────────────────────────────
UserSchema.virtual('avatarUrl').get(function () {
  if (this.avatar) {
    return `/uploads/avatars/${this.avatar}`;
  }
  return null;
});

// ─── Pre-save: hash password ──────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  this.passwordChangedAt = new Date();
  next();
});

// ─── Method: compare password ─────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// ─── Method: is account locked ────────────────────────────────────────────────
UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ─── Static: generate employee ID ─────────────────────────────────────────────
UserSchema.statics.generateEmployeeId = async function (type) {
  const prefix = type === 'Intern' ? 'INT' : 'EMP';
  const year = new Date().getFullYear();
  const count = await this.countDocuments({
    employeeId: new RegExp(`^${prefix}-${year}`),
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
};

const User = mongoose.model('User', UserSchema);
export default User;
