import LeaveRequest from '../../models/LeaveRequest.js';
import LeaveBalance from '../../models/LeaveBalance.js';
import User from '../../models/User.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { sendNotification } from '../../utils/sendNotification.js';

export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ user: req.user._id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
      
    sendSuccess(res, leaves);
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveBalance = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({ user: req.user._id, year: currentYear });
    
    if (!balance) {
      // Return default empty structure if none allocated yet
      return sendSuccess(res, {
        casual: { total: 0, used: 0 },
        sick: { total: 0, used: 0 },
        annual: { total: 0, used: 0 },
        emergency: { total: 0, used: 0 },
        compensatory: { total: 0, used: 0 },
        year: currentYear
      });
    }

    sendSuccess(res, balance);
  } catch (error) {
    next(error);
  }
};

export const applyForLeave = async (req, res, next) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;

    if (!type || !fromDate || !toDate || !reason) {
      return sendError(res, 'All fields are required (type, fromDate, toDate, reason)', 400);
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return sendError(res, 'From Date cannot be later than To Date', 400);
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of both days

    const leave = await LeaveRequest.create({
      user: req.user._id,
      type,
      fromDate,
      toDate,
      days,
      reason,
      status: 'Pending',
    });

    const user = await User.findById(req.user._id).populate('hrManager', 'name');

    // Notify HR
    if (user.hrManager) {
      await sendNotification({
        recipient: user.hrManager._id,
        type: 'system_alert',
        title: 'New Leave Request',
        message: `${user.name} has requested ${type} leave from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}.`,
        link: '/hr/leaves',
        sender: req.user._id,
      });
    }

    // Notify PMO if employee has one
    if (user.pmoLead) {
      await sendNotification({
        recipient: user.pmoLead,
        type: 'system_alert',
        title: 'Team Member Leave Application',
        message: `${user.name} applied for leave. It is pending HR approval.`,
        link: '/pmo/approvals/leaves',
        sender: req.user._id,
      });
    }

    sendSuccess(res, leave, 'Leave application submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};
