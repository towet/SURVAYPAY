import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Colors from '@/constants/Colors';
import { Gift, CheckCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withSpring,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface BonusPopupProps {
  visible: boolean;
  amount: number;
  onClose: () => void;
}

export default function BonusPopup({ visible, amount, onClose }: BonusPopupProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const amountScale = useSharedValue(1);
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const amountStyle = useAnimatedStyle(() => ({
    transform: [{ scale: amountScale.value }],
  }));
  
  // Start animations when visible changes
  useEffect(() => {
    if (visible) {
      // Fade in and scale up
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12 });
      
      // Pulse animation for the amount
      amountScale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.2, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
      );
    } else {
      // Fade out and scale down
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, containerStyle]}>
        <View style={styles.iconContainer}>
          <Gift size={32} color="#FFF" />
        </View>
        
        <Text style={styles.title}>Welcome Bonus!</Text>
        
        <Animated.View style={amountStyle}>
          <Text style={styles.amount}>
            <Text style={styles.currency}>KSH </Text>
            {amount}
          </Text>
        </Animated.View>
        
        <Text style={styles.message}>
          You've received a welcome bonus in your account!
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <CheckCircle size={20} color="#FFF" />
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFF',
    width: width * 0.85,
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: 8,
  },
  amount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: Colors.light.primary,
    marginVertical: 12,
  },
  currency: {
    fontSize: 20,
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFF',
    marginLeft: 8,
  },
});
