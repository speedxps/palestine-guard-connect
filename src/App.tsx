import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessDenied from "@/components/AccessDenied";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Tasks from "./pages/Tasks";
import Chat from "./pages/Chat";
import NewIncident from "./pages/NewIncident";
import Profile from "./pages/Profile";
import Cybercrime from "./pages/Cybercrime";
import CybercrimeReports from "./pages/CybercrimeReports";
import CybercrimeAccessManagement from "./components/CybercrimeAccessManagement";
import Feed from "./pages/Feed";
import Patrol from "./pages/Patrol";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/incidents" element={
                  <ProtectedRoute requiredRole="officer">
                    <Incidents />
                  </ProtectedRoute>
                } />
                <Route path="/tasks" element={
                  <ProtectedRoute requiredRole="officer">
                    <Tasks />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute requiredRole="officer">
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/new-incident" element={
                  <ProtectedRoute requiredRole="officer">
                    <NewIncident />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/cybercrime" element={
                  <ProtectedRoute requiredRole="admin">
                    <Cybercrime />
                  </ProtectedRoute>
                } />
                <Route path="/cybercrime-reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <CybercrimeReports />
                  </ProtectedRoute>
                } />
                <Route path="/cybercrime-access" element={
                  <ProtectedRoute requiredRole="admin">
                    <CybercrimeAccessManagement />
                  </ProtectedRoute>
                } />
                <Route path="/feed" element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                } />
                <Route path="/patrol" element={
                  <ProtectedRoute requiredRole="officer">
                    <Patrol />
                  </ProtectedRoute>
                } />
                <Route path="/access-denied" element={<AccessDenied />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
};

export default App;
