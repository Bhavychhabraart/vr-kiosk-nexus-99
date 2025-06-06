
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SimplifiedAuthProvider } from "@/hooks/useSimplifiedAuth";
import { SimplifiedProtectedRoute } from "@/components/auth/SimplifiedProtectedRoute";

// Page imports
import SimplifiedIndex from "./pages/SimplifiedIndex";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import LaunchOptions from "./pages/LaunchOptions";
import PaymentSelection from "./pages/PaymentSelection";
import Session from "./pages/Session";
import SimplifiedSuperAdmin from "./pages/SimplifiedSuperAdmin";
import SimplifiedMachineAdmin from "./pages/SimplifiedMachineAdmin";
import SimplifiedMachineLogin from "./pages/SimplifiedMachineLogin";
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
      <SimplifiedAuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<SimplifiedIndex />} />
              <Route path="/machine-login" element={<SimplifiedMachineLogin />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/launch-options" element={<LaunchOptions />} />
              <Route path="/payment/:gameId" element={<PaymentSelection />} />
              <Route path="/session/:sessionId" element={<Session />} />

              {/* Protected admin routes */}
              <Route 
                path="/super-admin" 
                element={
                  <SimplifiedProtectedRoute requiredRole="super_admin">
                    <SimplifiedSuperAdmin />
                  </SimplifiedProtectedRoute>
                } 
              />
              
              <Route 
                path="/machine-admin" 
                element={<SimplifiedMachineAdmin />} 
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </SimplifiedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
