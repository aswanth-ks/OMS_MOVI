import { Router } from 'express';
import { getInterns, requestInterns } from '../../controllers/pmo/interns.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { pmoScope } from '../../middleware/pmoScope.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);
router.use(pmoScope);

router.get('/', requirePermission('Interns', 'read'), getInterns);
router.post('/request', requirePermission('Interns', 'manage'), auditLog('Create', 'Interns'), requestInterns);

export default router;
