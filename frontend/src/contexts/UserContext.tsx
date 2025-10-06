import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<boolean>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (session check)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include", // ⚠️ Important: Include cookies
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const emailTrimmed = email.trim().toLowerCase();
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ⚠️ Important: Include cookies for session
        body: JSON.stringify({ email: emailTrimmed, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        return true;
      } else {
        console.error("Login error:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", // ⚠️ Important: Include cookies
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear user on frontend even if request fails
      setUser(null);
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string
  ): Promise<boolean> => {
    try {
      const emailTrimmed = email.trim().toLowerCase();
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ⚠️ Important: Include cookies for session
        body: JSON.stringify({ name, email: emailTrimmed, password, phone, address }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        return true;
      } else {
        console.error("Registration error:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook for consuming context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};