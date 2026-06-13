import Task from '../../models/Task.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse.js';
import { getPagination } from '../../utils/paginate.js';
import { sendNotification } from '../../utils/sendNotification.js';

export const getMyTasks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, priority, projectId } = req.query;

    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectId) filter.project = projectId;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name projectCode manager')
        .populate('assignedBy', 'name avatar')
        .populate('comments.author', 'name avatar')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    sendPaginated(res, tasks, {
      total, page, limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id })
      .populate('project');
      
    if (!task) return sendError(res, 'Task not found or not assigned to you', 404);

    const validStatuses = ['Todo', 'In Progress', 'In Review', 'Blocked'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}. Only PMO Lead can mark as Done.`, 400);
    }

    const oldStatus = task.status;
    task.status = status;
    if (note && status === 'Blocked') {
      task.blockedReason = note;
    }

    task.statusHistory.push({ status, changedBy: req.user._id, changedAt: new Date() });
    await task.save();

    // Notify PMO Lead if In Review or Blocked
    if (status === 'In Review' || status === 'Blocked') {
      await sendNotification({
        recipient: task.project.manager,
        type: 'system_alert',
        title: `Task ${status}`,
        message: `${req.user.name} moved task '${task.title}' to ${status}.`,
        link: `/pmo/tasks/${task._id}`,
        sender: req.user._id,
      });
    }

    sendSuccess(res, task, `Task moved to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return sendError(res, 'Comment text is required', 400);

    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id })
      .populate('project');
      
    if (!task) return sendError(res, 'Task not found', 404);

    task.comments.push({ text, author: req.user._id, createdAt: new Date() });
    await task.save();

    // Notify assignedBy or PMO Lead
    await sendNotification({
      recipient: task.assignedBy, // Could also notify PMO Lead
      type: 'system_alert',
      title: 'New Comment on Task',
      message: `${req.user.name} commented on task '${task.title}'.`,
      link: `/pmo/tasks/${task._id}`,
      sender: req.user._id,
    });

    await task.populate('comments.author', 'name avatar role');
    sendSuccess(res, task.comments, 'Comment added');
  } catch (error) {
    next(error);
  }
};
