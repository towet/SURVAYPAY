import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { Check, X, Clock, DollarSign, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react-native';
import { getCorrectReward } from '@/utils/surveyUtils';

// Question types
type QuestionType = 'multiple-choice' | 'single-choice' | 'rating' | 'open-ended';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  required: boolean;
}

interface SurveyType {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration: number;
  reward: number;
  isPremium: boolean;
  categoryId?: string;
  tags?: string[];
  questions: Question[];
}

// Sample questions that will be used for all surveys
const sampleQuestions: Question[] = [
  {
    id: 'q1',
    text: 'How often do you shop online?',
    type: 'single-choice',
    options: [
      { id: 'o1', text: 'Daily' },
      { id: 'o2', text: 'Several times a week' },
      { id: 'o3', text: 'Once a week' },
      { id: 'o4', text: 'A few times a month' },
      { id: 'o5', text: 'Rarely or never' },
    ],
    required: true,
  },
  {
    id: 'q2',
    text: 'Which of the following online platforms do you use for shopping? (Select all that apply)',
    type: 'multiple-choice',
    options: [
      { id: 'o1', text: 'Jumia' },
      { id: 'o2', text: 'Kilimall' },
      { id: 'o3', text: 'Amazon' },
      { id: 'o4', text: 'eBay' },
      { id: 'o5', text: 'Instagram shops' },
      { id: 'o6', text: 'Facebook Marketplace' },
      { id: 'o7', text: 'Other' },
    ],
    required: true,
  },
  {
    id: 'q3',
    text: 'What factors influence your decision to shop online? (Select all that apply)',
    type: 'multiple-choice',
    options: [
      { id: 'o1', text: 'Convenience' },
      { id: 'o2', text: 'Price' },
      { id: 'o3', text: 'Product variety' },
      { id: 'o4', text: 'Delivery options' },
      { id: 'o5', text: 'Reviews and ratings' },
      { id: 'o6', text: 'Payment options' },
      { id: 'o7', text: 'Other' },
    ],
    required: true,
  },
  {
    id: 'q4',
    text: 'How satisfied are you with online shopping experiences in Kenya?',
    type: 'single-choice',
    options: [
      { id: 'o1', text: 'Very satisfied' },
      { id: 'o2', text: 'Satisfied' },
      { id: 'o3', text: 'Neutral' },
      { id: 'o4', text: 'Dissatisfied' },
      { id: 'o5', text: 'Very dissatisfied' },
    ],
    required: true,
  },
  {
    id: 'q5',
    text: 'What payment methods do you prefer when shopping online?',
    type: 'multiple-choice',
    options: [
      { id: 'o1', text: 'M-Pesa' },
      { id: 'o2', text: 'Credit/Debit card' },
      { id: 'o3', text: 'Bank transfer' },
      { id: 'o4', text: 'Cash on delivery' },
      { id: 'o5', text: 'Other mobile money' },
      { id: 'o6', text: 'PayPal' },
    ],
    required: true,
  },
];

// Import surveys from external data
import { availableSurveys as surveysData } from '@/app/(tabs)/surveys';

// Process the survey data to add descriptions and questions
const availableSurveys: Record<string, SurveyType> = Object.fromEntries(
  surveysData.map(survey => [
    survey.id,
    {
      ...survey,
      description: `Complete this ${survey.isPremium ? 'premium' : 'standard'} survey about ${survey.category.toLowerCase()} to earn ${survey.reward} KSH.`,
      questions: sampleQuestions
    }
  ])
);

export default function SurveyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Get survey data based on ID
  // Default to survey 1 if ID not found
  const surveyId = id ? String(id) : '1';
  
  // Get the survey and enforce correct reward values
  const loadedSurvey = availableSurveys[surveyId as string] || availableSurveys['demo1'];
  
  // Create a modified survey object with the correct reward values
  const survey = {
    ...loadedSurvey,
    // Use the utility function to guarantee the correct reward amount
    reward: getCorrectReward(loadedSurvey.isPremium)
  };
  
  // This reward amount will be used for display and passed to the completion screen
  const displayReward = getCorrectReward(survey.isPremium);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(survey.duration * 60); // Time in seconds
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasUserAccount, setHasUserAccount] = useState<'basic' | 'premium'>('basic'); // For demo purposes, default to basic
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex) / survey.questions.length;
  
  // Timer countdown
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
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle selection for single choice questions
  const handleSingleChoice = (optionId: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
  };
  
  // Handle selection for multiple choice questions
  const handleMultipleChoice = (optionId: string) => {
    const currentAnswers = answers[currentQuestion.id] as string[] || [];
    
    if (currentAnswers.includes(optionId)) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentAnswers.filter(id => id !== optionId),
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...currentAnswers, optionId],
      });
    }
  };
  
  // Check if the current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion.required) return true;
    
    const answer = answers[currentQuestion.id];
    
    if (!answer) return false;
    
    if (currentQuestion.type === 'multiple-choice') {
      return (answer as string[]).length > 0;
    }
    
    return true;
  };
  
  // Check if user can access premium survey
  useEffect(() => {
    // When a premium survey is opened by a basic user, show upgrade modal
    if (survey.isPremium && hasUserAccount === 'basic') {
      setTimeout(() => {
        setShowUpgradeModal(true);
      }, 500); // Small delay for better UX
    }
  }, []);

  // Handle account upgrade
  const handleUpgrade = () => {
    // In a real app, this would navigate to a payment page
    console.log('User wants to upgrade to premium');
    setHasUserAccount('premium');
    setShowUpgradeModal(false);
    // You might want to update a user store or call an API here
  };

  // Continue with basic account
  const handleContinueWithBasic = () => {
    console.log('User continues with basic account');
    setShowUpgradeModal(false);
  };
  
  // Only show upgrade modal for premium surveys if user has basic account
  useEffect(() => {
    if (survey.isPremium && hasUserAccount === 'basic') {
      setTimeout(() => {
        setShowUpgradeModal(true);
      }, 500);
    }
  }, [survey.isPremium, hasUserAccount]);

  // Navigate to the next question with animation
  const goToNextQuestion = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      // Fade out, then fade in with slide animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 200,
          duration: 1,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        slideAnim.setValue(-200);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Submit the survey and go to completion screen
      router.push({
        pathname: '/survey/completion',
        params: { 
          reward: displayReward.toString(),
          isPremium: survey.isPremium.toString()
        }
      });
    }
  };
  
  // Navigate to the previous question with animation
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Fade out, then fade in with slide animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 1,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        slideAnim.setValue(200);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };
  
  // Render options based on question type
  const renderOptions = () => {
    const question = survey.questions[currentQuestionIndex];
    
    if (question.type === 'single-choice') {
      return question.options?.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            answers[question.id] === option.id && styles.selectedOption,
          ]}
          onPress={() => handleSingleChoice(option.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.optionCheckCircle,
            answers[question.id] === option.id && styles.selectedOptionCheck,
          ]}>
            {answers[question.id] === option.id && (
              <Check size={16} color="#FFF" />
            )}
          </View>
          <Text style={[
            styles.optionText,
            answers[question.id] === option.id && styles.selectedOptionText,
          ]}>
            {option.text}
          </Text>
        </TouchableOpacity>
      ));
    } else if (question.type === 'multiple-choice') {
      const selectedOptions = answers[question.id] as string[] || [];
      
      return question.options?.map(option => (
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
          <DollarSign size={20} color={survey.isPremium ? Colors.light.accent : Colors.light.primary} />
          <Text style={styles.rewardText}>
            KES {displayReward} {survey.isPremium && <Text style={styles.premiumText}>(Premium)</Text>}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} animated={true} />
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {survey.questions.length}
        </Text>
      </View>

      {/* Premium Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          // Handle upgrade flow - in a real app, this would integrate with payment
          setHasUserAccount('premium');
          setShowUpgradeModal(false);
          // Continue with survey
        }}
        onContinue={() => {
          // Close modal and continue with basic account
          setShowUpgradeModal(false);
        }}
        premiumAmount={250}
        basicAmount={100}
      />
      
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
              color={Colors.light.primary}
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
            {currentQuestionIndex < survey.questions.length - 1 ? 'Next' : 'Submit'}
          </Text>
          {currentQuestionIndex < survey.questions.length - 1 ? (
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
  premiumText: {
    color: Colors.light.accent,
    fontWeight: 'bold',
  },
  premiumReward: {
    color: Colors.light.accent,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Layout.spacing.xl + 10,
    paddingBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
  },
  timerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: Layout.spacing.xs,
  },
  timerWarning: {
    color: Colors.light.error,
  },
  rewardContainer: {
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
  },
  rewardText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.light.success,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.m,
  },
  questionContainer: {
    marginBottom: Layout.spacing.l,
  },
  questionCard: {
    padding: Layout.spacing.m,
  },
  questionBadge: {
    marginBottom: Layout.spacing.s,
  },
  questionText: {
    fontFamily: 'Poppins-SemiBold',
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
    padding: Layout.spacing.m,
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.s,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedOption: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary,
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
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: Layout.spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOptionCheck: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.light.text,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.m,
  },
  prevButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: Layout.spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Layout.spacing.l,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
  },
  nextButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginRight: Layout.spacing.xs,
  },
  disabledButton: {
    backgroundColor: Colors.light.border,
    opacity: 0.7,
  },
});