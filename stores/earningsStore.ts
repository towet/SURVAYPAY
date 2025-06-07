import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

// Define our earnings store types
interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'survey' | 'referral' | 'bonus' | 'withdrawal';
  description: string;
}

interface EarningsState {
  currentBalance: number;
  targetEarnings: number;
  totalEarned: number;
  totalWithdrawn: number;
  transactions: Transaction[];
  
  // Actions
  addSurveyEarnings: (amount: number, description: string) => void;
  addReferralEarnings: (amount: number, description: string) => void;
  addBonusEarnings: (amount: number, description: string) => void;
  withdrawFunds: (amount: number, description: string) => void;
  resetEarnings: () => void;
  syncWithSupabase: () => Promise<void>;
}

// Generate a unique ID for transactions
const generateId = () => Math.random().toString(36).substring(2, 10);

// Create the store with persistence
export const useEarningsStore = create<EarningsState>()(
  persist(
    (set, get) => ({
      currentBalance: 0,
      targetEarnings: 250,
      totalEarned: 0,
      totalWithdrawn: 0,
      transactions: [], // Empty transactions for new accounts

      // Add earnings from completing a survey
      addSurveyEarnings: (amount: number, description: string) => {
        const transaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
          amount,
          type: 'survey',
          description,
        };

        set((state) => ({
          currentBalance: state.currentBalance + amount,
          totalEarned: state.totalEarned + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      // Add earnings from referrals
      addReferralEarnings: (amount: number, description: string) => {
        const transaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
          amount,
          type: 'referral',
          description,
        };

        set((state) => ({
          currentBalance: state.currentBalance + amount,
          totalEarned: state.totalEarned + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      // Add bonus earnings
      addBonusEarnings: (amount: number, description: string) => {
        const transaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
          amount,
          type: 'bonus',
          description,
        };

        set((state) => ({
          currentBalance: state.currentBalance + amount,
          totalEarned: state.totalEarned + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      // Withdraw funds
      withdrawFunds: (amount: number, description: string) => {
        // First check if user meets the 1000 KSH withdrawal threshold
        const currentBalance = get().currentBalance;
        
        if (currentBalance < 1000) {
          console.error('Cannot withdraw: Balance must be at least 1000 KSH');
          return;
        }
        
        // Then check if the user has enough funds for the requested amount
        if (amount > currentBalance) {
          console.error(`Cannot withdraw ${amount} KSH. Insufficient funds.`);
          return;
        }

        const transaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
          amount: -amount, // Negative amount for withdrawals
          type: 'withdrawal',
          description,
        };

        set((state) => ({
          currentBalance: state.currentBalance - amount,
          totalWithdrawn: state.totalWithdrawn + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      // Reset earnings (for testing/admin purposes)
      resetEarnings: () => {
        set({
          currentBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          transactions: [],
        });
      },

      syncWithSupabase: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          // First, check if this is a brand new user (created within the last minute)
          // This helps identify newly registered accounts
          const userCreationTime = new Date(user.created_at || Date.now());
          const now = new Date();
          const isNewUser = (now.getTime() - userCreationTime.getTime()) < 60000; // 60 seconds
          
          // If this is a new user, reset earnings to start with a clean slate
          if (isNewUser) {
            set({
              currentBalance: 0,
              totalEarned: 0,
              totalWithdrawn: 0,
              transactions: [],
            });
            // No need to query the database for a new user
            return;
          }

          // Get earnings records from Supabase for existing users
          const { data: earningsData, error: earningsError } = await supabase
            .from('earnings')
            .select('amount, description, created_at, is_premium')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (earningsError) throw earningsError;

          // Get withdrawal records from Supabase
          const { data: withdrawalsData, error: withdrawalsError } = await supabase
            .from('withdrawals')
            .select('amount, created_at, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (withdrawalsError) throw withdrawalsError;

          // Calculate totals and create transactions
          let totalEarned = 0;
          let totalWithdrawn = 0;
          const transactions: Transaction[] = [];

          // Process earnings
          if (earningsData) {
            earningsData.forEach((earning) => {
              totalEarned += earning.amount;

              transactions.push({
                id: generateId(),
                date: earning.created_at,
                amount: earning.amount,
                type: 'survey',
                description: earning.description || 'Survey completion',
              });
            });
          }

          // Process withdrawals
          if (withdrawalsData) {
            withdrawalsData.forEach((withdrawal) => {
              if (withdrawal.status === 'completed') {
                totalWithdrawn += withdrawal.amount;

                transactions.push({
                  id: generateId(),
                  date: withdrawal.created_at,
                  amount: -withdrawal.amount,
                  type: 'withdrawal',
                  description: `Withdrawal - ${withdrawal.status}`,
                });
              }
            });
          }

          // Update the store
          set({
            totalEarned,
            totalWithdrawn,
            currentBalance: totalEarned - totalWithdrawn,
            transactions,
          });
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      },
    }),
    {
      name: 'earnings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
