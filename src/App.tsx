import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import Games from '@/pages/Games';
import GameDetail from '@/pages/GameDetail';
import LaunchOptions from '@/pages/LaunchOptions';
import PaymentSelection from '@/pages/PaymentSelection';
import Session from '@/pages/Session';
import Admin from '@/pages/Admin';
import MachineAdmin from '@/pages/MachineAdmin';
import SuperAdmin from '@/pages/SuperAdmin';
import NotFound from '@/pages/NotFound';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'machine_admin' | 'super_admin';
}

function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireRole) {
    const userRole = user?.app_metadata?.role;
    if (userRole !== requireRole) {
      return <Navigate to="/not-found" replace />;
    }
  }

  return <>{children}</>;
}

function App() {
  const { user, loading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if user needs setup
  if (user && needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to admin if user is fully set up and tries to access onboarding
  if (user && !needsOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <Games />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId"
          element={
            <ProtectedRoute>
              <GameDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/launch-options"
          element={
            <ProtectedRoute>
              <LaunchOptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session"
          element={
            <ProtectedRoute>
              <Session />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="machine_admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/machine-admin"
          element={
            <ProtectedRoute requireRole="machine_admin">
              <MachineAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute requireRole="super_admin">
              <SuperAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function AppContent() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default AppWrapper;
