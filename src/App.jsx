import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { useAuthStore } from "./stores/authStore";
import AppRoutes from "./routes/AppRoutes";
import Toasts from "./components/Toast";

function AppWrapper() {
  const { resetAuth } = useAuth();

//  useEffect(() => {
//    resetAuth();
//  }, [resetAuth]);

  return <AppRoutes />;
}

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWrapper />
        <Toasts />
      </AuthProvider>
    </BrowserRouter>
  );
}
