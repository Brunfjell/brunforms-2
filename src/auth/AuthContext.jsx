import React, { createContext, useContext } from "react";
import { useAuthStore } from "../stores/authStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthStore(); // grab everything from Zustand
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
