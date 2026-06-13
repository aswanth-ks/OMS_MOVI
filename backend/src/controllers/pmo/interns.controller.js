import Project from '../../models/Project.js';
import User from '../../models/User.js';
import InternRequest from '../../models/InternRequest.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { sendNotification } from '../../utils/sendNotification.js';

export const getInterns = async (req, res, next) => {
  try {
    const projects = await Project.find({ ...req.projectFilter })
      .populate('interns.user', 'name college avatar department email');
      
    const internsSet = new Map();
    
    projects.forEach(project => {
      project.interns.forEach(intern => {
        if (intern.user && intern.user.name) {
          const userId = intern.user._id.toString();
          if (!internsSet.has(userId)) {
            internsSet.set(userId, {
              user: intern.user,
              project: { _id: project._id, name: project.name },
              joinedAt: intern.joinedAt,
            });
          }
        }
      });
    });

    sendSuccess(res, Array.from(internsSet.values()));
  } catch (error) {
    next(error);
  }
};

export const requestInterns = async (req, res, next) => {
  try {
    const { projectId, department, duration, skills, note } = req.body;

    if (!projectId || !department || !duration) {
      return sendError(res, 'Project ID, department, and duration are required', 400);
    }

    const project = await Project.findOne({ _id: projectId, ...req.projectFilter });
    if (!project) return sendError(res, 'Project not found', 404);

    const request = await InternRequest.create({
      requestedBy: req.user._id,
      project: projectId,
      department,
      duration,
      skills,
      note,
    });

    // Notify HR
    // Ideally find all HR Managers, here we send a general notification to an HR user if possible, 
    // or just the system.
    const hrUsers = await User.find({ status: 'Active' })
      .populate({ path: 'role', match: { slug: 'hr-manager' } });
      
    const activeHrUsers = hrUsers.filter(u => u.role);
    
    for (const hr of activeHrUsers) {
      await sendNotification({
        recipient: hr._id,
        type: 'system_alert',
        title: 'New Intern Request',
        message: `${req.user.name} (PMO Lead) has requested interns for project ${project.name}.`,
        link: `/hr/interns`,
        sender: req.user._id,
      });
    }

    sendSuccess(res, request, 'Intern request sent to HR successfully', 201);
  } catch (error) {
    next(error);
  }
};
