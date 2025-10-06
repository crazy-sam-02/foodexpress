import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Simplified Header with just logo */}
      <header className="py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center justify-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all"></div>
              <img 
                src="/lovable-uploads/e2e90cd1-c441-4c83-8942-b9e9a847360c.png" 
                alt="Food Express" 
                className="w-16 h-16 object-contain relative z-10 group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent group-hover:from-amber-700 group-hover:to-orange-700 transition-all">
              Food Express
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="py-6 text-center text-sm text-amber-700">
        <p>&copy; {new Date().getFullYear()} Food Express. All rights reserved.</p>
      </footer>
    </div>
  );
};
