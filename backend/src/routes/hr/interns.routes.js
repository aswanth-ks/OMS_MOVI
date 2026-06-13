import { Router } from 'express';
import {
  getInterns, getInternById,
  addPerformanceRating, assignMentor,
} from '../../controllers/hr/interns.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { hrScope } from '../../middleware/hrScope.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);
router.use(hrScope);

router.get('/', requirePermission('Interns', 'read'), getInterns);
router.get('/:id', requirePermission('Interns', 'read'), getInternById);
router.post('/:id/performance', requirePermission('Interns', 'manage'), auditLog('Update', 'Interns'), addPerformanceRating);
router.patch('/:id/assign-mentor', requirePermission('Interns', 'manage'), auditLog('Update', 'Interns'), assignMentor);

export default router;
