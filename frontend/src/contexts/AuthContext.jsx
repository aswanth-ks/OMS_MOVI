import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('owms_token'));
  const [loading, setLoading] = useState(true);

  // Permission check helper — used across the app
  // permName format matches backend: resource.toLowerCase().replace(spaces, '_') + '.' + action
  const hasPermission = useCallback((resource, action) => {
    if (!user?.role?.permissions) return false;
    if (user.role.slug === 'super-admin') return true;
    const permName = `${resource.toLowerCase().replace(/\s+/g, '_')}.${action}`;
    return user.role.permissions.some(
      (p) => p.name === permName && p.status === 'Active'
    );
  }, [user]);

  const login = useCallback(async (identifier, password) => {
    const response = await authAPI.login({ identifier, password });
    const { token: newToken, refreshToken, user: userData } = response.data.data;

    localStorage.setItem('owms_token', newToken);
    if (refreshToken) localStorage.setItem('owms_refresh_token', refreshToken);
    localStorage.setItem('owms_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('owms_token');
    localStorage.removeItem('owms_refresh_token');
    localStorage.removeItem('owms_user');
    // Legacy keys cleanup
    localStorage.removeItem('owms_mock_user');
    setToken(null);
    setUser(null);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restore = () => {
      const storedToken = localStorage.getItem('owms_token');
      const storedUser  = localStorage.getItem('owms_user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };
    restore();

    // Listen for 401 events dispatched by the axios interceptor
    const handle401 = () => logout();
    window.addEventListener('owms:unauthorized', handle401);
    return () => window.removeEventListener('owms:unauthorized', handle401);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Silently refresh permissions every 5 min + on window focus
  // so Access Matrix changes reflect without requiring logout
  useEffect(() => {
    if (!user?._id) return;
    const refreshPermissions = async () => {
      try {
        const res = await api.get('/auth/me');
        const freshUser = res.data.data;
        setUser(freshUser);
        localStorage.setItem('owms_user', JSON.stringify(freshUser));
      } catch {
        // Token invalid — 401 listener handles logout
      }
    };
    const interval = setInterval(refreshPermissions, 5 * 60 * 1000);
    window.addEventListener('focus', refreshPermissions);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshPermissions);
    };
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
