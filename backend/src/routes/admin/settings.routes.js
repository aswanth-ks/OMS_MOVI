import { Router } from 'express';
import { getSettings, updateSettings, resetSettings } from '../../controllers/admin/settings.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();
router.use(protect);

router.get('/',       requirePermission('Settings', 'read'),   getSettings);
router.put('/',       requirePermission('Settings', 'update'), auditLog('Update', 'Settings'), updateSettings);
router.post('/reset', requirePermission('Settings', 'update'), auditLog('Update', 'Settings'), resetSettings);

export default router;
