import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute, ROLE_HOME } from './routes/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import Unauthorized from './pages/auth/Unauthorized';

// Intern
import InternDashboard from './pages/intern/Dashboard';
import InternTasks from './pages/intern/Tasks';
import InternAttendance from './pages/intern/Attendance';
import InternLeave from './pages/intern/Leave';
import InternLearning from './pages/intern/Learning';
import InternProfile from './pages/intern/Profile';

// Employee
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeTasks from './pages/employee/Tasks';
import EmployeeProjects from './pages/employee/Projects';
import EmployeeTeam from './pages/employee/Team';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeave from './pages/employee/Leave';
import EmployeeProfile from './pages/employee/Profile';

// HR
import HRDashboard from './pages/hr/Dashboard';
import HREmployees from './pages/hr/Employees';
import HRAddEmployee from './pages/hr/AddEmployee';
import HREmployeeDetails from './pages/hr/EmployeeDetails';
import HRInterns from './pages/hr/Interns';
import HRInternDetails from './pages/hr/InternDetails';
import HROnboarding from './pages/hr/Onboarding';
import HRAttendance from './pages/hr/Attendance';
import HRDocuments from './pages/hr/Documents';
import HRPerformance from './pages/hr/Performance';
import HRCommunication from './pages/hr/Communication';
import HRAssignTask from './pages/hr/AssignTask';
import HRTaskBoard from './pages/hr/TaskBoard';
import HRProfile from './pages/hr/Profile';

// PMO
import PMODashboard from './pages/pmo/Dashboard';
import PMOProjects from './pages/pmo/Projects';
import PMOProjectDetails from './pages/pmo/ProjectDetails';
import PMOTasks from './pages/pmo/Tasks';
import PMOMonitoring from './pages/pmo/Monitoring';
import PMOTimeline from './pages/pmo/Timeline';
import PMOApprovals from './pages/pmo/Approvals';
import PMOTeam from './pages/pmo/Team';
import PMOInterns from './pages/pmo/Interns';
import PMOReports from './pages/pmo/Reports';
import PMOProfile from './pages/pmo/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCreateUser from './pages/admin/CreateUser';
import AdminUserDetails from './pages/admin/UserDetails';
import AdminDepartments from './pages/admin/Departments';
import AdminCreateDepartment from './pages/admin/CreateDepartment';
import AdminDepartmentDetails from './pages/admin/DepartmentDetails';
import AdminRoles from './pages/admin/Roles';
import AdminCreateRole from './pages/admin/CreateRole';
import AdminRoleDetails from './pages/admin/RoleDetails';
import AdminPermissions from './pages/admin/Permissions';
import AdminCreatePermission from './pages/admin/CreatePermission';
import AdminAccessMatrix from './pages/admin/AccessMatrix';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminReports from './pages/admin/Reports';
import AdminCreateReport from './pages/admin/CreateReport';
import AdminSettings from './pages/admin/Settings';

// Profile
import Profile from './pages/Profile';

function RoleRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Intern */}
      <Route path="/intern/dashboard" element={<ProtectedRoute allowedRoles={['intern']}><InternDashboard /></ProtectedRoute>} />
      <Route path="/intern/tasks" element={<ProtectedRoute allowedRoles={['intern']}><InternTasks /></ProtectedRoute>} />
      <Route path="/intern/attendance" element={<ProtectedRoute allowedRoles={['intern']}><InternAttendance /></ProtectedRoute>} />
      <Route path="/intern/leave" element={<ProtectedRoute allowedRoles={['intern']}><InternLeave /></ProtectedRoute>} />
      <Route path="/intern/learning" element={<ProtectedRoute allowedRoles={['intern']}><InternLearning /></ProtectedRoute>} />
      <Route path="/intern/profile" element={<ProtectedRoute allowedRoles={['intern']}><InternProfile /></ProtectedRoute>} />

      {/* Employee */}
      <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/tasks" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTasks /></ProtectedRoute>} />
      <Route path="/employee/projects" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProjects /></ProtectedRoute>} />
      <Route path="/employee/team" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTeam /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
      <Route path="/employee/leave" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLeave /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProfile /></ProtectedRoute>} />

      {/* HR */}
      <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['hr']}><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['hr']}><HREmployees /></ProtectedRoute>} />
      <Route path="/hr/employees/new" element={<ProtectedRoute allowedRoles={['hr']}><HRAddEmployee /></ProtectedRoute>} />
      <Route path="/hr/employees/:id" element={<ProtectedRoute allowedRoles={['hr']}><HREmployeeDetails /></ProtectedRoute>} />
      <Route path="/hr/interns" element={<ProtectedRoute allowedRoles={['hr']}><HRInterns /></ProtectedRoute>} />
      <Route path="/hr/interns/:id" element={<ProtectedRoute allowedRoles={['hr']}><HRInternDetails /></ProtectedRoute>} />
      <Route path="/hr/onboarding" element={<ProtectedRoute allowedRoles={['hr']}><HROnboarding /></ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute allowedRoles={['hr']}><HRAttendance /></ProtectedRoute>} />
      <Route path="/hr/documents" element={<ProtectedRoute allowedRoles={['hr']}><HRDocuments /></ProtectedRoute>} />
      <Route path="/hr/tasks" element={<ProtectedRoute allowedRoles={['hr']}><HRTaskBoard /></ProtectedRoute>} />
      <Route path="/hr/performance" element={<ProtectedRoute allowedRoles={['hr']}><HRPerformance /></ProtectedRoute>} />
      <Route path="/hr/communication" element={<ProtectedRoute allowedRoles={['hr']}><HRCommunication /></ProtectedRoute>} />
      <Route path="/hr/tasks/new" element={<ProtectedRoute allowedRoles={['hr']}><HRAssignTask /></ProtectedRoute>} />
      <Route path="/hr/profile" element={<ProtectedRoute allowedRoles={['hr']}><HRProfile /></ProtectedRoute>} />

      {/* PMO */}
      <Route path="/pmo/dashboard" element={<ProtectedRoute allowedRoles={['pmo']}><PMODashboard /></ProtectedRoute>} />
      <Route path="/pmo/projects" element={<ProtectedRoute allowedRoles={['pmo']}><PMOProjects /></ProtectedRoute>} />
      <Route path="/pmo/projects/:id" element={<ProtectedRoute allowedRoles={['pmo']}><PMOProjectDetails /></ProtectedRoute>} />
      <Route path="/pmo/tasks" element={<ProtectedRoute allowedRoles={['pmo']}><PMOTasks /></ProtectedRoute>} />
      <Route path="/pmo/team" element={<ProtectedRoute allowedRoles={['pmo']}><PMOTeam /></ProtectedRoute>} />
      <Route path="/pmo/interns" element={<ProtectedRoute allowedRoles={['pmo']}><PMOInterns /></ProtectedRoute>} />
      <Route path="/pmo/monitoring" element={<ProtectedRoute allowedRoles={['pmo']}><PMOMonitoring /></ProtectedRoute>} />
      <Route path="/pmo/timeline" element={<ProtectedRoute allowedRoles={['pmo']}><PMOTimeline /></ProtectedRoute>} />
      <Route path="/pmo/approvals" element={<ProtectedRoute allowedRoles={['pmo']}><PMOApprovals /></ProtectedRoute>} />
      <Route path="/pmo/reports" element={<ProtectedRoute allowedRoles={['pmo']}><PMOReports /></ProtectedRoute>} />
      <Route path="/pmo/profile" element={<ProtectedRoute allowedRoles={['pmo']}><PMOProfile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/users/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreateUser /></ProtectedRoute>} />
      <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserDetails /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>} />
      <Route path="/admin/departments/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreateDepartment /></ProtectedRoute>} />
      <Route path="/admin/departments/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartmentDetails /></ProtectedRoute>} />
      <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoles /></ProtectedRoute>} />
      <Route path="/admin/roles/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreateRole /></ProtectedRoute>} />
      <Route path="/admin/roles/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoleDetails /></ProtectedRoute>} />
      <Route path="/admin/permissions" element={<ProtectedRoute allowedRoles={['admin']}><AdminPermissions /></ProtectedRoute>} />
      <Route path="/admin/permissions/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreatePermission /></ProtectedRoute>} />
      <Route path="/admin/access-matrix" element={<ProtectedRoute allowedRoles={['admin']}><AdminAccessMatrix /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AdminAuditLogs /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/reports/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreateReport /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
      
      {/* Global Profile Route */}
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['intern', 'hr', 'pmo', 'admin']}><Profile /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
