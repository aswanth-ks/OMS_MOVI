import { Router } from 'express';
import {
  getProfile, updateProfile, changePassword,
} from '../../controllers/employee/profile.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect); // Only requires valid token, no specific RBAC, as it's self-serve

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/change-password', changePassword);

export default router;
