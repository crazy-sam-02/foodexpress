import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { toast } from 'sonner';
import { User, Mail, LogOut, ShoppingBag } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Login successful! Welcome back!');
        navigate('/');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Server error. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Get the ID token from Firebase
      const idToken = await firebaseUser.getIdToken();

      // Send the user data to your backend for verification/registration
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idToken,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }),
      });

      const data = await response.json();
      setIsGoogleLoading(false);

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Login with Google successful! Welcome!');
        navigate('/');
      } else {
        toast.error(data.message || 'Google login failed');
        // Sign out from Firebase if backend login fails
        await auth.signOut();
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setIsGoogleLoading(false);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups for this site.');
      } else {
        toast.error('Google login failed. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Logout from backend
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Also sign out from Firebase
      await auth.signOut();

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        setEmail('');
        setPassword('');
        toast.success('Logged out successfully');
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  if (checkingAuth) {
    return (
      <AuthLayout>
        <div className="w-full max-w-6xl px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isAuthenticated && user) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <User className="h-6 w-6" />
                My Profile
              </CardTitle>
              <CardDescription className="text-center">
                Welcome back, {user.name}!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-600">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg">👤</span>
                  <div>
                    <p className="font-medium text-gray-900">ID: {user.id}</p>
                    <p className="text-sm text-gray-600">User ID</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                  <Link to="/products" className="flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">View Full Profile</Link>
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Signing in with Google...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </div>
              )}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;