
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RefreshProvider } from "@/contexts/RefreshContext";
import Index from "./pages/Index";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Session from "./pages/Session";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import MachineAdmin from "./pages/MachineAdmin";
import Auth from "./pages/Auth";
import PaymentSelection from "./pages/PaymentSelection";
import LaunchOptions from "./pages/LaunchOptions";
import Onboarding from "./pages/Onboarding";
import UserSetup from "./pages/UserSetup";
import AdminSetup from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <RefreshProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/:id" element={<GameDetail />} />
                <Route path="/session/:sessionId" element={<Session />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
                <Route path="/machine-admin" element={<MachineAdmin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/payment/:gameId" element={<PaymentSelection />} />
                <Route path="/launch-options/:gameId" element={<LaunchOptions />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/user-setup" element={<UserSetup />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RefreshProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
