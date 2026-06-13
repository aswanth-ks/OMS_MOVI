import Permission from '../../models/Permission.js';
import Role from '../../models/Role.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

/**
 * GET /api/admin/permissions
 * List all permissions with optional filters.
 */
export const getPermissions = async (req, res, next) => {
  try {
    const { resource, action, status, search } = req.query;
    const filter = {};

    if (resource) filter.resource = resource;
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } },
      ];
    }

    const permissions = await Permission.find(filter).sort({ resource: 1, action: 1 });

    // Add count of roles that have each permission
    const permsWithRoleCounts = await Promise.all(
      permissions.map(async (perm) => {
        const roleCount = await Role.countDocuments({ permissions: perm._id });
        const permObj = perm.toJSON();
        permObj.assignedRolesCount = roleCount;
        return permObj;
      })
    );

    sendSuccess(res, permsWithRoleCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/permissions
 * Create a new permission.
 */
export const createPermission = async (req, res, next) => {
  try {
    const { name, label, resource, action, description, riskLevel, requiresApproval } = req.body;

    if (!name || !label || !resource || !action) {
      return sendError(res, 'name, label, resource, and action are required', 400);
    }

    const permission = await Permission.create({
      name, label, resource, action, description, riskLevel, requiresApproval,
    });

    sendSuccess(res, permission, 'Permission created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/permissions/:id
 */
export const getPermissionById = async (req, res, next) => {
  try {
    const perm = await Permission.findById(req.params.id);
    if (!perm) return sendError(res, 'Permission not found', 404);

    const roleCount = await Role.countDocuments({ permissions: perm._id });
    const permObj = perm.toJSON();
    permObj.assignedRolesCount = roleCount;

    sendSuccess(res, permObj);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/permissions/:id
 */
export const updatePermission = async (req, res, next) => {
  try {
    const { label, description, riskLevel, requiresApproval } = req.body;

    const perm = await Permission.findByIdAndUpdate(
      req.params.id,
      { label, description, riskLevel, requiresApproval },
      { new: true, runValidators: true }
    );

    if (!perm) return sendError(res, 'Permission not found', 404);
    sendSuccess(res, perm, 'Permission updated');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/permissions/:id/status
 */
export const updatePermissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
      return sendError(res, 'Status must be Active or Inactive', 400);
    }

    const perm = await Permission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!perm) return sendError(res, 'Permission not found', 404);
    sendSuccess(res, perm, `Permission ${status === 'Active' ? 'activated' : 'deactivated'}`);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/permissions/:id
 */
export const deletePermission = async (req, res, next) => {
  try {
    const perm = await Permission.findById(req.params.id);
    if (!perm) return sendError(res, 'Permission not found', 404);

    // Remove from all roles that have it
    await Role.updateMany(
      { permissions: perm._id },
      { $pull: { permissions: perm._id } }
    );

    await Permission.findByIdAndDelete(req.params.id);
    sendSuccess(res, { _id: perm._id, name: perm.name }, 'Permission deleted');
  } catch (error) {
    next(error);
  }
};
