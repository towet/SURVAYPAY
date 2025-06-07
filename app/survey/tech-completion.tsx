import React, { useEffect, useState } from 'react';
declare const gtag: (...args: any[]) => void;
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
import { useEarningsStore } from '@/stores/earningsStore';
import { useUserStore } from '@/stores/userStore';

export default function TechSurveyCompletionScreen() {
  const router = useRouter();
  const { addSurveyEarnings } = useEarningsStore();
  const { recordSurveyCompletion } = useUserStore();
  
  // Hard-coded reward amount - this is a REGULAR survey (100 KSH)
  const surveyReward = 100;
  
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
    // Add the survey earnings when the completion screen loads
    const surveyId = Math.floor(Math.random() * 1000).toString();
    const surveyTitle = `Tech Survey Completion #${surveyId}`;
    
    // Add the hard-coded amount to earnings (100 KSH for regular survey)
    addSurveyEarnings(surveyReward, surveyTitle);
    if (typeof gtag === 'function') {
      gtag('event', 'survey_completed', { 'survey_title': surveyTitle, 'survey_reward': surveyReward });
    }
    
    // Record that user has completed a basic survey
    recordSurveyCompletion('tech-survey', false);
    
    // Start animations
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    
    rotate.value = withSequence(
      withSpring(360, { damping: 10 }),
      withDelay(300, withSpring(0))
    );
    
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    
    translateY.value = withDelay(
      300,
      withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    );
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      
      <Confetti />
      
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <CheckCircle size={100} color={Colors.light.success} />
      </Animated.View>
      
      <Animated.View style={[styles.contentContainer, textAnimatedStyle]}>
        <Text style={styles.title}>Survey Completed!</Text>
        
        <Text style={styles.description}>
          Thank you for completing the technology survey. Your responses have been submitted successfully.
        </Text>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>You earned:</Text>
          {/* Hard-coded reward amount - always 100 KSH for this regular survey */}
          <Text style={styles.rewardAmount}>KES 100</Text>
          <Text style={styles.rewardInfo}>
            Your earnings have been added to your account balance.
          </Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Home size={20} color={Colors.light.text} />
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.earningsButton}
            onPress={() => router.replace('/(tabs)/earnings')}
          >
            <BarChart2 size={20} color="#FFF" />
            <Text style={styles.earningsButtonText}>View Earnings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.m,
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: Layout.spacing.xl,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  rewardContainer: {
    backgroundColor: Colors.light.success + '10',
    padding: Layout.spacing.l,
    borderRadius: Layout.borderRadius.large,
    alignItems: 'center',
    width: '100%',
    marginBottom: Layout.spacing.xl,
  },
  rewardLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.s,
  },
  rewardAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.light.success,
    marginBottom: Layout.spacing.s,
  },
  rewardInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: Layout.spacing.m,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.m,
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.m,
  },
  homeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: Layout.spacing.s,
  },
  earningsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.m,
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
  },
  earningsButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFF',
    marginLeft: Layout.spacing.s,
  },
});
