import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './features/landing';
import { LoginPage, ProtectedRoute } from './features/login';
import { DashboardRouter } from './features/dashboard/components/DashboardRouter';
import FlightsFeature from './features/flights';
import { ProvidersFeature } from './features/providers';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isAuthenticated, checkAuth } = useAuth();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard/:role" element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } />
        
        <Route path="/flights" element={
          <ProtectedRoute>
            <FlightsFeature />
          </ProtectedRoute>
        } />
        
        <Route path="/providers" element={
          <ProtectedRoute>
            <ProvidersFeature />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;