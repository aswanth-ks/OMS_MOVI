import User from '../../models/User.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { sendNotification } from '../../utils/sendNotification.js';

export const getPendingOnboarding = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const filter = {
      ...req.scopeFilter,
      status: 'Active',
      onboardingComplete: false,
      createdAt: { $gte: thirtyDaysAgo }
    };

    const pendingUsers = await User.find(filter)
      .populate('department', 'name')
      .populate('role', 'name color')
      .select('name employeeId avatar department role onboardingChecklist createdAt');

    // Calculate completion percentage
    const usersWithProgress = pendingUsers.map(u => {
      const user = u.toJSON();
      const checklist = user.onboardingChecklist || {};
      const items = Object.values(checklist);
      const completed = items.filter(Boolean).length;
      user.onboardingProgress = Math.round((completed / 8) * 100) || 0;
      return user;
    });

    sendSuccess(res, usersWithProgress);
  } catch (error) {
    next(error);
  }
};

export const getCompletedOnboarding = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const filter = {
      ...req.scopeFilter,
      status: 'Active',
      onboardingComplete: true,
      updatedAt: { $gte: thirtyDaysAgo }
    };

    const completedUsers = await User.find(filter)
      .populate('department', 'name')
      .populate('role', 'name color')
      .select('name employeeId avatar department role updatedAt')
      .sort({ updatedAt: -1 });

    sendSuccess(res, completedUsers);
  } catch (error) {
    next(error);
  }
};

export const updateChecklist = async (req, res, next) => {
  try {
    const { item, completed } = req.body;
    
    const validItems = [
      'welcomeEmail', 'idCardIssued', 'systemAccess', 'deptIntroduction',
      'equipmentAssigned', 'hrDocumentation', 'mentorAssigned', 'firstWeekSchedule'
    ];

    if (!validItems.includes(item)) {
      return sendError(res, 'Invalid checklist item', 400);
    }

    const user = await User.findOne({ _id: req.params.id, ...req.scopeFilter })
      .populate('pmoLead', 'name');

    if (!user) return sendError(res, 'User not found or not in scope', 404);

    // Initialize if undefined
    if (!user.onboardingChecklist) user.onboardingChecklist = {};
    
    user.onboardingChecklist[item] = !!completed;

    // Check if all complete
    const items = Object.values(user.onboardingChecklist);
    const numCompleted = items.filter(Boolean).length;
    
    if (numCompleted === 8 && !user.onboardingComplete) {
      user.onboardingComplete = true;
      
      // Notify user
      await sendNotification({
        recipient: user._id,
        type: 'system_alert',
        title: 'Onboarding Complete',
        message: 'Your onboarding is complete! Welcome to Movi Cloud Labs.',
        link: '/profile',
        sender: req.user._id,
      });

      // Notify PMO Lead if they have one
      if (user.pmoLead) {
        await sendNotification({
          recipient: user.pmoLead._id,
          type: 'system_alert',
          title: 'Team Member Ready',
          message: `${user.name} has completed onboarding and is ready for tasks.`,
          link: `/pmo/team`,
          sender: req.user._id,
        });
      }
    } else if (numCompleted < 8 && user.onboardingComplete) {
      user.onboardingComplete = false;
    }

    await user.save({ validateBeforeSave: false });

    sendSuccess(res, user.onboardingChecklist, 'Checklist updated');
  } catch (error) {
    next(error);
  }
};
