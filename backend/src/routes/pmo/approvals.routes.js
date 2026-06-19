import { Router } from 'express';
import { getPendingLeaves, getTasksInReview, updateApproval } from '../../controllers/pmo/approvals.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { pmoScope } from '../../middleware/pmoScope.js';

const router = Router();
router.use(protect);
router.use(pmoScope);

router.get('/leaves', requirePermission('Leave', 'read'), getPendingLeaves);
router.get('/tasks', requirePermission('Tasks', 'read'), getTasksInReview);
router.put('/:id', requirePermission('Tasks', 'update'), updateApproval);

export default router;
