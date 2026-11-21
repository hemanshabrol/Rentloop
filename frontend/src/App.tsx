// ============================================================================
// FILE: App.tsx
// Purpose: Top-level application router mapping URLs to page components.
//          Protects dashboard and listing creation routes using Supabase Auth.
// ============================================================================

import { ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import ListItem from './ListItem';
import Login from './Login';
import Marketplace from './Marketplace';
import OwnerDashboard from './OwnerDashboard';
import ProductDetails from './ProductDetails';
import Signup from './Signup';
import { useAuthSession } from './supabaseClient';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { session, isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant font-body-md">
        Checking session...
      </div>
    );
  }

  return session ? children : <Navigate to={`/login?redirect=${location.pathname}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/listings/new" element={<ProtectedRoute><ListItem /></ProtectedRoute>} />
      <Route path="/list-item" element={<ProtectedRoute><ListItem /></ProtectedRoute>} />
      <Route path="/dashboard/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/*" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
