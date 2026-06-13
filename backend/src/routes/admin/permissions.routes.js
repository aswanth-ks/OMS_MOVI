import { Router } from 'express';
import {
  getPermissions, createPermission, getPermissionById,
  updatePermission, updatePermissionStatus, deletePermission,
} from '../../controllers/admin/permissions.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);

router.get('/', requirePermission('Permissions', 'read'), getPermissions);
router.post('/', requirePermission('Permissions', 'create'), auditLog('Create', 'Permissions'), createPermission);
router.get('/:id', requirePermission('Permissions', 'read'), getPermissionById);
router.put('/:id', requirePermission('Permissions', 'update'), auditLog('Update', 'Permissions'), updatePermission);
router.patch('/:id/status', requirePermission('Permissions', 'update'), auditLog('Update', 'Permissions'), updatePermissionStatus);
router.delete('/:id', requirePermission('Permissions', 'delete'), auditLog('Delete', 'Permissions'), deletePermission);

export default router;
