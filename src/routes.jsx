import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './component/header';
import Footer from './component/footer';
import ScrollToTop from './component/scrool-totop';
import ProtectedRoute from './component/ProtectedRoute';
import AdminRedirect from './component/AdminRedirect';
import '../src/assets/style/public.css';

import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { ProductProvider } from './context/ProductContext';

// Lazy loaded public pages
const Home = lazy(() => import('./pages'));
const About = lazy(() => import('./pages/about'));
const Prodcut = lazy(() => import('./pages/prodcut'));
const Contact = lazy(() => import('./pages/contact'));
const Faq = lazy(() => import('./pages/faq'));
const ProdcutView = lazy(() => import('./pages/prodcut-view'));
const Profile = lazy(() => import('./component/profile'));
const Cart = lazy(() => import('./pages/cart'));
const NotFound = lazy(() => import('./pages/not-found'));
const Checkout = lazy(() => import('./pages/checkout'));

// Lazy loaded admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminDelivery = lazy(() => import('./pages/admin/AdminDelivery'));
const AdminShipped = lazy(() => import('./pages/admin/AdminShipped'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const OrderDetails = lazy(() => import('./pages/admin/OrderDetails'));

// Layout wrapper for public pages
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        {children}
      </Suspense>
      <Footer />
    </>
  );
}

function HomeRoutes() {
  return (
    <AdminProvider>
      <UserProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                <Routes>
                  {/* Admin Routes - No Header/Footer */}
                  <Route path='/admin' element={<AdminRedirect />} />
                  <Route path='/admin/login' element={<AdminLogin />} />
                  <Route path='/admin/dashboard' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path='/admin/products' element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                  <Route path='/admin/orders' element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                  <Route path='/admin/shipped' element={<ProtectedRoute><AdminShipped /></ProtectedRoute>} />
                  <Route path='/admin/orders/:orderId' element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                  <Route path='/admin/delivery' element={<ProtectedRoute><AdminDelivery /></ProtectedRoute>} />
                  <Route path='/admin/contacts' element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
                  <Route path='/admin/profile' element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

                  {/* Public Routes - With Header/Footer */}
                  <Route path='/' element={<PublicLayout><Home /></PublicLayout>} />
                  <Route path='/about' element={<PublicLayout><About /></PublicLayout>} />
                  <Route path='/product' element={<PublicLayout><Prodcut /></PublicLayout>} />
                  <Route path='/product-view/:id' element={<PublicLayout><ProdcutView /></PublicLayout>} />
                  <Route path='/cart' element={<PublicLayout><Cart /></PublicLayout>} />
                  <Route path='/faq' element={<PublicLayout><Faq /></PublicLayout>} />
                  <Route path='/contact' element={<PublicLayout><Contact /></PublicLayout>} />
                  <Route path='/profile' element={<PublicLayout><Profile /></PublicLayout>} />
                  <Route path='/checkout' element={<PublicLayout><Checkout /></PublicLayout>} />
                  <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </UserProvider>
    </AdminProvider>
  )
}

export default HomeRoutes
