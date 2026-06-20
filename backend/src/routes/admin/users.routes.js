import { Router } from 'express';
import {
  getUsers, createUser, getUserById, updateUser,
  deleteUser, updateUserStatus, resetUserPassword, getUserProjects,
} from '../../controllers/admin/users.controller.js';
import { protect } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';
import { auditLog } from '../../middleware/audit.js';

const router = Router();

// All routes require authentication
router.use(protect);

// GET /api/admin/users — List all users with filters + pagination
router.get('/', requirePermission('Users', 'read'), getUsers);

// POST /api/admin/users — Create a new user
router.post('/', requirePermission('Users', 'create'), auditLog('Create', 'Users'), createUser);

// GET /api/admin/users/:id — Get single user details
router.get('/:id', requirePermission('Users', 'read'), getUserById);

// GET /api/admin/users/:id/projects — Get all projects a user is involved in
router.get('/:id/projects', requirePermission('Users', 'read'), getUserProjects);

// PUT /api/admin/users/:id — Update user
router.put('/:id', requirePermission('Users', 'update'), auditLog('Update', 'Users'), updateUser);

// DELETE /api/admin/users/:id — Soft delete user
router.delete('/:id', requirePermission('Users', 'delete'), auditLog('Delete', 'Users'), deleteUser);

// PATCH /api/admin/users/:id/status — Toggle user status
router.patch('/:id/status', requirePermission('Users', 'update'), auditLog('Update', 'Users'), updateUserStatus);

// POST /api/admin/users/:id/reset-password — Reset user password
router.post('/:id/reset-password', requirePermission('Users', 'manage'), auditLog('Update', 'Users'), resetUserPassword);

export default router;
