import Project from '../../models/Project.js';
import Task from '../../models/Task.js';
import User from '../../models/User.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse.js';
import { getPagination } from '../../utils/paginate.js';
import { sendNotification } from '../../utils/sendNotification.js';

export const getProjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, priority, search } = req.query;

    const filter = { ...req.projectFilter };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('manager', 'name avatar')
        .populate('department', 'name')
        .populate('team.user', 'name designation avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    // Add completion percent
    const projectsWithPercent = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'Done').length;
        
        const projObj = project.toJSON();
        projObj.completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return projObj;
      })
    );

    sendPaginated(res, projectsWithPercent, {
      total, page, limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, department, priority, startDate, endDate, budget, tags, milestones } = req.body;

    if (!name || !department) return sendError(res, 'Name and department are required', 400);

    const year = new Date().getFullYear();
    const count = await Project.countDocuments({
      code: new RegExp(`^PRJ-${year}`),
    });
    const code = `PRJ-${year}-${String(count + 1).padStart(3, '0')}`;

    const project = await Project.create({
      code,
      name,
      description,
      department,
      priority,
      startDate,
      endDate,
      budget,
      tags,
      milestones,
      manager: req.user._id, // PMO Lead creating it
    });

    // Notify Department Head
    const deptHead = await User.findOne({ department, role: { $exists: true } }) // simplified logic, typically would find role=dept-head
      .populate('role');
    
    if (deptHead) {
      await sendNotification({
        recipient: deptHead._id,
        type: 'system_alert',
        title: 'New Project Created',
        message: `New project ${name} created in your department by ${req.user.name}.`,
        link: `/projects/${project._id}`,
        sender: req.user._id,
      });
    }

    sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter })
      .populate('manager', 'name avatar designation')
      .populate('department', 'name code')
      .populate('team.user', 'name designation department avatar')
      .populate('interns.user', 'name college avatar');

    if (!project) return sendError(res, 'Project not found', 404);

    const tasks = await Task.find({ project: project._id });
    const now = new Date();

    const taskStats = tasks.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'Todo') acc.todo++;
      else if (curr.status === 'In Progress') acc.inProgress++;
      else if (curr.status === 'In Review') acc.inReview++;
      else if (curr.status === 'Done') acc.done++;
      else if (curr.status === 'Blocked') acc.blocked++;

      if (curr.dueDate < now && curr.status !== 'Done') acc.overdue++;
      return acc;
    }, { total: 0, todo: 0, inProgress: 0, inReview: 0, done: 0, blocked: 0, overdue: 0 });

    const timeline = {
      totalDays: project.endDate && project.startDate ? Math.ceil((project.endDate - project.startDate) / (1000 * 60 * 60 * 24)) : 0,
      elapsed: project.startDate ? Math.ceil((now - project.startDate) / (1000 * 60 * 60 * 24)) : 0,
      remaining: project.endDate ? Math.ceil((project.endDate - now) / (1000 * 60 * 60 * 24)) : 0,
    };

    let health = 'On Track';
    const utilization = project.budget ? (project.budgetSpent / project.budget) * 100 : 0;
    if (taskStats.overdue > 3 || utilization > 90) health = 'Delayed';
    else if (taskStats.overdue > 1 || utilization > 70) health = 'At Risk';

    const projObj = project.toJSON();
    projObj.tasks = taskStats;
    projObj.budget = { allocated: project.budget, spent: project.budgetSpent };
    projObj.timeline = timeline;
    projObj.healthStatus = health;
    projObj.completionPercent = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

    sendSuccess(res, projObj);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, endDate, budget, tags, healthStatus, milestones } = req.body;
    
    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    const oldStatus = project.status;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (endDate) project.endDate = endDate;
    if (budget) project.budget = budget;
    if (tags) project.tags = tags;
    if (healthStatus) project.healthStatus = healthStatus;
    if (milestones) project.milestones = milestones;

    await project.save();

    if (status !== oldStatus && (status === 'Completed' || status === 'Cancelled')) {
      const allMembers = [...project.team.map(t => t.user), ...project.interns.map(i => i.user)];
      for (const userId of allMembers) {
        await sendNotification({
          recipient: userId,
          type: 'system_alert',
          title: `Project ${status}`,
          message: `Project ${project.name} has been marked as ${status.toLowerCase()}.`,
          link: `/employee/projects/${project._id}`,
          sender: req.user._id,
        });
      }
    }

    sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const addTeamMembers = async (req, res, next) => {
  try {
    const { members } = req.body; // [{ userId, role }]

    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    for (const member of members) {
      const user = await User.findById(member.userId);
      if (!user || user.status !== 'Active') continue;

      const exists = project.team.find(t => t.user.toString() === member.userId);
      if (!exists) {
        project.team.push({ user: member.userId, role: member.role, joinedAt: new Date() });

        await sendNotification({
          recipient: member.userId,
          type: 'project_assigned',
          title: 'New Project Assignment',
          message: `You've been added to ${project.name} as ${member.role} by ${req.user.name}.`,
          link: `/employee/projects/${project._id}`,
          sender: req.user._id,
        });
      }
    }

    await project.save();
    
    // Repopulate team
    await project.populate('team.user', 'name designation avatar department');
    
    sendSuccess(res, project.team, 'Team updated successfully');
  } catch (error) {
    next(error);
  }
};

export const removeTeamMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    project.team = project.team.filter(t => t.user.toString() !== userId);
    await project.save();

    await sendNotification({
      recipient: userId,
      type: 'system_alert',
      title: 'Removed from Project',
      message: `You have been removed from project ${project.name}.`,
      sender: req.user._id,
    });

    sendSuccess(res, null, 'User removed from project team');
  } catch (error) {
    next(error);
  }
};

export const assignInterns = async (req, res, next) => {
  try {
    const { internIds } = req.body; // [userId]

    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    for (const internId of internIds) {
      const intern = await User.findOne({ _id: internId, employmentType: 'Intern' });
      if (!intern) continue;

      const exists = project.interns.find(i => i.user.toString() === internId);
      if (!exists) {
        project.interns.push({ user: internId, joinedAt: new Date() });
        intern.project = project._id;
        await intern.save({ validateBeforeSave: false });

        await sendNotification({
          recipient: internId,
          type: 'project_assigned',
          title: 'Project Assigned',
          message: `You have been assigned to project ${project.name} by PMO Lead ${req.user.name}.`,
          link: `/intern/profile`,
          sender: req.user._id,
        });

        if (intern.hrManager) {
          await sendNotification({
            recipient: intern.hrManager,
            type: 'system_alert',
            title: 'Intern Project Assigned',
            message: `Your intern ${intern.name} has been assigned to project ${project.name}.`,
            sender: req.user._id,
          });
        }
      }
    }

    await project.save();
    await project.populate('interns.user', 'name college avatar');

    sendSuccess(res, project.interns, 'Interns assigned successfully');
  } catch (error) {
    next(error);
  }
};

export const addMilestone = async (req, res, next) => {
  try {
    const { name, date } = req.body;
    
    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    project.milestones.push({ name, date, status: 'pending' });
    await project.save();

    const allMembers = [...project.team.map(t => t.user), ...project.interns.map(i => i.user)];
    for (const userId of allMembers) {
      await sendNotification({
        recipient: userId,
        type: 'system_alert',
        title: 'New Milestone Added',
        message: `New milestone added to ${project.name}: ${name}`,
        sender: req.user._id,
      });
    }

    sendSuccess(res, project.milestones, 'Milestone added');
  } catch (error) {
    next(error);
  }
};

export const updateMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const { status, name, date } = req.body;

    const project = await Project.findOne({ _id: req.params.id, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return sendError(res, 'Milestone not found', 404);

    if (name) milestone.name = name;
    if (date) milestone.date = date;
    
    if (status && status !== milestone.status) {
      milestone.status = status;
      if (status === 'completed') {
        const allMembers = [...project.team.map(t => t.user), ...project.interns.map(i => i.user)];
        for (const userId of allMembers) {
          await sendNotification({
            recipient: userId,
            type: 'system_alert',
            title: 'Milestone Reached!',
            message: `Milestone reached in ${project.name}: ${milestone.name} 🎉`,
            sender: req.user._id,
          });
        }
      }
    }

    await project.save();
    sendSuccess(res, project.milestones, 'Milestone updated');
  } catch (error) {
    next(error);
  }
};
