import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Meetings from "@/pages/Meetings";
import Pipelines from "@/pages/Pipelines";
import Delivered from "@/pages/Delivered";
import UserManagement from "@/pages/UserManagement";
import KPIAssignments from "@/pages/KPIAssignments";
import KAMRankings from "@/pages/KAMRankings";
import KAMProfile from "@/pages/KAMProfile";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <ProtectedRoute>
                  <Meetings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pipelines"
              element={
                <ProtectedRoute>
                  <Pipelines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivered"
              element={
                <ProtectedRoute>
                  <Delivered />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kpi-assignments"
              element={
                <ProtectedRoute>
                  <KPIAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kam-rankings"
              element={
                <ProtectedRoute>
                  <KAMRankings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kam-profile/:kamUserId"
              element={
                <ProtectedRoute>
                  <KAMProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
