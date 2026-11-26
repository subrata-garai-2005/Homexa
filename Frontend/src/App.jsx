import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { lazy, Suspense, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import AskHomexa from './components/ai/AskHomexa';
import MobileBottomNav from './components/common/MobileBottomNav';
import Toaster from './components/common/Toaster';
import CommandPalette from './components/common/CommandPalette';

const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const HostDashboard = lazy(() => import('./pages/host/HostDashboard'));
const PropertyForm = lazy(() => import('./pages/host/PropertyForm'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const MapView = lazy(() => import('./pages/MapView'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./components/NotFound'));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// Animated page wrapper: re-mounts on route change for a soft fade/slide, and scrolls to top
const AnimatedRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main key={location.pathname} className="flex-1 animate-fade-in">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/trip-planner" element={<Navigate to="/" replace />} />

          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/host" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
          <Route path="/host/bookings" element={<Navigate to="/host" replace />} />
          <Route path="/host/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
          <Route path="/host/edit/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pb-16 md:pb-0">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
        <AskHomexa />
        <MobileBottomNav />
        <Toaster />
        <CommandPalette />
      </div>
    </Router>
  );
}

export default App;
