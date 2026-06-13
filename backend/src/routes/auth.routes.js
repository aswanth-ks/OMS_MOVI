import { Router } from 'express';
import {
  login,
  getMe,
  refreshToken,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login — Login with email or employeeId
router.post('/login', login);

// POST /api/auth/refresh — Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/logout — Invalidate refresh token
router.post('/logout', protect, logout);

// GET /api/auth/me — Get current authenticated user
router.get('/me', protect, getMe);

export default router;
