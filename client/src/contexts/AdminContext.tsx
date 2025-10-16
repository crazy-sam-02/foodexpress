import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import config from '@/lib/config';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  isLoading: boolean;
  lastError: string | null;
  checkAdminSession: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  // Clear error after a delay
  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(() => setLastError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  // Check admin session function
  const checkAdminSession = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setLastError(null);
      const res = await fetch(`${config.API_URL}/auth/admin/session/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      
      if (res.ok && json?.success && json?.data?.user) {
        // Validate admin user object
        const user = json.data.user;
        if (user.isAdmin === true) {
          setIsAdminAuthenticated(true);
          setAdminUser(user);
          console.log('✅ Admin session validated:', user.email);
        } else {
          throw new Error('User does not have admin privileges');
        }
      } else {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
        if (res.status === 401) {
          console.log('ℹ️ No admin session found');
        } else {
          throw new Error(json?.message || 'Session validation failed');
        }
      }
    } catch (err) {
      console.error('❌ Admin session check error:', err);
      setLastError(err instanceof Error ? err.message : 'Session check failed');
      setIsAdminAuthenticated(false);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load session status on mount
  useEffect(() => {
    checkAdminSession();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setLastError(null);
      const res = await fetch(`${config.API_URL}/auth/admin/session/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        // Validate admin user
        const user = json.data.user;
        if (user.isAdmin === true) {
          setIsAdminAuthenticated(true);
          setAdminUser(user);
          toast.success('Admin logged in successfully');
          console.log('✅ Admin login successful:', user.email);
          return true;
        } else {
          throw new Error('User does not have admin privileges');
        }
      }
      const errorMsg = json?.message || 'Login failed';
      setLastError(errorMsg);
      toast.error(errorMsg);
      return false;
    } catch (err) {
      console.error('❌ Admin login error:', err);
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during login';
      setLastError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      await fetch(`${config.API_URL}/auth/admin/session/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('❌ Admin logout error:', err);
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      setLastError(null);
      toast.success('Admin logged out');
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminUser,
      adminToken: null,
      adminLogin,
      adminLogout,
      isLoading,
      lastError,
      checkAdminSession
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};