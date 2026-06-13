import { Router } from 'express';
import {
  getPendingLeaves, getLeaves, reviewLeave, allocateLeaveBalance,
} from '../../controllers/hr/leaves.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { hrScope } from '../../middleware/hrScope.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);
router.use(hrScope);

router.get('/pending', requirePermission('Leave', 'read'), getPendingLeaves);
router.get('/', requirePermission('Leave', 'read'), getLeaves);
router.patch('/:id/review', requirePermission('Leave', 'approve'), auditLog('Update', 'Leave'), reviewLeave);
router.post('/balance', requirePermission('Leave', 'manage'), auditLog('Update', 'Leave'), allocateLeaveBalance);

export default router;
