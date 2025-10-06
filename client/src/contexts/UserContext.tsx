import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string, name: string | null, email: string | null) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
        // Clear corrupted storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in successfully');
        return true;
      } else {
        toast.error(data.message || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const loginWithGoogle = async (idToken: string, name: string | null, email: string | null): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken,
          name,
          email: email?.toLowerCase()
        }),
      });
      const data = await response.json();

      if (response.ok && data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in with Google successfully');
        return true;
      } else {
        toast.error(data.message || 'Google login failed');
        return false;
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('An error occurred during Google login');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // No backend call is strictly necessary for token-based auth logout,
      // but you could have an endpoint to invalidate refresh tokens if you implement them.
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
      toast.error('Error during logout');
    }
  };  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Registered successfully');
        return true;
      } else {
        toast.error(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    token,
    login,
    loginWithGoogle,
    logout,
    register,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
