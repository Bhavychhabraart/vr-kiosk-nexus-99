
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import PaymentSelection from './pages/PaymentSelection';
import LaunchOptions from './pages/LaunchOptions';
import Session from './pages/Session';
import Admin from './pages/Admin';
import MachineAdmin from './pages/MachineAdmin';
import SuperAdmin from './pages/SuperAdmin';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import UserSetup from "@/pages/UserSetup";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/games" element={<Games />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/payment-selection" element={<PaymentSelection />} />
            <Route path="/launch-options" element={<LaunchOptions />} />
            <Route path="/session" element={<Session />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/machine-admin" element={<MachineAdmin />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/user-setup" element={<UserSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
