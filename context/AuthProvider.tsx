import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { View, Text, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

// Define the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
});

// Hook for components to get the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to check if a route requires authentication
  const isProtectedRoute = (segments: string[]) => {
    // Routes that don't require authentication
    if (
      segments[0] === 'auth' ||
      segments[0] === '(onboarding)' ||
      segments[0] === 'survey' && !segments[1]?.includes('premium')
    ) {
      return false;
    }
    return true;
  };
  
  // Effect to initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data } = await supabase.auth.getSession();
        
        // Load the user profile if there's a session
        if (data.session?.user) {
          await useAuthStore.getState().loadUserProfile();
        }
        
        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              await useAuthStore.getState().loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
              // Reset user state
            }
          }
        );
        
        setIsInitialized(true);
        
        // Clean up the subscription
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Effect to handle route protection
  useEffect(() => {
    if (!isInitialized) return;
    
    const requiresAuth = isProtectedRoute(segments);
    
    if (requiresAuth && !isAuthenticated && !isLoading) {
      // Redirect to login if trying to access protected route without auth
      router.replace('/auth/login');
    } else if (!requiresAuth && isAuthenticated) {
      // Redirect to home if trying to access auth routes while already authenticated
      if (segments[0] === 'auth') {
        router.replace('/(tabs)');
      }
    }
  }, [segments, isAuthenticated, isLoading, isInitialized]);
  
  // While initializing, show a loading screen
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={{ marginTop: 20, fontFamily: 'Poppins-Medium' }}>
          Loading SurvayPay...
        </Text>
      </View>
    );
  }
  
  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
