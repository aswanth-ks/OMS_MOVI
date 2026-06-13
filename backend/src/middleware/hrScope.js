/**
 * HR Scope Middleware
 * Ensures HR Managers only see data for employees they manage,
 * while Super Admin can see all data.
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
      // HR sees users where hrManager === req.user._id
      req.scopeFilter = { hrManager: req.user._id };
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
