import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock } from 'lucide-react';

const AdminLoginPage = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, isAdminAuthenticated } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = adminLogin(adminId, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin ID or password. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Access</CardTitle>
          <p className="text-gray-600">Food Express Admin Panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter your admin ID"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">Demo Credentials:</p>
            <p className="text-sm text-amber-700">Admin ID: admin001</p>
            <p className="text-sm text-amber-700">Password: FoodExpress2024!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;