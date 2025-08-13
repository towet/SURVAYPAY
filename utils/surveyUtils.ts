/**
 * Utility functions for surveys
 */

/**
 * Returns the correct reward amount based on the survey's premium status
 * @param isPremium Whether the survey is premium or not
 * @returns The correct reward amount (250 for premium, 100 for regular)
 */
export const getCorrectReward = (isPremium: boolean): number => {
  return isPremium ? 250 : 100;
};

/**
 * Ensures a survey object has the correct reward amount
 * @param survey The survey object to check
 * @returns A new survey object with the correct reward amount
 */
export const ensureCorrectReward = (survey: any): any => {
  return {
    ...survey,
    reward: getCorrectReward(survey.isPremium)
  };
};

/**
 * Ensures an array of surveys have the correct reward amounts
 * @param surveys Array of survey objects
 * @returns A new array of survey objects with correct reward amounts
 */
export const ensureCorrectRewards = (surveys: any[]): any[] => {
  return surveys.map(survey => ensureCorrectReward(survey));
};
