import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "@/components/auth/RequireAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import Dashboard from "@/pages/Dashboard";
import Finances from "@/pages/Finances";
import Profile from "@/pages/Profile";
import { AcceptInvitation } from "@/pages/AcceptInvitation";

function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/accept-invitation/:id" element={<AcceptInvitation />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="finances" element={<Finances />} />
          <Route path="settings" element={<Navigate to="/profile" replace />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;