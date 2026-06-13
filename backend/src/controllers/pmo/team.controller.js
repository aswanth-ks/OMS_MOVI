import Project from '../../models/Project.js';
import Task from '../../models/Task.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const getTeam = async (req, res, next) => {
  try {
    const projects = await Project.find({ ...req.projectFilter })
      .populate('team.user', 'name designation avatar department employmentType');
    
    const projectIds = projects.map(p => p._id);
    const membersMap = new Map();

    projects.forEach(project => {
      project.team.forEach(member => {
        if (member.user) {
          const userId = member.user._id.toString();
          if (!membersMap.has(userId)) {
            membersMap.set(userId, {
              user: member.user,
              projects: [],
            });
          }
          membersMap.get(userId).projects.push(project.name);
        }
      });
      project.interns.forEach(member => {
        if (member.user && member.user.name) { // populated checks if needed
          const userId = member.user._id.toString();
          if (!membersMap.has(userId)) {
            membersMap.set(userId, {
              user: member.user,
              projects: [],
            });
          }
          membersMap.get(userId).projects.push(project.name);
        }
      });
    });

    const maxWorkload = parseInt(process.env.TASK_WORKLOAD_MAX) || 10;
    const now = new Date();
    
    // Calculate workload for each member
    const teamStats = await Promise.all(
      Array.from(membersMap.values()).map(async (data) => {
        const tasks = await Task.find({
          assignedTo: data.user._id,
          project: { $in: projectIds }
        });

        const activeTasks = tasks.filter(t => t.status !== 'Done').length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const overdueTasksCount = tasks.filter(t => t.status !== 'Done' && t.dueDate < now).length;
        
        const workload = Math.min(Math.round((activeTasks / maxWorkload) * 100), 100);

        return {
          user: data.user,
          projects: data.projects,
          stats: {
            activeTasks,
            completedTasks,
            overdueTasksCount,
            workload,
          }
        };
      })
    );

    sendSuccess(res, teamStats);
  } catch (error) {
    next(error);
  }
};

export const getAvailableMembers = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    const adminRoles = await Role.find({ slug: { $in: ['super-admin', 'admin'] } });
    const adminRoleIds = adminRoles.map(r => r._id);

    const filter = {
      status: 'Active',
      role: { $nin: adminRoleIds },
    };

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        const existingMembers = project.team.map(t => t.user.toString());
        filter._id = { $nin: existingMembers };
      }
    }

    const availableUsers = await User.find(filter)
      .select('name designation department avatar employmentType role')
      .populate('department', 'name code');

    sendSuccess(res, availableUsers);
  } catch (error) {
    next(error);
  }
};
