import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountType = 'basic' | 'premium';

interface UserState {
  accountType: AccountType;
  isPremium: boolean;
  isAccountActivated: boolean;
  hasAttemptedPremiumSurvey: boolean;
  completedSurveys: Array<{
    id: string;
    isPremium: boolean;
    date: string;
  }>;
  // Methods
  setAccountType: (type: AccountType) => void;
  setAccountActivation: (isActivated: boolean) => void;
  recordSurveyCompletion: (surveyId: string, isPremium: boolean) => void;
  hasCompletedPremiumSurveys: () => boolean;
  hasCompletedOnlyBasicSurveys: () => boolean;
  canAccessPremiumContent: () => boolean;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      accountType: 'basic',
      isPremium: false,
      isAccountActivated: false,
      hasAttemptedPremiumSurvey: false,
      completedSurveys: [],

      setAccountType: (type: AccountType) => {
        set({
          accountType: type,
          isPremium: type === 'premium',
        });
      },

      setAccountActivation: (isActivated: boolean) => {
        set({ isAccountActivated: isActivated });
      },

      recordSurveyCompletion: (surveyId: string, isPremium: boolean) => {
        const currentCompletedSurveys = [...get().completedSurveys];
        currentCompletedSurveys.push({
          id: surveyId,
          isPremium,
          date: new Date().toISOString(),
        });

        set({
          completedSurveys: currentCompletedSurveys,
          hasAttemptedPremiumSurvey: isPremium || get().hasAttemptedPremiumSurvey,
        });
      },

      hasCompletedPremiumSurveys: () => {
        return get().completedSurveys.some(survey => survey.isPremium);
      },

      hasCompletedOnlyBasicSurveys: () => {
        return get().completedSurveys.length > 0 && 
               !get().completedSurveys.some(survey => survey.isPremium);
      },

      canAccessPremiumContent: () => {
        return get().accountType === 'premium';
      },

      reset: () => {
        set({
          accountType: 'basic',
          isPremium: false,
          isAccountActivated: false,
          hasAttemptedPremiumSurvey: false,
          completedSurveys: [],
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
