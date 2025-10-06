import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (adminId: string, password: string) => boolean;
  adminLogout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin credentials (in a real app, this would be handled by backend)
const ADMIN_CREDENTIALS = {
  adminId: 'admin001',
  password: 'FoodExpress2024!'
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession === 'authenticated') {
      setIsAdminAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const adminLogin = (adminId: string, password: string): boolean => {
    if (adminId === ADMIN_CREDENTIALS.adminId && password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('adminSession', 'authenticated');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminSession');
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      isLoading
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