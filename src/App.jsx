import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Layout from '@/components/layout';
import Login from '@/pages/login';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

import ProtectedRoute from '@/components/ProtectedRoute';
import RouteConfig from '@/config/RouteConfig';
import JoinRouteWrapper from '@/components/JoinRouteWrapper';

function App() {
  const { 
    session, 
    userProfile, 
    loadingAuth, 
    handleLogin, 
    handleLogout, 
    updateUserProfileState 
  } = useAuth();
  const { toast } = useToast();

  // console.log("App.jsx: loadingAuth:", loadingAuth, "session:", session, "userProfile:", userProfile ? userProfile.name : 'null');


  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl">Loading Hublie...</div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              session ? 
                <Navigate to="/" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
           <Route 
            path="/join/:joinCode"
            element={<JoinRouteWrapper onLogin={handleLogin} />}
          />
          {RouteConfig.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute
                  isAuthenticated={!!session}
                  user={userProfile} 
                  allowedRoles={route.allowedRoles}
                  toast={toast}
                >
                  <Layout onLogout={handleLogout} user={userProfile} updateUser={updateUserProfileState}>
                    <route.element currentUser={userProfile} updateUser={updateUserProfileState} onLogout={handleLogout} />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}
          <Route 
            path="*" 
            element={
              session ? 
                <Navigate to="/" replace />
                : <Navigate to="/login" replace />
            } 
          />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;