import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/Colors';
import { PartyPopper, Gift, ChevronRight, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeBonusScreen() {
  const router = useRouter();
  
  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const amountScale = useSharedValue(1);
  const starRotate = useSharedValue(0);
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));
  
  const amountStyle = useAnimatedStyle(() => ({
    transform: [{ scale: amountScale.value }],
  }));
  
  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotate.value}deg` }],
  }));
  
  // Start animations when the screen mounts
  useEffect(() => {
    // Play haptic feedback only on native platforms
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    
    // Start animations
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
    confettiOpacity.value = withTiming(1, { duration: 300 });
    
    // Pulse animation for the amount
    amountScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      4,
      false
    );
    
    // Rotate stars
    starRotate.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Add a second haptic feedback after a short delay, only on native platforms
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          console.log('Haptics not available:', error);
        }
      }, 500);
    }
  }, []);
  
  const handleContinue = () => {
    // Only use haptics on native platforms
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    router.replace('/auth/login');
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.confettiContainer}>
        <Animated.View style={[styles.star, { top: 100, left: 30 }, starStyle]}>
          <Star size={24} color="#FFD700" fill="#FFD700" />
        </Animated.View>
        <Animated.View style={[styles.star, { top: 200, right: 40 }, starStyle]}>
          <Star size={16} color="#FF6B6B" fill="#FF6B6B" />
        </Animated.View>
        <Animated.View style={[styles.star, { bottom: 300, left: 50 }, starStyle]}>
          <Star size={20} color="#4DCC83" fill="#4DCC83" />
        </Animated.View>
      </View>
      
      <Animated.View style={[styles.card, containerStyle]}>
        <View style={styles.header}>
          <PartyPopper size={28} color={Colors.light.primary} />
          <Text style={styles.title}>Congratulations!</Text>
        </View>
        
        <LinearGradient
          colors={['rgba(116, 68, 255, 0.1)', 'rgba(116, 68, 255, 0.05)']}
          style={styles.bonusContainer}
        >
          <View style={styles.iconContainer}>
            <Gift size={40} color={Colors.light.primary} />
          </View>
          
          <Text style={styles.welcomeText}>Welcome Bonus</Text>
          
          <Animated.View style={amountStyle}>
            <Text style={styles.amountText}>
              <Text style={styles.currency}>KSH </Text>
              250
            </Text>
          </Animated.View>
          
          <Text style={styles.description}>
            We've added a signup bonus to your account!
          </Text>
        </LinearGradient>
        
        <Text style={styles.messageText}>
          Start exploring and completing surveys to earn more rewards.
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue to Login</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    zIndex: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: Colors.light.text,
    marginLeft: 12,
  },
  bonusContainer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(116, 68, 255, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 8,
  },
  amountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: Colors.light.primary,
    marginBottom: 16,
  },
  currency: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  messageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFF',
    fontSize: 16,
    marginRight: 8,
  },
});
