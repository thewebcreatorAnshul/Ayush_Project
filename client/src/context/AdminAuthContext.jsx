import React, { createContext, useContext, useState, useEffect } from 'react';
import AdminAPI from '../services/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate admin token on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await AdminAPI.get('/auth/me');
        if (res.data.success && res.data.data.admin.role === 'admin') {
          setAdminUser(res.data.data.admin);
          localStorage.setItem('admin_user', JSON.stringify(res.data.data.admin));
        } else {
          adminLogout();
        }
      } catch (err) {
        console.warn('Admin token validation failed:', err.message);
        adminLogout();
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  const adminLogin = async (email, password) => {
    const res = await AdminAPI.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, admin } = res.data.data;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(admin));
      setAdminToken(token);
      setAdminUser(admin);
      return admin;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminToken(null);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminAuthenticated: !!adminToken && adminUser?.role === 'admin',
        loading,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
