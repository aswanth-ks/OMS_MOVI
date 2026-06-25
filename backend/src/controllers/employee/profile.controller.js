import User from '../../models/User.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role', 'name slug permissions')
      .populate('department', 'name code')
      .populate('manager', 'name email avatar')
      .populate('hrManager', 'name email avatar')
      .populate('mentor', 'name email avatar')
      .populate('pmoLead', 'name email avatar')
      .populate('project', 'name status code endDate');

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { skills, avatar, phone, address, linkedIn, emergencyContact, bio } = req.body;
    
    // Only whitelist safe fields
    const updateData = {};
    if (skills) updateData.skills = skills;
    if (avatar) updateData.avatar = avatar;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('role', 'name')
      .populate('department', 'name');

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return sendError(res, 'Incorrect current password', 401);
    }

    user.password = newPassword;
    await user.save(); // pre-save hook handles hashing

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
