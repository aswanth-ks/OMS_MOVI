import { Router } from 'express';
import {
  getAccessMatrix, updateAccessMatrix,
} from '../../controllers/admin/accessMatrix.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);

router.get('/', requirePermission('Permissions', 'manage'), getAccessMatrix);
router.put('/', requirePermission('Permissions', 'manage'), auditLog('Update', 'Access Matrix'), updateAccessMatrix);

export default router;
