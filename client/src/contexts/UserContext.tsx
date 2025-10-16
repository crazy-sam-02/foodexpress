import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';

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
  loginWithFirebaseIdToken: (idToken: string, name: string | null, email: string | null) => Promise<boolean>;
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

  const loginWithFirebaseIdToken = useCallback(async (idToken: string, name: string | null, email: string | null): Promise<boolean> => {
    try {
      console.log('🔑 Exchanging Firebase token for backend JWT:', email);
      const response = await fetch(`${config.API_URL}/auth/firebase-login`, {
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
        console.log('✅ Successfully logged in:', data.user.email);
        toast.success('Signed in successfully');
        return true;
      } else {
        console.error('❌ Backend login failed:', data.message);
        toast.error(data.message || 'Sign-in failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Firebase token exchange error:', error);
      toast.error('An error occurred during sign-in');
      return false;
    }
  }, []);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      
      if (firebaseUser) {
        // User is signed in. See if we have a token.
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // If we have a token, assume the user is authenticated.
          // You might want to add a token verification step here.
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);
            setIsAuthenticated(true);
            console.log('✅ Restored auth from localStorage:', userData.email);
          } catch (e) {
            // If stored data is bad, clear it and get a fresh token.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const idToken = await firebaseUser.getIdToken();
            await loginWithFirebaseIdToken(idToken, firebaseUser.displayName, firebaseUser.email);
          }
        } else {
          // If no token, this is a fresh login or a refresh without a persisted session.
          // Get the token and log in with the backend.
          console.log('🔄 No stored data, getting fresh token from Firebase');
          try {
            const idToken = await firebaseUser.getIdToken();
            await loginWithFirebaseIdToken(idToken, firebaseUser.displayName, firebaseUser.email);
          } catch (error) {
            console.error('❌ Error getting fresh token:', error);
            // If token exchange fails, clear everything
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        // User is signed out.
        console.log('🚪 No Firebase user, clearing auth state');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loginWithFirebaseIdToken]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Sign in with Firebase first
      const result = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const idToken = await result.user.getIdToken();
      // Exchange token with backend (reuse Google endpoint)
      return await loginWithFirebaseIdToken(idToken, result.user.displayName, result.user.email);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  }, [loginWithFirebaseIdToken]);

  // Backward-compatible alias
  const loginWithGoogle = useCallback((idToken: string, name: string | null, email: string | null) => 
    loginWithFirebaseIdToken(idToken, name, email), [loginWithFirebaseIdToken]);

  const logout = async (): Promise<void> => {
    try {
      try { await signOut(auth); } catch {}
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
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Create account in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
      if (name && cred.user && !cred.user.displayName) {
        try { await updateProfile(cred.user, { displayName: name }); } catch {}
      }
      // Send email verification with continue URL back to login
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
        } as const;
        await sendEmailVerification(cred.user, actionCodeSettings);
        toast.success('Verification email sent. Please verify your email to continue.');
      } catch (e) {
        console.warn('sendEmailVerification failed:', e);
      }
      // Do NOT auto-login before verification. Sign out and redirect user to login.
      try { await signOut(auth); } catch {}
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error?.code === 'auth/email-already-in-use') {
        toast.error('Email is already in use');
      } else {
        toast.error('An error occurred during registration');
      }
      return false;
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    token,
    login,
    loginWithGoogle,
    loginWithFirebaseIdToken,
    logout,
    register,
    isLoading
  }), [user, isAuthenticated, token, login, loginWithGoogle, loginWithFirebaseIdToken, logout, register, isLoading]);

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
