import Project from '../../models/Project.js';
import Task from '../../models/Task.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse.js';
import { getPagination } from '../../utils/paginate.js';

export const getMyProjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = {
      $or: [
        { 'team.user': req.user._id },
        { 'interns.user': req.user._id }
      ]
    };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('manager', 'name avatar email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id, assignedTo: req.user._id });
        const done = tasks.filter(t => t.status === 'Done').length;
        const totalTasks = tasks.length;
        
        const projObj = project.toJSON();
        projObj.myTasksCount = totalTasks;
        projObj.myTasksCompleted = done;
        return projObj;
      })
    );

    sendPaginated(res, projectsWithStats, {
      total, page, limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { 'team.user': req.user._id },
        { 'interns.user': req.user._id }
      ]
    })
      .populate('manager', 'name avatar email')
      .populate('team.user', 'name avatar designation department employmentType email')
      .populate('interns.user', 'name avatar college email');

    if (!project) return sendError(res, 'Project not found or you are not a member', 404);

    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

export const getMyTeam = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { 'team.user': req.user._id },
        { 'interns.user': req.user._id }
      ]
    })
      .populate('manager', 'name avatar designation email')
      .populate('team.user', 'name avatar designation department employmentType email')
      .populate('interns.user', 'name avatar college department employmentType email');

    const teamSet = new Map();

    projects.forEach(project => {
      // Add manager
      if (project.manager) {
        teamSet.set(project.manager._id.toString(), {
          user: project.manager,
          roleInProject: 'PMO Lead',
          projectName: project.name,
        });
      }

      // Add team members
      project.team.forEach(member => {
        if (member.user && member.user._id.toString() !== req.user._id.toString()) {
          teamSet.set(member.user._id.toString(), {
            user: member.user,
            roleInProject: member.role,
            projectName: project.name,
          });
        }
      });

      // Add interns
      project.interns.forEach(intern => {
        if (intern.user && intern.user._id.toString() !== req.user._id.toString()) {
          teamSet.set(intern.user._id.toString(), {
            user: intern.user,
            roleInProject: 'Intern',
            projectName: project.name,
          });
        }
      });
    });

    sendSuccess(res, Array.from(teamSet.values()));
  } catch (error) {
    next(error);
  }
};
