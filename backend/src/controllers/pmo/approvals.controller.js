import LeaveRequest from '../../models/LeaveRequest.js';
import Task from '../../models/Task.js';
import Project from '../../models/Project.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { sendNotification } from '../../utils/sendNotification.js';

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

export const updateApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, note, projectImpact } = req.body; // action: 'approve' | 'reject'

    // 1. Try to find if it is a Task first
    let task = await Task.findById(id).populate('project');
    if (task) {
      if (req.user.role.slug !== 'super-admin' && task.project.manager?.toString() !== req.user._id.toString()) {
        return sendError(res, 'Not authorized to approve/reject tasks for this project', 403);
      }
      
      const newStatus = action === 'approve' ? 'Done' : 'Todo';
      task.status = newStatus;
      
      if (action === 'approve') {
        task.approvedAt = new Date();
        task.approvedBy = req.user._id;
        
        await sendNotification({
          recipient: task.assignedTo,
          type: 'system_alert',
          title: 'Task Approved',
          message: `Task '${task.title}' approved and marked complete by PMO Lead ${req.user.name} ✓`,
          sender: req.user._id,
        });
      } else {
        task.blockedReason = note || 'Changes requested by PMO';
        await sendNotification({
          recipient: task.assignedTo,
          type: 'system_alert',
          title: 'Task Changes Requested',
          message: `PMO Lead ${req.user.name} requested changes for task '${task.title}'. Notes: ${note || 'None'}`,
          sender: req.user._id,
        });
      }
      
      task.statusHistory.push({ status: newStatus, changedBy: req.user._id, changedAt: new Date() });
      await task.save();
      
      return sendSuccess(res, task, `Task successfully ${action}d`);
    }

    // 2. Check if it is a LeaveRequest
    let leave = await LeaveRequest.findById(id).populate('user');
    if (leave) {
      if (projectImpact) {
        leave.projectImpact = projectImpact;
      }
      
      if (action) {
        const status = action === 'approve' ? 'Approved' : 'Rejected';
        leave.status = status;
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        if (note) leave.reviewNote = note;
        
        await sendNotification({
          recipient: leave.user._id,
          type: action === 'approve' ? 'leave_approved' : 'leave_rejected',
          title: action === 'approve' ? 'Leave Approved' : 'Leave Rejected',
          message: action === 'approve' 
            ? `Your leave request has been approved by PMO Lead ${req.user.name}.`
            : `Your leave request was rejected by PMO Lead ${req.user.name}. Reason: ${note || 'No reason provided'}`,
          sender: req.user._id,
        });
      }
      
      await leave.save();
      return sendSuccess(res, leave, `Leave request successfully updated`);
    }

    return sendError(res, 'Task or Leave Request not found with the provided ID', 404);
  } catch (error) {
    next(error);
  }
};
