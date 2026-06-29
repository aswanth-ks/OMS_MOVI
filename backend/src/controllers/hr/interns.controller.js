import User from '../../models/User.js';
import Task from '../../models/Task.js';
import Attendance from '../../models/Attendance.js';
import LeaveBalance from '../../models/LeaveBalance.js';
import LearningResource from '../../models/LearningResource.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse.js';
import { getPagination } from '../../utils/paginate.js';
import { sendNotification } from '../../utils/sendNotification.js';

export const getInterns = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, department, status, projectId, college } = req.query;

    const filter = {
      ...req.scopeFilter,
      employmentType: 'Intern',
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (projectId) filter.project = projectId;
    if (college) filter.college = { $regex: college, $options: 'i' };

    const [interns, total] = await Promise.all([
      User.find(filter)
        .populate('department', 'name code')
        .populate('project', 'name status')
        .populate('mentor', 'name')
        .populate('pmoLead', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, interns, {
      total, page, limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getInternById = async (req, res, next) => {
  try {
    const intern = await User.findOne({
      _id: req.params.id,
      employmentType: 'Intern',
      ...req.scopeFilter,
    })
      .populate('department', 'name code')
      .populate('project', 'name status')
      .populate('mentor', 'name employeeId')
      .populate('pmoLead', 'name employeeId')
      .populate('hrManager', 'name');

    if (!intern) return sendError(res, 'Intern not found', 404);

    const now = new Date();
    
    // Task Stats
    const tasks = await Task.find({ assignedTo: intern._id });
    const taskStats = tasks.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'Done') acc.done++;
      if (curr.dueDate < now && curr.status !== 'Done') acc.overdue++;
      return acc;
    }, { total: 0, done: 0, overdue: 0 });

    // Attendance Stats this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const attendance = await Attendance.find({ user: intern._id, date: { $gte: startOfMonth } });
    const attendanceStats = attendance.reduce((acc, curr) => {
      if (curr.status === 'Present') acc.present++;
      else if (curr.status === 'Absent') acc.absent++;
      else if (curr.status === 'Leave') acc.leave++;
      return acc;
    }, { present: 0, absent: 0, leave: 0, total: attendance.length });

    // Leave Balance
    const leaveBalance = await LeaveBalance.findOne({ user: intern._id, year: now.getFullYear() });

    // Learning Resources
    const learningResources = await LearningResource.find({ assignedTo: intern._id, status: { $ne: 'Completed' } });

    const obj = intern.toJSON();
    obj.taskStats = taskStats;
    obj.attendanceStats = attendanceStats;
    obj.leaveBalance = leaveBalance;
    obj.activeLearningResources = learningResources;

    sendSuccess(res, obj);
  } catch (error) {
    next(error);
  }
};

export const addPerformanceRating = async (req, res, next) => {
  try {
    const { week, rating, note } = req.body;

    if (!week || !rating) return sendError(res, 'Week and rating are required', 400);

    const intern = await User.findOne({
      _id: req.params.id,
      employmentType: 'Intern',
      ...req.scopeFilter,
    });

    if (!intern) return sendError(res, 'Intern not found', 404);

    const existingIndex = intern.performanceRatings.findIndex(
      r => r.week === week && r.addedBy?.toString() === req.user._id.toString()
    );
    if (existingIndex !== -1) {
      intern.performanceRatings[existingIndex].rating = rating;
      intern.performanceRatings[existingIndex].note = note;
      intern.performanceRatings[existingIndex].source = 'hr';
    } else {
      intern.performanceRatings.push({ week, rating, note, source: 'hr', addedBy: req.user._id });
    }

    await intern.save({ validateBeforeSave: false });

    await sendNotification({
      recipient: intern._id,
      type: 'system_alert',
      title: 'Performance Rating Added',
      message: `Week ${week} performance rating submitted by HR.`,
      link: '/intern/profile',
      sender: req.user._id,
    });

    sendSuccess(res, intern.performanceRatings, 'Performance rating saved');
  } catch (error) {
    next(error);
  }
};

export const assignMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.body;

    const intern = await User.findOne({
      _id: req.params.id,
      employmentType: 'Intern',
      ...req.scopeFilter,
    });

    if (!intern) return sendError(res, 'Intern not found', 404);

    const mentor = await User.findById(mentorId);
    if (!mentor) return sendError(res, 'Mentor not found', 404);

    intern.mentor = mentorId;
    await intern.save({ validateBeforeSave: false });

    await sendNotification({
      recipient: mentor._id,
      type: 'system_alert',
      title: 'New Mentee Assigned',
      message: `${intern.name} has been assigned to you as a mentee.`,
      link: `/employee/team`,
      sender: req.user._id,
    });

    await sendNotification({
      recipient: intern._id,
      type: 'system_alert',
      title: 'Mentor Assigned',
      message: `Your mentor has been updated to ${mentor.name}.`,
      link: '/intern/profile',
      sender: req.user._id,
    });

    sendSuccess(res, { mentor: { _id: mentor._id, name: mentor.name } }, 'Mentor assigned successfully');
  } catch (error) {
    next(error);
  }
};
