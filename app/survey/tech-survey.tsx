import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ArrowLeft, ArrowRight, Clock, DollarSign, Check } from 'lucide-react-native';
// Using userPreferences instead of trying to import a non-existent store
import { useCallback } from 'react';
const useUserAccount = () => {
  // Mock implementation that mimics the user account store behavior
  return {
    hasUserAccount: 'premium',
    setHasUserAccount: useCallback((type: string) => {}, [])
  };
};
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay } from 'react-native-reanimated';

// Technology Regular Survey - Regular Survey (100 KSH)
// This is a category-specific implementation to avoid pricing issues

const sampleTechQuestions = [
  {
    id: 'q1',
    text: 'Which smartphone operating system do you currently use?',
    type: 'single-choice',
    options: [
      { id: 'q1_a1', text: 'Android' },
      { id: 'q1_a2', text: 'iOS (iPhone)' },
      { id: 'q1_a3', text: 'Other' },
      { id: 'q1_a4', text: 'I don\'t use a smartphone' },
    ],
    required: true,
  },
  {
    id: 'q2',
    text: 'How often do you upgrade your smartphone?',
    type: 'single-choice',
    options: [
      { id: 'q2_a1', text: 'Every year' },
      { id: 'q2_a2', text: 'Every 2 years' },
      { id: 'q2_a3', text: 'Every 3-4 years' },
      { id: 'q2_a4', text: 'Only when it stops working' },
      { id: 'q2_a5', text: 'I\'ve never upgraded' },
    ],
    required: true,
  },
  {
    id: 'q3',
    text: 'Which social media platforms do you use regularly?',
    type: 'multiple-choice',
    options: [
      { id: 'q3_a1', text: 'Facebook' },
      { id: 'q3_a2', text: 'Instagram' },
      { id: 'q3_a3', text: 'Twitter/X' },
      { id: 'q3_a4', text: 'TikTok' },
      { id: 'q3_a5', text: 'LinkedIn' },
      { id: 'q3_a6', text: 'None' },
    ],
    required: true,
  },
  {
    id: 'q4',
    text: 'How many hours per day do you spend on your smartphone?',
    type: 'single-choice',
    options: [
      { id: 'q4_a1', text: 'Less than 1 hour' },
      { id: 'q4_a2', text: '1-3 hours' },
      { id: 'q4_a3', text: '4-6 hours' },
      { id: 'q4_a4', text: 'More than 6 hours' },
    ],
    required: true,
  },
  {
    id: 'q5',
    text: 'Which digital services do you currently pay for?',
    type: 'multiple-choice',
    options: [
      { id: 'q5_a1', text: 'Music streaming (Spotify, Apple Music, etc.)' },
      { id: 'q5_a2', text: 'Video streaming (Netflix, Disney+, etc.)' },
      { id: 'q5_a3', text: 'Cloud storage' },
      { id: 'q5_a4', text: 'News subscriptions' },
      { id: 'q5_a5', text: 'Gaming services' },
      { id: 'q5_a6', text: 'None' },
    ],
    required: true,
  }
];

export default function TechSurveyScreen() {
  const router = useRouter();
  const { hasUserAccount, setHasUserAccount } = useUserAccount();
  
  // Define interface for answers object
  interface AnswersType {
    [key: string]: string | string[];
  }
  
  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersType>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  // Animation values
  const fadeAnim = useSharedValue(1);
  const slideAnim = useSharedValue(0);
  
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
  
  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate progress percentage
  const progress = (currentQuestionIndex + 1) / sampleTechQuestions.length;
  
  // Get current question
  const currentQuestion = sampleTechQuestions[currentQuestionIndex];
  
  // Handlers for different question types
  const handleSingleChoice = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };
  
  const handleMultipleChoice = (optionId: string) => {
    const currentSelections = answers[currentQuestion.id as keyof typeof answers] as string[] || [];
    
    if (currentSelections.includes(optionId)) {
      // Remove option if already selected
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentSelections.filter(id => id !== optionId)
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
      return (answer as string[]).length > 0;
    }
    
    return true;
  };
  
  // Navigate to the next question with animation
  const goToNextQuestion = () => {
    if (currentQuestionIndex < sampleTechQuestions.length - 1) {
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
      // Hard-coded navigation to the tech-specific completion screen
      router.push('/survey/tech-completion');
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
      const selectedOptions = (answers[currentQuestion.id] as string[]) || [];
      
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
          <DollarSign size={20} color={Colors.light.primary} />
          <Text style={styles.rewardText}>
            KES 100
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} animated={true} />
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {sampleTechQuestions.length}
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
            {currentQuestionIndex < sampleTechQuestions.length - 1 ? 'Next' : 'Submit'}
          </Text>
          {currentQuestionIndex < sampleTechQuestions.length - 1 ? (
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background + '10',
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
    backgroundColor: Colors.light.primary + '10',
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
    fontSize: 18,
    color: Colors.light.text,
    marginVertical: Layout.spacing.m,
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
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '05',
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
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
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
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: Layout.spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
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
    fontSize: 16,
    color: '#FFF',
    marginRight: Layout.spacing.xs,
  },
});
