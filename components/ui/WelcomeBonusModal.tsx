import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Image
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { PartyPopper, Gift, ChevronRight, Star } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;

interface WelcomeBonusModalProps {
  visible: boolean;
  onClose: () => void;
  bonusAmount: number;
}

export default function WelcomeBonusModal({
  visible,
  onClose,
  bonusAmount
}: WelcomeBonusModalProps) {
  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const amountScale = useSharedValue(1);
  const starRotate = useSharedValue(0);
  const backgroundColorAnim = useSharedValue(0);
  
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
  
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backgroundColorAnim.value,
      [0, 0.5, 1],
      ['rgba(116, 68, 255, 0.03)', 'rgba(77, 204, 163, 0.08)', 'rgba(116, 68, 255, 0.03)']
    ),
  }));
  
  // Play haptic feedback when modal becomes visible
  useEffect(() => {
    if (visible) {
      console.log('WelcomeBonusModal visible - starting animations');
      // Immediately trigger haptic feedback for better user awareness
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Start animations immediately with faster timing
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 10, stiffness: 120 }); // More bouncy animation
      confettiOpacity.value = withTiming(1, { duration: 300 }); // Show confetti faster
      
      // More dramatic pulse animation for the amount
      amountScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        4, // More repetitions
        false
      );
      
      // Faster rotating stars
      starRotate.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
      
      // More vibrant background color animation
      backgroundColorAnim.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      // Add a second haptic feedback after a short delay for additional emphasis
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 500);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible]);
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, containerStyle]}>
          <Animated.View style={[styles.confettiContainer, confettiStyle]}>
            {/* Confetti elements positioned absolutely */}
            <Animated.View style={[styles.star, { top: 10, left: 30 }, starStyle]}>
              <Star size={24} color="#FFD700" fill="#FFD700" />
            </Animated.View>
            <Animated.View style={[styles.star, { top: 60, right: 40 }, starStyle]}>
              <Star size={16} color="#FF6B6B" fill="#FF6B6B" />
            </Animated.View>
            <Animated.View style={[styles.star, { bottom: 40, left: 50 }, starStyle]}>
              <Star size={20} color="#4DCC83" fill="#4DCC83" />
            </Animated.View>
          </Animated.View>
          
          <Animated.View style={[styles.modalContent, backgroundStyle]}>
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
                  {bonusAmount}
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Start Earning</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 340,
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    zIndex: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
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
