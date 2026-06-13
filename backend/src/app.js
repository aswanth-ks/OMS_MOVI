import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/auth.routes.js';
import adminUserRoutes from './routes/admin/users.routes.js';
import adminDeptRoutes from './routes/admin/departments.routes.js';
import adminRoleRoutes from './routes/admin/roles.routes.js';
import adminPermRoutes from './routes/admin/permissions.routes.js';
import adminMatrixRoutes from './routes/admin/accessMatrix.routes.js';
import adminAuditRoutes from './routes/admin/auditLogs.routes.js';
import adminSettingsRoutes from './routes/admin/settings.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Part 2 Route Imports
import hrEmployeesRoutes from './routes/hr/employees.routes.js';
import hrOnboardingRoutes from './routes/hr/onboarding.routes.js';
import hrAttendanceRoutes from './routes/hr/attendance.routes.js';
import hrLeavesRoutes from './routes/hr/leaves.routes.js';
import hrInternsRoutes from './routes/hr/interns.routes.js';
import hrReportsRoutes from './routes/hr/reports.routes.js';

import pmoProjectsRoutes from './routes/pmo/projects.routes.js';
import pmoTasksRoutes from './routes/pmo/tasks.routes.js';
import pmoTeamRoutes from './routes/pmo/team.routes.js';
import pmoInternsRoutes from './routes/pmo/interns.routes.js';
import pmoApprovalsRoutes from './routes/pmo/approvals.routes.js';
import pmoReportsRoutes from './routes/pmo/reports.routes.js';

import empProfileRoutes from './routes/employee/profile.routes.js';
import empTasksRoutes from './routes/employee/tasks.routes.js';
import empProjectsRoutes from './routes/employee/projects.routes.js';
import empAttendanceRoutes from './routes/employee/attendance.routes.js';
import empLeaveRoutes from './routes/employee/leave.routes.js';

import internProfileRoutes from './routes/intern/profile.routes.js';
import internTasksRoutes from './routes/intern/tasks.routes.js';
import internAttendanceRoutes from './routes/intern/attendance.routes.js';
import internLeaveRoutes from './routes/intern/leave.routes.js';
import internLearningRoutes from './routes/intern/learning.routes.js';
// Middleware
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging (dev only) ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/api/health',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OWMS API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/departments', adminDeptRoutes);
app.use('/api/admin/roles', adminRoleRoutes);
app.use('/api/admin/permissions', adminPermRoutes);
app.use('/api/admin/access-matrix', adminMatrixRoutes);
app.use('/api/admin/audit-logs', adminAuditRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/notifications', notificationRoutes);

// HR Module
app.use('/api/hr/employees', hrEmployeesRoutes);
app.use('/api/hr/onboarding', hrOnboardingRoutes);
app.use('/api/hr/attendance', hrAttendanceRoutes);
app.use('/api/hr/leaves', hrLeavesRoutes);
app.use('/api/hr/interns', hrInternsRoutes);
app.use('/api/hr/reports', hrReportsRoutes);

// PMO Module
app.use('/api/pmo/projects', pmoProjectsRoutes);
app.use('/api/pmo/tasks', pmoTasksRoutes);
app.use('/api/pmo/team', pmoTeamRoutes);
app.use('/api/pmo/interns', pmoInternsRoutes);
app.use('/api/pmo/approvals', pmoApprovalsRoutes);
app.use('/api/pmo/reports', pmoReportsRoutes);

// Employee Module
app.use('/api/employee/profile', empProfileRoutes);
app.use('/api/employee/tasks', empTasksRoutes);
app.use('/api/employee/projects', empProjectsRoutes);
app.use('/api/employee/attendance', empAttendanceRoutes);
app.use('/api/employee/leave', empLeaveRoutes);

// Intern Module
app.use('/api/intern/profile', internProfileRoutes);
app.use('/api/intern/tasks', internTasksRoutes);
app.use('/api/intern/attendance', internAttendanceRoutes);
app.use('/api/intern/leave', internLeaveRoutes);
app.use('/api/intern/learning', internLearningRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
