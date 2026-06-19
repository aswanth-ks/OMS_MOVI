import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};

// Create a configured axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Send cookies/session across domains if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('owms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('owms_token');
      localStorage.removeItem('owms_refresh_token');
      localStorage.removeItem('owms_user');
      // Fire event so AuthContext can clear React state (avoid stale UI)
      window.dispatchEvent(new Event('owms:unauthorized'));
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    if (error.response?.status === 403) {
      console.warn('Access denied:', error.response.data?.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── AUTH API ─────────────────────────────────────────────────────────────
export const authAPI = {
  // credentials: { identifier, password } — backend accepts email OR employeeId in 'identifier'
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ─── ADMIN API ────────────────────────────────────────────────────────────
export const adminAPI = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  resetUserPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),

  // Roles
  getRoles: () => api.get('/admin/roles'),
  getRole: (id) => api.get(`/admin/roles/${id}`),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  updateRolePermissions: (id, permissions) =>
    api.post(`/admin/roles/${id}/permissions`, { permissions }),

  // Departments
  getDepartments: (params) => api.get('/admin/departments', { params }),
  getDepartment: (id) => api.get(`/admin/departments/${id}`),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),

  // Permissions
  getPermissions: (params) => api.get('/admin/permissions', { params }),
  createPermission: (data) => api.post('/admin/permissions', data),
  updatePermissionStatus: (id, status) => api.patch(`/admin/permissions/${id}/status`, { status }),

  // Access Matrix
  getAccessMatrix: () => api.get('/admin/access-matrix'),
  saveAccessMatrix: (matrix) => api.put('/admin/access-matrix', { matrix }),
  // legacy alias
  updateAccessMatrix: (data) => api.put('/admin/access-matrix', data),

  // Audit Logs
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),

  // Reports
  getReportTypes: () => api.get('/admin/reports'),
  runReport: (type, filters) => api.post('/admin/reports/run', { type, filters }),
  exportReport: (type, filters) => api.get(`/admin/reports/${type}/export`, { params: filters, responseType: 'blob' }),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  saveSettings: (data) => api.put('/admin/settings', data),
};

// ─── HR API ───────────────────────────────────────────────────────────────
export const hrAPI = {
  getEmployees: (params) => api.get('/hr/employees', { params }),
  getEmployee: (id) => api.get(`/hr/employees/${id}`),
  getEmployeeAttendance: (id, params) => api.get(`/hr/employees/${id}/attendance`, { params }),
  getEmployeeLeaves: (id) => api.get(`/hr/employees/${id}/leaves`),
  addEmployeeNote: (id, note) => api.post(`/hr/employees/${id}/notes`, { note }),

  getPendingOnboarding: () => api.get('/hr/onboarding/pending'),
  getCompletedOnboarding: () => api.get('/hr/onboarding/completed'),
  updateOnboardingChecklist: (id, data) => api.patch(`/hr/onboarding/${id}/checklist`, data),

  getAttendance: (params) => api.get('/hr/attendance', { params }),
  markAttendance: (data) => api.post('/hr/attendance/mark', data),
  exportAttendance: (params) => api.get('/hr/attendance/export', { params, responseType: 'blob' }),

  getPendingLeaves: () => api.get('/hr/leaves/pending'),
  getLeaves: (params) => api.get('/hr/leaves', { params }),
  reviewLeave: (id, data) => api.patch(`/hr/leaves/${id}/review`, data),
  allocateLeaveBalance: (data) => api.post('/hr/leaves/balance', data),

  getInterns: (params) => api.get('/hr/interns', { params }),
  getIntern: (id) => api.get(`/hr/interns/${id}`),
  addInternPerformance: (id, data) => api.post(`/hr/interns/${id}/performance`, data),
  assignInternMentor: (id, data) => api.patch(`/hr/interns/${id}/assign-mentor`, data),

  getHeadcountReport: () => api.get('/hr/reports/headcount'),
  getAttendanceSummary: (params) => api.get('/hr/reports/attendance-summary', { params }),
  getLeaveSummary: (params) => api.get('/hr/reports/leave-summary', { params }),
};

// ─── PMO API ──────────────────────────────────────────────────────────────
export const pmoAPI = {
  getProjects: (params) => api.get('/pmo/projects', { params }),
  getProject: (id) => api.get(`/pmo/projects/${id}`),
  createProject: (data) => api.post('/pmo/projects', data),
  updateProject: (id, data) => api.put(`/pmo/projects/${id}`, data),
  addProjectTeam: (id, members) => api.post(`/pmo/projects/${id}/team`, { members }),
  removeProjectTeamMember: (id, userId) => api.delete(`/pmo/projects/${id}/team/${userId}`),
  assignProjectInterns: (id, internIds) => api.post(`/pmo/projects/${id}/interns`, { internIds }),
  addProjectMilestone: (id, data) => api.post(`/pmo/projects/${id}/milestones`, data),
  updateProjectMilestone: (id, milestoneId, data) => api.patch(`/pmo/projects/${id}/milestones/${milestoneId}`, data),

  getTasks: (params) => api.get('/pmo/tasks', { params }),
  getTask: (id) => api.get(`/pmo/tasks/${id}`),
  createTask: (data) => api.post('/pmo/tasks', data),
  updateTask: (id, data) => api.put(`/pmo/tasks/${id}`, data),
  updateTaskStatus: (id, data) => api.patch(`/pmo/tasks/${id}/status`, data),
  addTaskComment: (id, data) => api.post(`/pmo/tasks/${id}/comments`, data),
  deleteTask: (id) => api.delete(`/pmo/tasks/${id}`),

  getTeam: () => api.get('/pmo/team'),
  getAvailableMembers: (params) => api.get('/pmo/team/available', { params }),

  getInterns: () => api.get('/pmo/interns'),
  requestInterns: (data) => api.post('/pmo/interns/request', data),

  getPendingLeaves: () => api.get('/pmo/approvals/leaves'),
  getTasksInReview: () => api.get('/pmo/approvals/tasks'),

  getProjectHealth: () => api.get('/pmo/reports/health'),
  getResourceWarnings: () => api.get('/pmo/reports/warnings'),
};

// ─── EMPLOYEE API ─────────────────────────────────────────────────────────
export const employeeAPI = {
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.patch('/employee/profile', data),
  changePassword: (data) => api.post('/employee/profile/change-password', data),

  getTasks: (params) => api.get('/employee/tasks', { params }),
  updateTaskStatus: (id, data) => api.patch(`/employee/tasks/${id}/status`, data),
  addTaskComment: (id, data) => api.post(`/employee/tasks/${id}/comments`, data),

  getProjects: (params) => api.get('/employee/projects', { params }),
  getProject: (id) => api.get(`/employee/projects/${id}`),
  getTeam: () => api.get('/employee/projects/team'),

  getAttendance: (params) => api.get('/employee/attendance', { params }),
  
  getLeaves: () => api.get('/employee/leave'),
  getLeaveBalance: () => api.get('/employee/leave/balance'),
  applyForLeave: (data) => api.post('/employee/leave', data),
};

// ─── INTERN API ───────────────────────────────────────────────────────────
export const internAPI = {
  getProfile: () => api.get('/intern/profile'),
  updateProfile: (data) => api.patch('/intern/profile', data),
  changePassword: (data) => api.post('/intern/profile/change-password', data),

  getTasks: (params) => api.get('/intern/tasks', { params }),
  updateTaskStatus: (id, data) => api.patch(`/intern/tasks/${id}/status`, data),
  addTaskComment: (id, data) => api.post(`/intern/tasks/${id}/comments`, data),

  getAttendance: (params) => api.get('/intern/attendance', { params }),
  
  getLeaves: () => api.get('/intern/leave'),
  getLeaveBalance: () => api.get('/intern/leave/balance'),
  applyForLeave: (data) => api.post('/intern/leave', data),

  getLearningResources: () => api.get('/intern/learning'),
  updateLearningStatus: (id, data) => api.patch(`/intern/learning/${id}/status`, data),
};

// ─── NOTIFICATION API ─────────────────────────────────────────────────────
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};
