
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import PaymentSelection from "./pages/PaymentSelection";
import Session from "./pages/Session";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import MachineAdmin from "./pages/MachineAdmin";
import LaunchOptions from "./pages/LaunchOptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/launch-options" element={<LaunchOptions />} />
            <Route path="/payment-selection" element={<PaymentSelection />} />
            <Route path="/session" element={<Session />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
            <Route path="/machine-admin" element={<MachineAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
