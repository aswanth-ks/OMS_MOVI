import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Grid2X2, CheckSquare, Users, GraduationCap, BarChart2, LayoutDashboard, CalendarDays, Clock, BookOpen, User, Briefcase } from 'lucide-react';

const NAV_CONFIG = {
  employee: [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard', isLucide: true },
    { to: '/employee/tasks', icon: CheckSquare, label: 'My Tasks', isLucide: true },
    { to: '/employee/projects', icon: Briefcase, label: 'My Projects', isLucide: true },
    { to: '/employee/team', icon: Users, label: 'My Team', isLucide: true },
    { to: '/employee/attendance', icon: CalendarDays, label: 'Attendance', isLucide: true },
    { to: '/employee/leave', icon: Clock, label: 'Leave', isLucide: true },
    { to: '/employee/profile', icon: User, label: 'My Profile', isLucide: true },
  ],
  intern: [
    { to: '/intern/dashboard', icon: LayoutDashboard, label: 'Dashboard', isLucide: true },
    { to: '/intern/tasks', icon: CheckSquare, label: 'My Tasks', isLucide: true },
    { to: '/intern/attendance', icon: CalendarDays, label: 'Attendance', isLucide: true },
    { to: '/intern/leave', icon: Clock, label: 'Leave', isLucide: true },
    { to: '/intern/learning', icon: BookOpen, label: 'Learning', isLucide: true },
    { to: '/intern/profile', icon: User, label: 'My Profile', isLucide: true },
  ],
  hr: [
    { to: '/hr/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/hr/employees', icon: 'badge', label: 'Employees' },
    { to: '/hr/interns', icon: 'school', label: 'Interns' },
    { to: '/hr/onboarding', icon: 'person_add', label: 'Onboarding' },
    { to: '/hr/attendance', icon: 'event_available', label: 'Attendance' },
    { to: '/hr/performance', icon: 'grade', label: 'Performance' },
    { to: '/hr/tasks', icon: 'view_kanban', label: 'Task Board' },
    { to: '/hr/tasks/new', icon: CheckSquare, label: 'Assign Task', isLucide: true },
    { to: '/hr/profile', icon: User, label: 'My Profile', isLucide: true },
  ],
  pmo: [
    { to: '/pmo/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/pmo/projects', icon: 'work', label: 'Projects' },
    { to: '/pmo/tasks', icon: 'task_alt', label: 'Task Assignment' },
    { to: '/pmo/team', icon: Users, label: 'Team', isLucide: true },
    { to: '/pmo/interns', icon: GraduationCap, label: 'Interns', isLucide: true },
    { to: '/pmo/monitoring', icon: 'monitoring', label: 'Monitoring' },
    { to: '/pmo/timeline', icon: 'timeline', label: 'Timeline' },
    { to: '/pmo/approvals', icon: 'approval', label: 'Approvals' },
    { to: '/pmo/reports', icon: BarChart2, label: 'Reports', isLucide: true },
    { to: '/pmo/profile', icon: User, label: 'My Profile', isLucide: true },
  ],
  admin: [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/users', icon: 'group', label: 'Users' },
    { to: '/admin/departments', icon: 'domain', label: 'Departments' },
    { to: '/admin/roles', icon: 'badge', label: 'Roles' },
    { to: '/admin/permissions', icon: Shield, label: 'Permissions', isLucide: true },
    { to: '/admin/access-matrix', icon: Grid2X2, label: 'Access Matrix', isLucide: true },
    { to: '/admin/audit', icon: 'history', label: 'Audit Logs' },
    { to: '/admin/reports', icon: 'analytics', label: 'Reports' },
    { to: '/admin/settings', icon: 'settings', label: 'Settings' },
  ],
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();
  const links = NAV_CONFIG[user?.role] || [];

  const isIntern = user?.role === 'intern';

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-[260px]'} hidden lg:flex font-sans ${isIntern ? 'bg-[#1E293B] border-r border-[#1E293B]' : 'bg-[#F8FAFC] border-r border-[#E2E8F0]'}`}>
      
      {/* Spacer for Header */}
      <div className="h-16 flex-shrink-0" />

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-20 w-6 h-6 border rounded-full flex items-center justify-center shadow-sm z-50 transition-colors ${
          isIntern 
            ? 'bg-[#334155] border-[#475569] text-slate-300 hover:text-white hover:border-[#2563EB]' 
            : 'bg-white border-[#E2E8F0] text-slate-500 hover:text-blue-600 hover:border-blue-600'
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
      </button>

      {/* Nav links */}
      <nav className={`flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar ${collapsed ? 'px-3' : 'px-4'}`}>
        {links.map(({ to, icon, label, isLucide }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : ''}
            className={({ isActive }) => {
              let activeClass = '';
              let idleClass = '';
              
              if (isIntern) {
                activeClass = 'bg-[#2563EB] text-white font-medium';
                idleClass = 'text-slate-300 hover:bg-[#334155] hover:text-white';
              } else {
                activeClass = 'bg-[#E2E8F0] text-[#0F172A] font-medium';
                idleClass = 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]';
              }

              return `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? activeClass : idleClass} ${collapsed ? 'justify-center px-0 py-3' : ''}`;
            }}
          >
            {isLucide ? (
              <span className="flex-shrink-0 flex items-center justify-center w-[20px]">
                {(() => {
                  const Icon = icon;
                  return <Icon size={18} />;
                })()}
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">{icon}</span>
            )}
            {!collapsed && <span className="text-[13px] whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Intern Progress Card (Bottom of Sidebar) */}
      {isIntern && !collapsed && (
        <div className="shrink-0 mb-6 mx-4">
          <div className="bg-[#0F172A] rounded-xl p-4 shadow-sm border border-slate-700/50">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Internship Status</h4>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[13px] font-bold text-white">45 days</span>
              <span className="text-[10px] text-slate-400">remaining</span>
            </div>
            <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
              <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '55%' }} />
            </div>
          </div>
        </div>
      )}
      
      {isIntern && collapsed && (
        <div className="shrink-0 mb-6 mx-auto">
          <div className="w-10 h-10 rounded-full border-2 border-[#16A34A] flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-[#1E293B] rotate-45" />
          </div>
        </div>
      )}

    </aside>
  );
}
