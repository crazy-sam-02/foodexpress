
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from 'react';
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { UserProvider } from "@/contexts/UserContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { AdminRoute } from "@/components/admin/AdminRoute";
const Index = lazy(() => import('./pages/Index'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CheckEmailPage = lazy(() => import('./pages/CheckEmailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminSalesPage = lazy(() => import('./pages/AdminSalesPage'));
const AdminAddProductPage = lazy(() => import('./pages/AdminAddProductPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
import { AdminOrdersProvider } from "@/contexts/AdminOrdersContext";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import OrdersPage from "./pages/OrdersPage";
import FAQPage from "./pages/FAQPage";
import SupportPage from "./pages/SupportPage";
import ReturnsPage from "./pages/ReturnsPage";
import MedicinePage from "./pages/MedicinePage";

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
        <Suspense fallback={<div className="w-full py-8 text-center text-gray-500">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/cart" element={<><CartPage /></>} />
          <Route path="/checkout" element={<><CheckoutPage /></>} />
          <Route path="/order-success" element={<><OrderSuccessPage /></>} />
          <Route path="/orders" element={<><OrdersPage /></>} />
          <Route path="/notifications" element={<><NotificationsPage /></>} />
          <Route path="/profile" element={<><ProfilePage /></>} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/medicine" element={<MedicinePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminOrdersProvider><AdminDashboard /></AdminOrdersProvider></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminOrdersProvider><AdminProductsPage /></AdminOrdersProvider></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminOrdersProvider><AdminCategoriesPage /></AdminOrdersProvider></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrdersProvider><AdminOrdersPage /></AdminOrdersProvider></AdminRoute>} />
          <Route path="/admin/sales" element={<AdminRoute><AdminOrdersProvider><AdminSalesPage /></AdminOrdersProvider></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminOrdersProvider><AdminNotificationsPage /></AdminOrdersProvider></AdminRoute>} />
          <Route path="/admin/add-product" element={<AdminRoute><AdminOrdersProvider><AdminAddProductPage /></AdminOrdersProvider></AdminRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
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
