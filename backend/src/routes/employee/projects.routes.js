import { Router } from 'express';
import {
  getMyProjects, getProjectById, getMyTeam
} from '../../controllers/employee/projects.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', getMyProjects);
router.get('/team', getMyTeam);
router.get('/:id', getProjectById);

export default router;
