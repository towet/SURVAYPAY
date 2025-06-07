import React, { useEffect, useState } from 'react';
declare const gtag: (...args: any[]) => void;
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { CircleCheck as CheckCircle, Chrome as Home, ChartBar as BarChart2 } from 'lucide-react-native';
import Confetti from '@/components/ui/Confetti';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360; // Extra small screen handling
import { useEarningsStore } from '@/stores/earningsStore';
import { useUserStore } from '@/stores/userStore';

export default function TechPremiumCompletionScreen() {
  const router = useRouter();
  const { addSurveyEarnings } = useEarningsStore();
  const { canAccessPremiumContent, recordSurveyCompletion } = useUserStore();
  
  // Hard-coded reward amount - this is a PREMIUM survey (250 KSH)
  const surveyReward = 250;
  
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const rotate = useSharedValue(0);
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
  }));
  
  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  
  useEffect(() => {
    // Verify premium access - redirect to basic if not premium
    if (!canAccessPremiumContent()) {
      router.replace('/survey/tech-survey');
      return;
    }
    
    // Add the survey earnings when the completion screen loads
    const surveyId = Math.floor(Math.random() * 1000).toString();
    const surveyTitle = `Premium Technology Survey Completion #${surveyId}`;
    
    // Add the hard-coded amount to earnings
    addSurveyEarnings(250, 'Tech Premium Survey');
    if (typeof gtag === 'function') {
      gtag('event', 'survey_completed', { 'survey_title': 'Tech Premium Survey', 'survey_reward': 250, 'is_premium': true });
    }
    
    // Record that user has completed a premium survey
    recordSurveyCompletion('tech-premium1', true);
    
    // Start animations
    scale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 200 })
    );
    
    rotate.value = withSequence(
      withTiming(0, { duration: 10 }),
      withTiming(720, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    
    opacity.value = withTiming(1, { duration: 800 });
    
    translateY.value = withDelay(
      300,
      withSpring(0, { damping: 12 })
    );
  }, []);
  
  const goToHome = () => {
    router.replace('/(tabs)');
  };
  
  const viewEarnings = () => {
    router.replace('/(tabs)/earnings');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Confetti />
      
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <CheckCircle size={80} color={Colors.light.success} />
        </Animated.View>
        
        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.title}>Survey Completed!</Text>
          
          <Text style={styles.subtitle}>Thank you for completing this premium survey</Text>
          
          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>You earned:</Text>
            <Text style={styles.rewardAmount}>KES {surveyReward}</Text>
            <Text style={styles.rewardNote}>The amount has been added to your earnings</Text>
          </View>
        </Animated.View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={viewEarnings}
            activeOpacity={0.8}
          >
            <BarChart2 size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>View Earnings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={goToHome}
            activeOpacity={0.8}
          >
            <Home size={20} color={Colors.light.text} />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: isSmallScreen ? 20 : 24,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.s,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: Layout.spacing.l,
  },
  rewardCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.l,
    alignItems: 'center',
    width: '100%',
    marginBottom: Layout.spacing.xl,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  rewardLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs,
  },
  rewardAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: isSmallScreen ? 30 : 36,
    color: Colors.light.success,
    marginBottom: Layout.spacing.s,
  },
  rewardNote: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? Layout.spacing.s : Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: isSmallScreen ? Layout.spacing.s : Layout.spacing.m,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFF',
    marginLeft: Layout.spacing.s,
  },
  secondaryButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: Layout.spacing.s,
  },
});
