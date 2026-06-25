import Role from '../models/Role.js';

/**
 * HR Scope Middleware
 * Restricts HR Manager access to only 'employee' and 'intern' role users.
 * Excludes admins, PMO leads, and other HR managers from HR views.
 * Super Admin bypasses all restrictions.
 *
 * Attaches a `scopeFilter` object to the request which can be spread into Mongoose queries.
 */
export const hrScope = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (req.user.role.slug === 'super-admin') {
      req.scopeFilter = {}; // No restriction
      return next();
    }

    if (req.user.role.slug === 'hr-manager') {
      // Fetch employee and intern roles only
      const allowedRoles = await Role.find({ slug: { $in: ['employee', 'intern'] } });
      const allowedRoleIds = allowedRoles.map(r => r._id);

      // HR sees ALL employees and interns (not restricted to a specific hrManager assignment)
      req.scopeFilter = {
        role: { $in: allowedRoleIds }
      };
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'HR access required',
    });
  } catch (error) {
    next(error);
  }
};
