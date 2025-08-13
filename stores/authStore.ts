import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useUserStore } from './userStore';
import { AuthResponse, AuthError, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  accountType: 'basic' | 'premium';
  isAccountActivated: boolean;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Methods
  signUp: (email: string, password: string, username: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: {}; error: AuthError | null }>;
  loadUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  
  signUp: async (email: string, password: string, username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
      } else if (response.data.user) {
        set({ 
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false 
        });
        
        // Load user profile after successful signup
        await get().loadUserProfile();
        
        // Import here to avoid circular dependency
        const { useEarningsStore } = require('./earningsStore');
        
        // Reset earnings to ensure new accounts start with 0 balance
        useEarningsStore.getState().resetEarnings();
        
        // Add signup bonus of 250 KES
        useEarningsStore.getState().addBonusEarnings(250, 'Signup bonus - Welcome to SurvayPay!');
      }
      
      return response;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (response.error) {
        set({ error: response.error.message, isLoading: false });
      } else if (response.data.user) {
        set({ 
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false 
        });
        // Load user profile after successful login
        await get().loadUserProfile();
      }
      
      return response;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ 
          user: null, 
          profile: null,
          isAuthenticated: false,
          isLoading: false 
        });
        // Reset the userStore state
        useUserStore.getState().reset();
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supabase.auth.resetPasswordForEmail(email);
      set({ isLoading: false });
      
      if (response.error) {
        set({ error: response.error.message });
      }
      
      return response;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  loadUserProfile: async () => {
    const user = get().user;
    if (!user) return;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }
      
      if (data) {
        const profile: UserProfile = {
          id: data.id,
          username: data.username,
          email: data.email,
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          accountType: data.account_type,
          isAccountActivated: data.is_account_activated,
        };
        
        set({ profile, isLoading: false });
        
        // Sync the user profile with the userStore
        const userStore = useUserStore.getState();
        userStore.setAccountType(profile.accountType);
        userStore.setAccountActivation(profile.isAccountActivated);
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  updateProfile: async (updates: Partial<UserProfile>) => {
    const user = get().user;
    if (!user) return;
    
    set({ isLoading: true, error: null });
    try {
      // Convert profile updates to database column format
      const dbUpdates: Record<string, any> = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
      if (updates.accountType !== undefined) dbUpdates.account_type = updates.accountType;
      if (updates.isAccountActivated !== undefined) dbUpdates.is_account_activated = updates.isAccountActivated;
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }
      
      // Update local profile state
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ 
          profile: { ...currentProfile, ...updates },
          isLoading: false 
        });
        
        // Sync with userStore if account type or activation status changes
        if (updates.accountType) {
          useUserStore.getState().setAccountType(updates.accountType);
        }
        
        if (updates.isAccountActivated !== undefined) {
          useUserStore.getState().setAccountActivation(updates.isAccountActivated);
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
