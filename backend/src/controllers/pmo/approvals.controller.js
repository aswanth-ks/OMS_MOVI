import LeaveRequest from '../../models/LeaveRequest.js';
import Task from '../../models/Task.js';
import Project from '../../models/Project.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getPendingLeaves = async (req, res, next) => {
  try {
    // PMO Leads don't officially approve leaves (HR does), but they can view pending leaves 
    // for their team members to assess project impact.
    const projects = await Project.find({ ...req.projectFilter })
      .select('team interns');

    const memberIds = new Set();
    projects.forEach(p => {
      p.team.forEach(t => memberIds.add(t.user.toString()));
      p.interns.forEach(i => memberIds.add(i.user.toString()));
    });

    const pendingLeaves = await LeaveRequest.find({
      user: { $in: Array.from(memberIds) },
      status: 'Pending',
    }).populate('user', 'name employeeId avatar department role');

    sendSuccess(res, pendingLeaves);
  } catch (error) {
    next(error);
  }
};

export const getTasksInReview = async (req, res, next) => {
  try {
    const projects = await Project.find({ ...req.projectFilter }).select('_id name');
    const projectIds = projects.map(p => p._id);

    const tasksInReview = await Task.find({
      project: { $in: projectIds },
      status: 'In Review',
    })
      .populate('assignedTo', 'name avatar')
      .populate('project', 'name');

    sendSuccess(res, tasksInReview);
  } catch (error) {
    next(error);
  }
};
