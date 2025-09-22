import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import supabase from "../utils/supabaseClient";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [hrProfile, setHrProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureHRUser = useCallback(async (user) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("hr_users")
        .upsert(
          { id: user.id, name: user.user_metadata?.full_name ?? user.email },
          { onConflict: "id" }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Failed to upsert hr_user:", err);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (user) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("hr_users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Profile fetch error:", error.message);
        return null;
      }
      setHrProfile(data);
      return data;
    } catch (err) {
      console.error("Unexpected profile fetch error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          ensureHRUser(session.user);
          fetchProfile(session.user);
        } else {
          setHrProfile(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setUser(null);
        setHrProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        ensureHRUser(session.user);
        fetchProfile(session.user);
      } else {
        setHrProfile(null);
      }

      setLoading(false); 
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [ensureHRUser, fetchProfile]);

  const signInWithPassword = async ({ email, password }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }

    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);
    if (data.session?.user) {
      ensureHRUser(data.session.user);
      fetchProfile(data.session.user);
    }

    setLoading(false);
    return data;
  };

  const signInWithMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setHrProfile(null);
      setLoading(false);
    }
  };

  const createUser = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    if (data?.user) {
      ensureHRUser(data.user);
      setHrProfile({ id: data.user.id, name: fullName ?? data.user.email, created_at: new Date().toISOString() });
    }

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        hrProfile,
        loading,
        signInWithPassword,
        signInWithMagicLink,
        signOut,
        createUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
