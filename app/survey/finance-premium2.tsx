import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ArrowLeft, ArrowRight, Clock, DollarSign, Check } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import PackagesModal from '@/components/ui/PackagesModal';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, withDelay } from 'react-native-reanimated';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360; // Extra small screen handling

// Finance Premium Survey 2 - Premium Survey (250 KSH)
// Category-specific implementation to ensure correct pricing

const samplePremiumFinanceQuestions = [
  {
    id: 'q1',
    text: 'Which financial goals are most important to you right now?',
    type: 'multiple-choice',
    options: [
      { id: 'q1_a1', text: 'Building emergency savings' },
      { id: 'q1_a2', text: 'Paying off debt' },
      { id: 'q1_a3', text: 'Saving for retirement' },
      { id: 'q1_a4', text: 'Saving for a large purchase' },
      { id: 'q1_a5', text: 'Investing for wealth growth' },
      { id: 'q1_a6', text: 'Saving for education' },
    ],
    required: true,
  },
  {
    id: 'q2',
    text: 'What is your comfort level with financial risk?',
    type: 'single-choice',
    options: [
      { id: 'q2_a1', text: 'Very conservative - avoid risk at all costs' },
      { id: 'q2_a2', text: 'Somewhat conservative - prefer stability' },
      { id: 'q2_a3', text: 'Moderate - balance of risk and stability' },
      { id: 'q2_a4', text: 'Somewhat aggressive - willing to take calculated risks' },
      { id: 'q2_a5', text: 'Very aggressive - comfortable with high risk for high returns' },
    ],
    required: true,
  },
  {
    id: 'q3',
    text: 'How often do you check or manage your financial accounts?',
    type: 'single-choice',
    options: [
      { id: 'q3_a1', text: 'Daily' },
      { id: 'q3_a2', text: 'Weekly' },
      { id: 'q3_a3', text: 'Monthly' },
      { id: 'q3_a4', text: 'Quarterly' },
      { id: 'q3_a5', text: 'Annually or less frequently' },
    ],
    required: true,
  },
  {
    id: 'q4',
    text: 'Which of these financial products do you currently use?',
    type: 'multiple-choice',
    options: [
      { id: 'q4_a1', text: 'Checking account' },
      { id: 'q4_a2', text: 'Savings account' },
      { id: 'q4_a3', text: 'Credit card' },
      { id: 'q4_a4', text: 'Personal loan' },
      { id: 'q4_a5', text: 'Mortgage' },
      { id: 'q4_a6', text: 'Investment account' },
      { id: 'q4_a7', text: 'Retirement account' },
    ],
    required: true,
  },
  {
    id: 'q5',
    text: 'How satisfied are you with your current financial situation?',
    type: 'single-choice',
    options: [
      { id: 'q5_a1', text: 'Very satisfied' },
      { id: 'q5_a2', text: 'Somewhat satisfied' },
      { id: 'q5_a3', text: 'Neutral' },
      { id: 'q5_a4', text: 'Somewhat dissatisfied' },
      { id: 'q5_a5', text: 'Very dissatisfied' },
    ],
    required: true,
  },
];

export default function FinancePremiumSurvey2Screen() {
  const router = useRouter();
  const { accountType, setAccountType, canAccessPremiumContent } = useUserStore();
  
  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  
  const [currentQuestion, setCurrentQuestion] = useState(samplePremiumFinanceQuestions[0].id);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });
  
  // Check if user can access premium survey
  useEffect(() => {
    // When a premium survey is opened by a basic user, show upgrade packages modal
    if (!canAccessPremiumContent()) {
      setTimeout(() => {
        setShowUpgradeModal(true);
      }, 500); // Small delay for better UX
    }
  }, [canAccessPremiumContent]);
  
  // Handlers for package modal options
  const handleUpgradeLite = () => {
    // In a real app, this would go to a payment screen
    console.log('User upgrading to Lite package');
    setAccountType('premium');
    setShowUpgradeModal(false);
  };
  
  const handleUpgradeClassic = () => {
    // In a real app, this would go to a payment screen
    console.log('User upgrading to Classic package');
    setAccountType('premium');
    setShowUpgradeModal(false);
  };
  
  const handleContinueBasic = () => {
    // Navigate to a regular survey
    setShowUpgradeModal(false);
    router.push('/survey/finance-survey');
  };
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate progress percentage
  const progress = (currentQuestionIndex + 1) / samplePremiumFinanceQuestions.length;
  
  // Get current question
  const currentQuestionData = samplePremiumFinanceQuestions[currentQuestionIndex];
  
  // Handle option selection
  const handleSelectOption = (optionId: string) => {
    if (currentQuestionData.type === 'single-choice') {
      setAnswers({ ...answers, [currentQuestionData.id]: optionId });
    } else {
      // Handle multiple choice
      const currentSelections = answers[currentQuestionData.id] || [];
      
      if (currentSelections.includes(optionId)) {
        // Remove option if already selected
        setAnswers({
          ...answers,
          [currentQuestionData.id]: currentSelections.filter((id: string) => id !== optionId)
        });
      } else {
        // Add option if not already selected
        setAnswers({
          ...answers,
          [currentQuestionData.id]: [...currentSelections, optionId]
        });
      }
    }
    
    setErrorMessage('');
  };
  
  // Check if an option is selected
  const isOptionSelected = (optionId: string) => {
    const answer = answers[currentQuestionData.id];
    
    if (!answer) return false;
    
    if (Array.isArray(answer)) {
      return answer.includes(optionId);
    }
    
    return answer === optionId;
  };
  
  // Navigate to the next question or finish the survey
  const handleContinue = () => {
    // Ensure a selection has been made
    if (!answers[currentQuestionData.id] || 
        (Array.isArray(answers[currentQuestionData.id]) && answers[currentQuestionData.id].length === 0)) {
      setErrorMessage('Please select an option to continue');
      return;
    }
    
    if (currentQuestionIndex < samplePremiumFinanceQuestions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentQuestion(samplePremiumFinanceQuestions[currentQuestionIndex + 1].id);
      
      // Animate the transition
      opacity.value = 0;
      translateY.value = 20;
      
      setTimeout(() => {
        opacity.value = withTiming(1, { duration: 500 });
        translateY.value = withTiming(0, { duration: 500 });
      }, 200);
    } else {
      // Submit the survey and go to completion screen
      finishSurvey();
    }
  };
  
  // Proceed to completion page
  const finishSurvey = () => {
    // Only allow premium users to access the premium completion (and rewards)
    if (canAccessPremiumContent()) {
      router.replace('/survey/finance-premium-completion');
    } else {
      // If they somehow bypassed the upgrade modal, show it again
      setShowUpgradeModal(true);
    }
  };
  
  // Go back to previous question
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentQuestion(samplePremiumFinanceQuestions[currentQuestionIndex - 1].id);
    } else {
      // If on first question, go back to surveys list
      router.back();
    }
  };
  
  // Animation for page entry
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Premium Packages Upgrade Modal */}
      <PackagesModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeLite={handleUpgradeLite}
        onUpgradeClassic={handleUpgradeClassic}
        onContinueBasic={handleContinueBasic}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Premium Finance Survey 2</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8}}>
            <DollarSign size={12} color="#fff" />
            <Text style={{color: '#fff', marginLeft: 4, fontFamily: 'Poppins-Medium', fontSize: 12}}>250 KSH</Text>
          </View>
        </View>
        
        <View style={styles.timerContainer}>
          <Clock size={16} color={Colors.light.text} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={progress}
          height={8}
          backgroundColor={Colors.light.primary}
          animated={true}
        />
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {samplePremiumFinanceQuestions.length}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.questionCard, animatedStyle]}>
          {/* Current question */}
          <Text style={styles.questionText}>{currentQuestionData.text}</Text>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestionData.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, isOptionSelected(option.id) && styles.selectedOption]}
                onPress={() => handleSelectOption(option.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionCheckCircle,
                  isOptionSelected(option.id) && styles.selectedCheckCircle
                ]}>
                  {isOptionSelected(option.id) && (
                    <Check size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Error message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {currentQuestionIndex < samplePremiumFinanceQuestions.length - 1 ? 'Continue' : 'Submit'}
          </Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingTop: Layout.spacing.xl + 30, // Safe area top padding
    paddingBottom: Layout.spacing.m,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginRight: Layout.spacing.s,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
  },
  timerText: {
    marginLeft: Layout.spacing.xs,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  progressContainer: {
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
  },
  progressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: Layout.spacing.xs,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  questionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.l,
    marginBottom: Layout.spacing.m,
  },
  questionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
  },
  optionsContainer: {
    marginTop: Layout.spacing.s,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.card,
  },
  selectedOption: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.accent + '05',
  },
  optionCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.s,
  },
  selectedCheckCircle: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.accent,
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginTop: Layout.spacing.m,
  },
  footer: {
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.m + 10, // Safe area bottom padding
    paddingTop: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
  },
  continueButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#fff',
    marginRight: Layout.spacing.xs,
  },
});
