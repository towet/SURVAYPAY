import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ArrowLeft, ArrowRight, Clock, DollarSign, Check } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import PackagesModal from '@/components/ui/PackagesModal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, withDelay } from 'react-native-reanimated';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360; // Extra small screen handling

// Finance Premium Survey 1 - Premium Survey (250 KSH)
// This is a category-specific implementation to avoid pricing issues

const samplePremiumFinanceQuestions = [
  {
    id: 'q1',
    text: 'What investment products are you currently using?',
    type: 'multiple-choice',
    options: [
      { id: 'q1_a1', text: 'Stocks/Shares' },
      { id: 'q1_a2', text: 'Mutual Funds' },
      { id: 'q1_a3', text: 'Government Bonds' },
      { id: 'q1_a4', text: 'Corporate Bonds' },
      { id: 'q1_a5', text: 'Real Estate' },
      { id: 'q1_a6', text: 'Cryptocurrency' },
    ],
    required: true,
  },
  {
    id: 'q2',
    text: 'How satisfied are you with your current investment returns?',
    type: 'single-choice',
    options: [
      { id: 'q2_a1', text: 'Very satisfied' },
      { id: 'q2_a2', text: 'Somewhat satisfied' },
      { id: 'q2_a3', text: 'Neutral' },
      { id: 'q2_a4', text: 'Somewhat dissatisfied' },
      { id: 'q2_a5', text: 'Very dissatisfied' },
    ],
    required: true,
  },
  {
    id: 'q3',
    text: 'Which financial goals are you currently saving for?',
    type: 'multiple-choice',
    options: [
      { id: 'q3_a1', text: 'Retirement' },
      { id: 'q3_a2', text: 'Education' },
      { id: 'q3_a3', text: 'Home purchase' },
      { id: 'q3_a4', text: 'Emergency fund' },
      { id: 'q3_a5', text: 'Major purchase (car, etc.)' },
      { id: 'q3_a6', text: 'Travel/Vacation' },
    ],
    required: true,
  },
  {
    id: 'q4',
    text: 'How would you describe your investment risk tolerance?',
    type: 'single-choice',
    options: [
      { id: 'q4_a1', text: 'Very conservative (low risk)' },
      { id: 'q4_a2', text: 'Somewhat conservative' },
      { id: 'q4_a3', text: 'Moderate' },
      { id: 'q4_a4', text: 'Somewhat aggressive' },
      { id: 'q4_a5', text: 'Very aggressive (high risk)' },
    ],
    required: true,
  },
  {
    id: 'q5',
    text: 'How much do you typically invest per month?',
    type: 'single-choice',
    options: [
      { id: 'q5_a1', text: 'Less than 5,000 KSH' },
      { id: 'q5_a2', text: '5,000 - 10,000 KSH' },
      { id: 'q5_a3', text: '10,000 - 25,000 KSH' },
      { id: 'q5_a4', text: '25,000 - 50,000 KSH' },
      { id: 'q5_a5', text: 'More than 50,000 KSH' },
    ],
    required: true,
  }
];

export default function FinancePremiumSurvey1Screen() {
  const router = useRouter();
  const { accountType, setAccountType, canAccessPremiumContent } = useUserStore();
  
  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});  
  const [timeLeft, setTimeLeft] = useState(600); 
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Animation values
  const fadeAnim = useSharedValue(1);
  const slideAnim = useSharedValue(0);
  
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
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
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
  const currentQuestion = samplePremiumFinanceQuestions[currentQuestionIndex];
  
  // Handlers for different question types
  const handleSingleChoice = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };
  
  const handleMultipleChoice = (optionId: string) => {
    const currentSelections = answers[currentQuestion.id] || [];
    
    if (currentSelections.includes(optionId)) {
      // Remove option if already selected
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentSelections.filter((id: string) => id !== optionId)
      });
    } else {
      // Add option if not already selected
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...currentSelections, optionId]
      });
    }
  };
  
  // Check if the current question has been answered
  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id];
    
    if (!answer) {
      return false;
    }
    
    if (currentQuestion.type === 'multiple-choice') {
      return answer.length > 0;
    }
    
    return true;
  };
  
  // Navigate to the next question with animation
  const goToNextQuestion = () => {
    if (currentQuestionIndex < samplePremiumFinanceQuestions.length - 1) {
      // Fade out, then fade in with slide animation
      fadeAnim.value = withTiming(0, { duration: 200 });
      slideAnim.value = withSequence(
        withTiming(200, { duration: 200 }),
        withTiming(-200, { duration: 0 })
      );
      
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        
        fadeAnim.value = withTiming(1, { duration: 200 });
        slideAnim.value = withTiming(0, { duration: 200 });
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
  
  // Navigate to the previous question with animation
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      fadeAnim.value = withTiming(0, { duration: 200 });
      slideAnim.value = withSequence(
        withTiming(-200, { duration: 200 }),
        withTiming(200, { duration: 0 })
      );
      
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        
        fadeAnim.value = withTiming(1, { duration: 200 });
        slideAnim.value = withTiming(0, { duration: 200 });
      }, 200);
    }
  };
  
  // Render options based on question type
  const renderOptions = () => {
    if (currentQuestion.type === 'single-choice') {
      return currentQuestion.options?.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            answers[currentQuestion.id] === option.id && styles.selectedOption,
          ]}
          onPress={() => handleSingleChoice(option.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.optionCheckCircle,
            answers[currentQuestion.id] === option.id && styles.selectedOptionCheck,
          ]}>
            {answers[currentQuestion.id] === option.id && (
              <Check size={16} color="#FFF" />
            )}
          </View>
          <Text style={[
            styles.optionText,
            answers[currentQuestion.id] === option.id && styles.selectedOptionText,
          ]}>
            {option.text}
          </Text>
        </TouchableOpacity>
      ));
    } else if (currentQuestion.type === 'multiple-choice') {
      const selectedOptions = answers[currentQuestion.id] || [];
      
      return currentQuestion.options?.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            selectedOptions.includes(option.id) && styles.selectedOption,
          ]}
          onPress={() => handleMultipleChoice(option.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.optionCheckSquare,
            selectedOptions.includes(option.id) && styles.selectedOptionCheck,
          ]}>
            {selectedOptions.includes(option.id) && (
              <Check size={16} color="#FFF" />
            )}
          </View>
          <Text style={[
            styles.optionText,
            selectedOptions.includes(option.id) && styles.selectedOptionText,
          ]}>
            {option.text}
          </Text>
        </TouchableOpacity>
      ));
    }
    
    return null;
  };

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.timerContainer}>
          <Clock size={16} color={timeLeft < 60 ? Colors.light.error : Colors.light.text} />
          <Text 
            style={[
              styles.timerText,
              timeLeft < 60 && styles.timerWarning
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
        
        <View style={styles.rewardContainer}>
          <DollarSign size={20} color={Colors.light.accent} />
          <Text style={styles.rewardText}>
            KES 250 <Text style={styles.premiumText}>(Premium)</Text>
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} animated={true} />
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {samplePremiumFinanceQuestions.length}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Card style={styles.questionCard}>
            <Badge
              label={`Question ${currentQuestionIndex + 1}`}
              color={Colors.light.accent}
              size="small"
            />
            
            <Text style={styles.questionText}>
              {currentQuestion.text}
            </Text>
            
            <View style={styles.optionsContainer}>
              {renderOptions()}
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.navigationContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity
            style={styles.prevButton}
            onPress={goToPreviousQuestion}
          >
            <ArrowLeft size={20} color={Colors.light.text} />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isCurrentQuestionAnswered() && styles.disabledButton,
          ]}
          onPress={goToNextQuestion}
          disabled={!isCurrentQuestionAnswered()}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex < samplePremiumFinanceQuestions.length - 1 ? 'Next' : 'Submit'}
          </Text>
          {currentQuestionIndex < samplePremiumFinanceQuestions.length - 1 ? (
            <ArrowRight size={20} color="#FFF" />
          ) : (
            <Check size={20} color="#FFF" />
          )}
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
    paddingHorizontal: isSmallScreen ? Layout.spacing.s : Layout.spacing.m,
    paddingTop: Layout.spacing.xl + Layout.insets.top,
    paddingBottom: isSmallScreen ? Layout.spacing.s : Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
  timerWarning: {
    color: Colors.light.error,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.accent + '10',
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
  },
  rewardText: {
    marginLeft: Layout.spacing.xs,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  premiumText: {
    color: Colors.light.accent,
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressContainer: {
    padding: Layout.spacing.m,
  },
  progressText: {
    marginTop: Layout.spacing.xs,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'right',
  },
  contentContainer: {
    flex: 1,
    padding: Layout.spacing.m,
  },
  questionContainer: {
    marginBottom: Layout.spacing.l,
  },
  questionCard: {
    padding: Layout.spacing.m,
  },
  questionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: isSmallScreen ? 16 : 18,
    color: Colors.light.text,
    marginBottom: isSmallScreen ? Layout.spacing.s : Layout.spacing.m,
  },
  optionsContainer: {
    marginTop: Layout.spacing.s,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? Layout.spacing.xs : Layout.spacing.s,
    paddingHorizontal: isSmallScreen ? Layout.spacing.s : Layout.spacing.m,
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
    marginRight: Layout.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCheckSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: Layout.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOptionCheck: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.accent,
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: isSmallScreen ? 12 : 14,
    color: Colors.light.text,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.light.text,
    fontFamily: 'Poppins-Medium',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
  },
  prevButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: isSmallScreen ? 14 : 16,
    color: Colors.light.text,
    marginLeft: Layout.spacing.s,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.accent,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.medium,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: Colors.light.border,
    opacity: 0.7,
  },
  nextButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: isSmallScreen ? 14 : 16,
    color: '#FFF',
    marginRight: Layout.spacing.xs,
  },
});
