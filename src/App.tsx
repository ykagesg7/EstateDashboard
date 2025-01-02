import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Finances from "./pages/Finances";
import Settings from "./pages/Settings";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import RequireAuth from "./components/auth/RequireAuth"; // RequireAuth をインポート

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>
            <Route
              path="/properties"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Properties />} />
              <Route path=":id" element={<PropertyDetails />} />
            </Route>
            <Route
              path="/finances"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Finances />} />
            </Route>
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;