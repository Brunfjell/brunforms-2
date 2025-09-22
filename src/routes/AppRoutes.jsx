import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import Login from "../pages/Login";
import HRDashboard from "../pages/HRDashboard";
import FormEditor from "../pages/FormEditor";
import FormViewer from "../pages/FormViewer";
import ApplicantStatus from "../pages/ApplicantStatus";
import CreateHRUserForm from "../auth/CreateUserForm";

import HRTeam from "../pages/HRTeam";
import Applicants from "../pages/Applicants";
import Mail from "../pages/Mail";
import Templates from "../pages/Templates";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 min-h-[93.5vh]">{children}</main>
      <Footer />
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/forms" replace />;

  return children;
}

function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return <Navigate to={user ? "/forms" : "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route path="/public/forms/:id" element={<FormViewer />} />
      <Route path="/status" element={<ApplicantStatus />} />
      <Route path="/create-user" element={<CreateHRUserForm />} />

      <Route
        path="/forms"
        element={
          <ProtectedRoute>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forms/new"
        element={
          <ProtectedRoute>
            <FormEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forms/:id/edit"
        element={
          <ProtectedRoute>
            <FormEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-team"
        element={
          <ProtectedRoute>
            <HRTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicants"
        element={
          <ProtectedRoute>
            <Applicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mail"
        element={
          <ProtectedRoute>
            <Mail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<AuthRedirect />} />
    </Routes>
  );
}
