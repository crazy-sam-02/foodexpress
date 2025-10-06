
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { UserProvider } from "@/contexts/UserContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CategoriesPage from "./pages/CategoriesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminSalesPage from "./pages/AdminSalesPage";
import AdminAddProductPage from "./pages/AdminAddProductPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import OrdersPage from "./pages/OrdersPage";
import FAQPage from "./pages/FAQPage";
import SupportPage from "./pages/SupportPage";
import ReturnsPage from "./pages/ReturnsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProductsProvider>
      <AdminProvider>
        <UserProvider>
          <NotificationsProvider>
            <OrdersProvider>
              <CartProvider>
                <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<><CartPage /></>} />
          <Route path="/checkout" element={<><CheckoutPage /></>} />
          <Route path="/order-success" element={<><OrderSuccessPage /></>} />
          <Route path="/orders" element={<><OrdersPage /></>} />
          <Route path="/notifications" element={<><NotificationsPage /></>} />
          <Route path="/profile" element={<><ProfilePage /></>} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/sales" element={<AdminRoute><AdminSalesPage /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
          <Route path="/admin/add-product" element={<AdminRoute><AdminAddProductPage /></AdminRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </OrdersProvider>
          </NotificationsProvider>
        </UserProvider>
      </AdminProvider>
    </ProductsProvider>
  </QueryClientProvider>
);

export default App;
