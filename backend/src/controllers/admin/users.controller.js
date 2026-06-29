import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Project from '../../models/Project.js';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse.js';
import { getPagination } from '../../utils/paginate.js';
import { sendNotification } from '../../utils/sendNotification.js';
import { sendWelcomeEmail } from '../../utils/sendEmail.js';
import { syncEmployeeLeaveBalance } from '../../utils/syncLeaveBalance.js';
import { autoAssignHR } from '../../utils/autoAssignHR.js';

/**
 * GET /api/admin/users
 * List all users with search, filters, sorting, and pagination.
 * Response shape matches frontend Users.jsx mock data exactly.
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, department, role, status, employmentType, sortBy, sortOrder } = req.query;

    // Build filter — always exclude soft-deleted users
    const filter = { deletedAt: { $exists: false } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // newest first
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('role', 'name slug color')
        .populate('department', 'name code')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, users, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/users
 * Create a new user. Auto-generates employeeId.
 * If no password provided, generates a temp password.
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, department, designation, employmentType, password, skills, hrManager: hrManagerInput } = req.body;

    let roleId = role;
    if (!roleId) {
      const defaultRole = await Role.findOne({ slug: 'employee' });
      if (defaultRole) roleId = defaultRole._id;
    }

    // Validate required fields
    if (!name || !email || !roleId) {
      return sendError(res, 'Name, email, and role are required', 400);
    }

    // Check email uniqueness — ignore soft-deleted users
    const existing = await User.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } });
    if (existing) {
      return sendError(res, 'Email already registered', 400);
    }

    // Check role exists
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) {
      return sendError(res, 'Invalid role ID', 400);
    }

    // Determine employment type from role
    const empType = employmentType || (roleDoc.slug === 'intern' ? 'Intern' : 'Full-time');

    // Auto-generate employeeId
    const employeeId = await User.generateEmployeeId(empType);

    // Always generate a system temp password — admin never sees it, user must change on first login
    const tempPassword = `OWMS@${Math.floor(100000 + Math.random() * 900000)}`;

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role: roleId,
      department,
      designation,
      employmentType: empType,
      employeeId,
      skills: skills || [],
      joinDate: new Date(),
      hrManager: hrManagerInput || undefined,
      mustChangePassword: true,
    });

    // Auto-assign HR if not provided
    let assignedHR       = null;
    let hrCapExceeded    = false;
    let autoAssigned     = false;

    if (!hrManagerInput) {
      const result = await autoAssignHR(user);
      if (result.hrUser) {
        user.hrManager = result.hrUser._id;
        await user.save({ validateBeforeSave: false });
        assignedHR    = result.hrUser;
        hrCapExceeded = result.capExceeded;
        autoAssigned  = true;
      }
    } else {
      assignedHR = await User.findById(hrManagerInput).select('_id name');
    }

    // Fetch populated user for response
    const populatedUser = await User.findById(user._id)
      .populate('role', 'name slug color')
      .populate('department', 'name code')
      .populate('hrManager', 'name employeeId');

    // Auto-create leave balance for non-interns
    if (empType !== 'Intern') {
      await syncEmployeeLeaveBalance(user._id).catch(() => {});
    }

    // Notify the new user
    await sendNotification({
      recipient: user._id,
      type: 'user_created',
      title: 'Welcome to OWMS',
      message: `Your account has been created. Employee ID: ${employeeId}`,
      link: '/profile',
      sender: req.user._id,
    });

    // Notify the assigned HR
    if (assignedHR) {
      await sendNotification({
        recipient: assignedHR._id,
        type:      'system_alert',
        title:     'New Onboarding Assignment',
        message:   `You have been assigned as the onboarding HR for ${name} (${employeeId}).`,
        link:      '/hr/onboarding',
        sender:    req.user._id,
      });
    }

    // If cap was exceeded, also warn the admin who created the user
    if (hrCapExceeded && assignedHR) {
      await sendNotification({
        recipient: req.user._id,
        type:      'system_alert',
        title:     'HR Onboarding Cap Exceeded',
        message:   `${assignedHR.name} has exceeded the onboarding HR limit. Consider reassigning ${name} to another HR.`,
        link:      '/hr/onboarding',
        sender:    req.user._id,
      });
    }

    // Send welcome email with credentials
    let emailWarning = null;
    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name,
        email: user.email,
        tempPassword,
        employeeId,
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
      emailWarning = 'User created but welcome email could not be sent.';
    }

    sendSuccess(res, {
      ...populatedUser.toJSON(),
      tempPassword,
      ...(emailWarning  && { warning: emailWarning }),
      ...(autoAssigned  && { autoAssignedHR: assignedHR?.name }),
      ...(hrCapExceeded && { hrCapWarning: `${assignedHR?.name} has exceeded the onboarding HR cap.` }),
    }, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Get a single user with deep population.
 * Response matches UserDetails.jsx mock data shape.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          select: 'name resource action status',
        },
      })
      .populate('department', 'name code')
      .populate('manager', 'name employeeId designation')
      .populate('hrManager', 'name employeeId')
      .populate('mentor', 'name employeeId designation')
      .populate('pmoLead', 'name employeeId designation')
      .populate('project', 'name status description startDate endDate');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user fields. Cannot update email or password through this endpoint.
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, designation, department, role, employmentType, status,
      manager, hrManager, skills, college, mentor, pmoLead,
      internshipStart, internshipEnd } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Track role + hrManager change for notifications
    const oldRole      = user.role?.toString();
    const oldHRManager = user.hrManager?.toString();

    // Update fields
    if (name) user.name = name;
    if (designation !== undefined) user.designation = designation;
    if (department !== undefined) user.department = department;
    if (role) user.role = role;
    if (employmentType) user.employmentType = employmentType;
    if (status) user.status = status;
    if (manager !== undefined) user.manager = manager;
    if (hrManager !== undefined) user.hrManager = hrManager;
    if (skills) user.skills = skills;
    if (college !== undefined) user.college = college;
    if (mentor !== undefined) user.mentor = mentor;
    if (pmoLead !== undefined) user.pmoLead = pmoLead;
    if (internshipStart) user.internshipStart = internshipStart;
    if (internshipEnd) user.internshipEnd = internshipEnd;

    await user.save({ validateBeforeSave: false });

    // If role changed, notify user
    if (role && role !== oldRole) {
      const newRoleDoc = await Role.findById(role);
      await sendNotification({
        recipient: user._id,
        type: 'permission_changed',
        title: 'Role Updated',
        message: `Your role has been updated to ${newRoleDoc?.name || 'a new role'}`,
        link: '/profile',
        sender: req.user._id,
      });
    }

    // If hrManager changed, notify both old and new HR
    if (hrManager !== undefined && hrManager?.toString() !== oldHRManager) {
      if (hrManager) {
        await sendNotification({
          recipient: hrManager,
          type:      'system_alert',
          title:     'New Onboarding Assignment',
          message:   `You have been assigned as the onboarding HR for ${user.name} (${user.employeeId}).`,
          link:      '/hr/onboarding',
          sender:    req.user._id,
        });
      }
      if (oldHRManager) {
        await sendNotification({
          recipient: oldHRManager,
          type:      'system_alert',
          title:     'Onboarding Reassigned',
          message:   `${user.name} (${user.employeeId}) has been reassigned to another HR.`,
          link:      '/hr/onboarding',
          sender:    req.user._id,
        });
      }
    }

    // Return populated user
    const updatedUser = await User.findById(user._id)
      .populate('role', 'name slug color')
      .populate('department', 'name code');

    sendSuccess(res, updatedUser, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Soft delete — sets status to 'Inactive' and marks deletedAt.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You cannot delete your own account', 400);
    }

    // Soft delete — free the email so it can be reused
    user.status = 'Inactive';
    user.deletedAt = new Date();
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, { _id: user._id, name: user.name }, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Toggle user status (Active/Inactive/Suspended).
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return sendError(res, 'Invalid status. Must be Active, Inactive, or Suspended', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('role', 'name slug color').populate('department', 'name code');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Notify the affected user
    await sendNotification({
      recipient: user._id,
      type: 'system_alert',
      title: 'Account Status Changed',
      message: `Your account status has been changed to ${status}`,
      sender: req.user._id,
    });

    sendSuccess(res, user, `User status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/users/:id/reset-password
 * Generates a new temp password for a user.
 * Returns the temp password (admin shows it once).
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Generate new temp password
    const tempPassword = `OWMS@${Math.floor(100000 + Math.random() * 900000)}`;
    user.password = tempPassword;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    sendSuccess(res, {
      _id: user._id,
      name: user.name,
      tempPassword,
    }, 'Password reset successfully. Share this temporary password with the user.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id/projects
 * All projects where the user is manager, team member, or intern.
 */
export const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const projects = await Project.find({
      $or: [
        { manager: userId },
        { 'team.user': userId },
        { 'interns.user': userId },
      ],
    })
      .populate('manager', 'name designation')
      .populate('department', 'name')
      .select('name code status priority description startDate endDate healthStatus team interns manager department')
      .sort({ createdAt: -1 });

    const enriched = projects.map(p => {
      const uid = userId.toString();
      const role =
        p.manager?._id?.toString() === uid ? 'Manager' :
        p.team.some(t => t.user?.toString() === uid)
          ? (p.team.find(t => t.user?.toString() === uid)?.role || 'Team Member')
          : p.interns.some(i => i.user?.toString() === uid) ? 'Intern' : 'Member';
      return { ...p.toObject(), userRole: role };
    });

    sendSuccess(res, enriched, 'Projects fetched');
  } catch (error) {
    next(error);
  }
};
