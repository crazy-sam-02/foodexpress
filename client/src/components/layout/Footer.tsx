
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-amber-900 text-amber-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-600 text-white p-2 rounded-full">
                <img 
                  src="/lovable-uploads/e2e90cd1-c441-4c83-8942-b9e9a847360c.png" 
                  alt="Food Express" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold">Food Express</span>
            </div>
            <p className="text-amber-200">
              Fresh food delivered fast to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/products" className="block text-amber-200 hover:text-white transition-colors">
                All Products
              </Link>
              <Link to="/categories" className="block text-amber-200 hover:text-white transition-colors">
                Categories
              </Link>
              <Link to="/about" className="block text-amber-200 hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-amber-200 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link to="/orders" className="block text-amber-200 hover:text-white transition-colors">
                Track Order
              </Link>
              <Link to="/returns" className="block text-amber-200 hover:text-white transition-colors">
                Returns
              </Link>
              <Link to="/faq" className="block text-amber-200 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link to="/support" className="block text-amber-200 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2 text-amber-200">
              <p>📍 123 Bakery Street, Sweet City, SC 12345</p>
              <p>📞 (555) 123-CAKE</p>
              <p>✉️ hello@sweettreats.com</p>
              <p>🕒 Mon-Sat: 6AM-8PM, Sun: 7AM-6PM</p>
              <Link to="/admin/login" className="block text-xs text-amber-300 hover:text-white transition-colors opacity-70 mt-4">
                Admin Access
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-8 text-center text-amber-200">
          <p>&copy; 2025 Food Express. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
