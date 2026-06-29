import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { generateTokenPair } from '../utils/generateToken.js';
import Settings from '../models/Settings.js';

const router = Router();
router.use(protect);

// GET /api/me/profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'role', populate: { path: 'permissions', select: 'name resource action status' } })
      .populate('department', 'name code')
      .populate('manager', 'name designation employeeId')
      .populate('hrManager', 'name employeeId')
      .select('-password -refreshToken');
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

// PATCH /api/me/profile
router.patch('/profile', async (req, res, next) => {
  try {
    const { phone, address, bio, linkedIn, linkedin, emergencyContact, skills } = req.body;
    const set = {};
    if (phone       !== undefined) set.phone   = phone;
    if (address     !== undefined) set.address = address;
    if (bio         !== undefined) set.bio     = bio;
    if (skills      !== undefined) set.skills  = skills;
    // accept both spellings
    const li = linkedIn ?? linkedin;
    if (li !== undefined) set.linkedIn = li;
    // accept nested emergencyContact object
    if (emergencyContact) {
      if (emergencyContact.name     !== undefined) set['emergencyContact.name']     = emergencyContact.name;
      if (emergencyContact.phone    !== undefined) set['emergencyContact.phone']    = emergencyContact.phone;
      if (emergencyContact.relation !== undefined) set['emergencyContact.relation'] = emergencyContact.relation;
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id, { $set: set }, { new: true, runValidators: false }
    ).populate('department', 'name code').populate('role', 'name slug').select('-password -refreshToken');
    sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) { next(err); }
});

// POST /api/me/change-password
router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) return sendError(res, 'currentPassword and newPassword are required', 400);
    if (confirmPassword && newPassword !== confirmPassword) return sendError(res, 'Passwords do not match', 400);

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 400);
    if (newPassword === currentPassword) return sendError(res, 'New password must differ from current', 400);

    const settings = await Settings.findOne({ key: 'global' });
    const sec = settings?.security || {};
    if (newPassword.length < (sec.minPasswordLength || 8)) {
      return sendError(res, `Password must be at least ${sec.minPasswordLength || 8} characters`, 400);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.mustChangePassword = false;
    await user.save();
    const { token, refreshToken } = generateTokenPair(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    sendSuccess(res, { token, refreshToken }, 'Password changed successfully');
  } catch (err) { next(err); }
});

export default router;
