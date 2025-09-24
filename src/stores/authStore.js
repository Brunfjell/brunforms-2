import { create } from "zustand";
import supabase from "../utils/supabaseClient";

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  hrProfile: null,
  loading: true,

  initAuth: async () => {
    set({ loading: true });

    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });

    if (session?.user) {
      await get().fetchProfile(session.user.id);
    }

    set({ loading: false });

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      set({ session: newSession, user: newSession?.user ?? null });

      if (newSession?.user) {
        await get().fetchProfile(newSession.user.id);
      } else {
        set({ hrProfile: null });
      }
    });
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("hr_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("No profile found:", error.message);
        set({ hrProfile: null });
        return null;
      }

      set({ hrProfile: data });
      return data;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  },

  ensureHRUser: async (user) => {
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
      set({ hrProfile: data });
      return data;
    } catch (err) {
      console.error("Failed to upsert hr_user:", err);
      return null;
    }
  },

  signInWithPassword: async ({ email, password }) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      throw error;
    }
    if (data.session?.user) {
      await get().fetchProfile(data.session.user.id);
    }
    set({ loading: false });
    return data;
  },

  signInWithMagicLink: async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      set({ user: null, session: null, hrProfile: null });
    }
  },

  createUser: async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    if (data?.user) {
      await get().ensureHRUser(data.user);
    }

    return data;
  },
}));
