import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdminAuthenticated, isLoading, adminUser } = useAdmin();
  const location = useLocation();

  // Log admin access attempts for security
  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      console.warn('🚨 Unauthorized admin access attempt:', location.pathname);
    }
  }, [isLoading, isAdminAuthenticated, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying Admin Access</h2>
          </div>
          <p className="text-gray-600">Please wait while we authenticate your session...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Access Denied</h2>
          </div>
          <p className="text-red-700 mb-6">
            You need administrator privileges to access this area.
          </p>
          <p className="text-sm text-red-600 mb-4">
            Redirecting to admin login...
          </p>
        </div>
        <Navigate to="/admin/login" replace state={{ from: location }} />
      </div>
    );
  }

  // Additional security check: verify admin user object
  if (!adminUser || !adminUser.isAdmin) {
    console.error('🚨 Invalid admin user session detected');
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};