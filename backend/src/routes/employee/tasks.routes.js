import { Router } from 'express';
import {
  getMyTasks, updateTaskStatus, addTaskComment,
} from '../../controllers/employee/tasks.controller.js';
import { protect } from '../../middleware/auth.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);

router.get('/', getMyTasks);
router.patch('/:id/status', auditLog('Update', 'Tasks'), updateTaskStatus);
router.post('/:id/comments', addTaskComment);

export default router;
