import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdminAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};