import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
import { getCorrectReward } from '@/utils/surveyUtils';

export default function SurveyCompletionScreen() {
  const { reward, isPremium } = useLocalSearchParams();
  const router = useRouter();
  const { addSurveyEarnings, currentBalance, totalEarned } = useEarningsStore();
  const [newTotalBalance, setNewTotalBalance] = useState(0);
  
  // ALWAYS enforce the correct reward based on survey type using our utility function
  // This guarantees premium surveys are 250 KSH and regular surveys are 100 KSH
  // regardless of what was passed in the URL or direct access
  // First convert the isPremium parameter to a definitive boolean
  // Need to handle potential string array from URL params
  const isPremiumString = typeof isPremium === 'string' ? isPremium : Array.isArray(isPremium) ? isPremium[0] : 'false';
  const isPremiumBool = isPremiumString === 'true';
  // Then get the correct reward amount - hardcoded values to match business requirements
  const surveyReward = isPremiumBool ? 250 : 100;
  
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
    // Get a generic survey ID or name for the transaction
    const surveyId = Math.floor(Math.random() * 1000).toString();
    const surveyTitle = `Survey Completion #${surveyId}`;
    
    // Add earnings to the store using hard-coded correct values based on premium status
    // This ensures the right amount is always added regardless of URL params
    const correctRewardAmount = isPremiumString === 'true' ? 250 : 100;
    addSurveyEarnings(correctRewardAmount, surveyTitle);
    
    // Store the new total balance including the welcome bonus and all previous earnings
    setNewTotalBalance(currentBalance);
    
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
          Thank you for completing the survey. Your responses have been submitted successfully.
        </Text>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>You earned:</Text>
          {/* Hard-coded reward amount based on premium status */}
          <Text style={styles.rewardAmount}>KES {isPremiumString === 'true' ? 250 : 100}</Text>
          <Text style={styles.rewardInfo}>
            Your earnings have been added to your account balance.
          </Text>
          <View style={styles.totalBalanceContainer}>
            <Text style={styles.totalBalanceLabel}>Current Balance:</Text>
            <Text style={styles.totalBalanceAmount}>KES {newTotalBalance.toLocaleString()}</Text>
          </View>
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
  totalBalanceContainer: {
    marginTop: Layout.spacing.m,
    paddingTop: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    width: '100%',
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs,
  },
  totalBalanceAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.primary,
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
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: Layout.spacing.m,
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
    backgroundColor: Colors.light.primary,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
  },
  earningsButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFF',
    marginLeft: Layout.spacing.s,
  },
});