import { Router } from 'express';
import { getMyAttendance } from '../../controllers/employee/attendance.controller.js';
import { protect } from '../../middleware/auth.js';
import { employeeScope } from '../../middleware/employeeScope.js';

const router = Router();
router.use(protect, employeeScope);

router.get('/', getMyAttendance);

export default router;
