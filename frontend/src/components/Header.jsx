import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Header({ sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('owms_read_notifs') || '[]'); } catch { return []; }
  });
  const popupRef = useRef();
  const notifRef = useRef();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const unreadCount = announcements.filter(a => !readIds.includes(a._id)).length;

  useEffect(() => {
    // TODO: wire to notificationAPI.getNotifications() once notification seed data exists
    // Suppressing announcementsAPI call to avoid 404 noise until backend is seeded
  }, []);

  useEffect(() => {
    localStorage.setItem('owms_read_notifs', JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const markAllRead = () => {
    setReadIds(announcements.map(a => a._id));
  };

  const handleNotifToggle = (e) => {
    e.stopPropagation();
    setNotifOpen(p => !p);
    setProfileOpen(false);
  };

  const handleProfileToggle = (e) => {
    e.stopPropagation();
    setProfileOpen(p => !p);
    setNotifOpen(false);
  };

  // user.role from real backend is a populated object — extract slug
  const roleSlug = user?.role?.slug || user?.role || '';
  const displayRole = roleSlug === 'super-admin' || roleSlug === 'admin' ? 'Administrator' :
                      roleSlug === 'hr-manager' || roleSlug === 'hr' ? 'HR Manager' :
                      roleSlug === 'pmo-lead'   || roleSlug === 'pmo' ? 'PMO Lead' :
                      roleSlug === 'intern'     ? 'Intern' :
                      roleSlug === 'employee'   ? 'Employee' :
                      user?.role?.name          || 'User';

  return (
    <header className={`fixed top-0 right-0 ${sidebarCollapsed ? 'left-20' : 'left-[260px]'} h-16 flex justify-between items-center px-6 lg:px-8 z-40 bg-[#1E293B] text-white shadow-sm font-sans text-[13px] transition-all duration-300`}>
      
      {/* Left side: Logo & Title (Enterprise Style) */}
      <div className="flex items-center gap-4">
        <img src="/assets/logo.png" alt="OWMS Logo" className="h-6 w-auto brightness-0 invert" />
        <span className="font-semibold tracking-wide text-[14px]">Office Workspace Management System</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        
        {/* Notifications bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifToggle}
            className="relative flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-[#1E293B]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded shadow-lg border border-slate-200 z-50 overflow-hidden text-slate-800">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="font-semibold text-[13px] text-slate-900 flex items-center gap-2">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[12px] font-medium text-blue-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <p className="text-[13px] text-slate-500">No recent notifications.</p>
                  </div>
                ) : (
                  announcements.slice(0, 10).map(ann => {
                    const isUnread = !readIds.includes(ann._id);
                    return (
                      <button
                        key={ann._id}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 ${isUnread ? 'bg-blue-50/30' : ''}`}
                        onClick={() => setReadIds(prev => prev.includes(ann._id) ? prev : [...prev, ann._id])}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className={`text-[13px] ${isUnread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{ann.title}</p>
                            <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{ann.content}</p>
                            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                              {format(new Date(ann.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* Profile */}
        <div className="relative" ref={popupRef}>
          <button
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-1.5 pr-3 rounded transition-colors"
            onClick={handleProfileToggle}
          >
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-medium text-[12px] overflow-hidden">
              {user?.profileImage || user?.avatar ? (
                <img src={user.profileImage || user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-medium text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-400 font-medium">{displayRole}</p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
          </button>

          {/* Profile popup */}
          {profileOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded shadow-lg border border-slate-200 z-50 overflow-hidden py-1 text-slate-800">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="font-semibold text-[13px] text-slate-900 truncate">{user?.name}</p>
                <p className="text-[12px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-100 text-[13px] transition-colors"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 text-[13px] transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
