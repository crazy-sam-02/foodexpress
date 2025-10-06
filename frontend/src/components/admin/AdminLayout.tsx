import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Plus, 
  LogOut, 
  Shield,
  FolderOpen,
  ShoppingCart,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { adminLogout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/sales', label: 'Sales Overview', icon: BarChart3 },
    { path: '/admin/notifications', label: 'Send Notifications', icon: Bell },
    { path: '/admin/add-product', label: 'Add New Product', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Food Express</h1>
                <p className="text-sm text-gray-600">Admin Panel</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-amber-100 text-amber-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};