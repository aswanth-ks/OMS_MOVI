import { Router } from 'express';
import { getTeam, getAvailableMembers } from '../../controllers/pmo/team.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { pmoScope } from '../../middleware/pmoScope.js';

const router = Router();
router.use(protect);
router.use(pmoScope);

router.get('/', requirePermission('Projects', 'read'), getTeam);
router.get('/available', getAvailableMembers);

export default router;
