import Role from '../../models/Role.js';
import Permission from '../../models/Permission.js';
import AuditLog from '../../models/AuditLog.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

/**
 * GET /api/admin/access-matrix
 * Returns the full matrix of roles and permissions for the UI grid.
 */
export const getAccessMatrix = async (req, res, next) => {
  try {
    const [roles, permissions] = await Promise.all([
      Role.find({ status: 'Active' }).select('name slug color isSystem permissions'),
      Permission.find({ status: 'Active' }).select('name resource action label'),
    ]);

    // Build matrix object: { "roleId": ["permId1", "permId2"] }
    const matrix = {};
    roles.forEach((role) => {
      matrix[role._id] = role.permissions.map((p) => p.toString());
    });

    sendSuccess(res, {
      roles,
      permissions,
      matrix,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/access-matrix
 * Bulk update the entire matrix.
 * Body: { matrix: { roleId: [permissionIds] } }
 */
export const updateAccessMatrix = async (req, res, next) => {
  try {
    const { matrix } = req.body;

    if (!matrix || typeof matrix !== 'object') {
      return sendError(res, 'Invalid matrix format provided', 400);
    }

    let modifiedCount = 0;

    for (const [roleId, permissionIds] of Object.entries(matrix)) {
      const role = await Role.findById(roleId);
      
      // Skip if role doesn't exist or is Super Admin
      if (!role || role.slug === 'super-admin') continue;

      role.permissions = permissionIds;
      await role.save();
      modifiedCount++;
    }

    await AuditLog.create({
      user: req.user._id, userName: req.user.name,
      action: 'Update', module: 'Access Matrix',
      details: `Access matrix updated. ${modifiedCount} roles modified.`,
      ipAddress: req.ip, userAgent: req.headers['user-agent'], result: 'SUCCESS',
    }).catch(() => {});

    sendSuccess(res, null, `Access matrix updated successfully. ${modifiedCount} roles modified.`);
  } catch (error) {
    next(error);
  }
};
