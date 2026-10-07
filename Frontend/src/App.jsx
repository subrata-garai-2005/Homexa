import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HostDashboard from './pages/host/HostDashboard';
import PropertyForm from './pages/host/PropertyForm';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AskHomexa from './components/ai/AskHomexa';
import MobileBottomNav from './components/common/MobileBottomNav';
import Toaster from './components/common/Toaster';
import CommandPalette from './components/common/CommandPalette';
import NotFound from './components/NotFound';
import { useEffect } from 'react';

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
        <Route path="/host/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
        <Route path="/host/edit/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
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
