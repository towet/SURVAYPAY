import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with required environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    set({ isAuthenticated: true, user: data.user });
  },
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    set({ isAuthenticated: true, user: data.user });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null });
  },
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;
    set({ isAuthenticated, user: session?.user || null });
    return isAuthenticated;
  },
}));