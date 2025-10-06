
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Bell, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { getCartItemCount } = useCart();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/categories', label: 'Categories' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-amber-50 border-b border-amber-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-white p-2 rounded-full">
              <img 
                src="/lovable-uploads/e2e90cd1-c441-4c83-8942-b9e9a847360c.png" 
                alt="Food Express" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-amber-800">Food Express</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-amber-700 hover:text-amber-900 transition-colors ${
                  location.pathname === item.path ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Orders */}
            <Link to="/orders">
              <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                <Package className="h-5 w-5" />
              </Button>
            </Link>

            {/* Notifications */}
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                <ShoppingCart className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </Link>

            {/* User */}
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-amber-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-amber-200 pt-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-amber-700 hover:text-amber-900 py-2 px-4 rounded transition-colors ${
                    location.pathname === item.path ? 'bg-amber-100 font-semibold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-amber-200 pt-2 mt-2">
                <Link
                  to="/orders"
                  className="text-amber-700 hover:text-amber-900 py-2 px-4 rounded transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
