import Project from '../../models/Project.js';
import Task from '../../models/Task.js';
import LeaveRequest from '../../models/LeaveRequest.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getProjectHealth = async (req, res, next) => {
  try {
    const projects = await Project.find({ ...req.projectFilter, status: { $nin: ['Completed', 'Cancelled'] } });
    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } });
    const now = new Date();

    const healthReport = projects.map(project => {
      const pTasks = tasks.filter(t => t.project.toString() === project._id.toString());
      const overdue = pTasks.filter(t => t.dueDate < now && t.status !== 'Done').length;
      const blocked = pTasks.filter(t => t.status === 'Blocked').length;
      const done = pTasks.filter(t => t.status === 'Done').length;
      const completionPercent = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
      
      let health = 'On Track';
      if (overdue > 3 || blocked > 2) health = 'Delayed';
      else if (overdue > 0 || blocked > 0) health = 'At Risk';

      return {
        _id: project._id,
        name: project.name,
        health,
        metrics: {
          totalTasks: pTasks.length,
          overdueTasks: overdue,
          blockedTasks: blocked,
          completionPercent,
        }
      };
    });

    sendSuccess(res, healthReport);
  } catch (error) {
    next(error);
  }
};

export const getResourceWarnings = async (req, res, next) => {
  try {
    const projects = await Project.find({ ...req.projectFilter }).select('team interns');
    
    const memberIds = new Set();
    projects.forEach(p => {
      p.team.forEach(t => memberIds.add(t.user.toString()));
      p.interns.forEach(i => memberIds.add(i.user.toString()));
    });
    
    const membersArray = Array.from(memberIds);

    // Get leaves that are approved and happening in the next 14 days
    const now = new Date();
    const next14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const upcomingLeaves = await LeaveRequest.find({
      user: { $in: membersArray },
      status: 'Approved',
      fromDate: { $lte: next14Days },
      toDate: { $gte: now },
    }).populate('user', 'name');

    // Get members with high workload (> 8 active tasks)
    const activeTasks = await Task.find({
      assignedTo: { $in: membersArray },
      status: { $nin: ['Done', 'Cancelled'] },
    }).populate('assignedTo', 'name');

    const workloadMap = new Map();
    activeTasks.forEach(t => {
      const uid = t.assignedTo._id.toString();
      if (!workloadMap.has(uid)) {
        workloadMap.set(uid, { user: t.assignedTo, count: 0 });
      }
      workloadMap.get(uid).count++;
    });

    const maxWorkload = parseInt(process.env.TASK_WORKLOAD_MAX) || 10;
    const overloadedMembers = Array.from(workloadMap.values())
      .filter(w => w.count > (maxWorkload * 0.8))
      .map(w => ({
        user: w.user.name,
        activeTasks: w.count,
        warning: `High workload (${w.count} active tasks)`
      }));

    const leaveWarnings = upcomingLeaves.map(l => ({
      user: l.user.name,
      leaveType: l.type,
      dates: `${new Date(l.fromDate).toLocaleDateString()} to ${new Date(l.toDate).toLocaleDateString()}`,
      warning: 'Upcoming leave'
    }));

    sendSuccess(res, {
      overloadedMembers,
      leaveWarnings,
    });
  } catch (error) {
    next(error);
  }
};
