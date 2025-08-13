import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://ugztrybwhghxfsnglgsz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnenRyeWJ3aGdoeGZzbmdsZ3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTQ4NjQsImV4cCI6MjA2MzQ3MDg2NH0.3dzo0k6iCHB7wsQ7udXF_nLMOOQSiOR0LfE06vR1Kjc';

// Create a custom storage adapter that checks for window
const customStorage = {
  getItem: (key: string) => {
    // Skip AsyncStorage during server-side rendering
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    // Skip AsyncStorage during server-side rendering
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    // Skip AsyncStorage during server-side rendering
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
