import { Router } from 'express';
import {
  getMyLeaves, getMyLeaveBalance, applyForLeave,
} from '../../controllers/employee/leave.controller.js';
import { protect } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);

router.get('/', getMyLeaves);
router.get('/balance', getMyLeaveBalance);
router.post('/', auditLog('Create', 'Leave'), applyForLeave);

export default router;
