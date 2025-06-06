
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Page imports
import Index from "./pages/Index";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import LaunchOptions from "./pages/LaunchOptions";
import PaymentSelection from "./pages/PaymentSelection";
import Session from "./pages/Session";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import MachineAdmin from "./pages/MachineAdmin";
import SetupWizardPage from "./pages/SetupWizard";
import AuthPage from "./components/auth/AuthPage";
import AdminSignupPage from "./pages/AdminSignup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin-signup" element={<AdminSignupPage />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/launch-options/:gameId" element={<LaunchOptions />} />
              <Route path="/payment/:gameId" element={<PaymentSelection />} />
              <Route path="/session/:sessionId" element={<Session />} />

              {/* Protected admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/super-admin" 
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdmin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/machine-admin" 
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'admin', 'machine_admin']}>
                    <MachineAdmin />
                  </ProtectedRoute>
                } 
              />

              {/* Protected setup route */}
              <Route 
                path="/setup" 
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'admin', 'setup_user']}>
                    <SetupWizardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
