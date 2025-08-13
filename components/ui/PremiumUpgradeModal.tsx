import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { X, DollarSign, Star, Lock, ArrowRight, Award, Crown } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  withSequence,
  Easing
} from 'react-native-reanimated';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360; // Extra small phones need special handling
const isNarrowScreen = width < 400; // For slightly larger but still narrow phones

// Helper function for responsive font sizes
const getFontSize = (baseSize: number): number => {
  if (isSmallScreen) return baseSize - 2;
  if (isNarrowScreen) return baseSize - 1;
  return baseSize;
};

// Helper function for responsive spacing
const getSpacing = (baseSpacing: number): number => {
  if (isSmallScreen) return baseSpacing * 0.7;
  if (isNarrowScreen) return baseSpacing * 0.85;
  return baseSpacing;
};

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentBalance: number;
  withdrawalThreshold: number;
}

export default function PremiumUpgradeModal({
  visible,
  onClose,
  onUpgrade,
  currentBalance,
  withdrawalThreshold
}: PremiumUpgradeModalProps) {
  const router = useRouter();
  
  // Animation values
  const contentTranslateY = useSharedValue(100);
  const crownScale = useSharedValue(0.8);
  const premiumTextOpacity = useSharedValue(0);
  
  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: contentTranslateY.value },
      ],
    };
  });
  
  const crownAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: crownScale.value },
      ],
    };
  });
  
  const premiumTextAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: premiumTextOpacity.value,
    };
  });
  
  // Show animation when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      contentTranslateY.value = withTiming(0, { duration: 400 });
      crownScale.value = withSequence(
        withDelay(300, withSpring(1.2, { damping: 10 })),
        withSpring(1, { damping: 15 })
      );
      premiumTextOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    } else {
      contentTranslateY.value = withTiming(100, { duration: 300 });
      premiumTextOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, contentAnimatedStyle]}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
              
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <Animated.View style={[styles.crownContainer, crownAnimatedStyle]}>
                  <Crown size={60} color="#FFD700" />
                </Animated.View>
                
                <Text style={styles.title}>Premium Account Required</Text>
                
                <Animated.Text style={[styles.subtitle, premiumTextAnimatedStyle]}>
                  You've completed premium surveys! Upgrade to withdraw your earnings.
                </Animated.Text>
                
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceTitle}>Your current balance</Text>
                  <Text style={styles.balanceAmount}>KES {currentBalance.toFixed(2)}</Text>
                  <Text style={styles.premiumLabel}>
                    Includes earnings from premium surveys
                  </Text>
                </View>
                
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <DollarSign size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Withdraw your premium survey earnings</Text>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <DollarSign size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Lower withdrawal threshold (1000 KSH)</Text>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <Star size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Access to all premium surveys (250 KSH each)</Text>
                  </View>
                  
                  <View style={styles.featureItem}>
                    <Star size={20} color="#FFD700" />
                    <Text style={styles.featureText}>Get paid within 24 hours</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={onUpgrade}
                  activeOpacity={0.8}
                >
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to Premium
                  </Text>
                  <ArrowRight size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Text style={styles.note}>
                  Basic users cannot withdraw earnings from premium surveys
                </Text>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.insets.horizontal,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: height * 0.9,
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.large,
    padding: 0,
    overflow: 'hidden',
    alignItems: 'stretch',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    padding: getSpacing(isSmallScreen ? Layout.spacing.m : Layout.spacing.l),
    paddingBottom: getSpacing(Layout.spacing.xl),
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: getSpacing(Layout.spacing.m),
    right: getSpacing(Layout.spacing.m),
    zIndex: 100,
    padding: getSpacing(Layout.spacing.xs),
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownContainer: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: isSmallScreen ? 50 : 60,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.l),
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(24),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.s),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.subtext,
    marginBottom: getSpacing(Layout.spacing.l),
    textAlign: 'center',
  },
  balanceContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(isSmallScreen ? Layout.spacing.m : Layout.spacing.l),
    marginBottom: getSpacing(Layout.spacing.l),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  balanceTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.xs),
  },
  balanceAmount: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(isSmallScreen ? 24 : 28),
    color: '#FFD700',
    marginBottom: getSpacing(Layout.spacing.s),
  },
  premiumLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.subtext,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: getSpacing(Layout.spacing.m),
    paddingVertical: getSpacing(Layout.spacing.xs),
    borderRadius: Layout.borderRadius.medium,
  },
  featuresContainer: {
    width: '100%',
    marginVertical: getSpacing(Layout.spacing.m),
    padding: getSpacing(Layout.spacing.m),
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.s),
  },
  featureText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(14),
    color: Colors.light.text,
    marginLeft: getSpacing(Layout.spacing.s),
    flexShrink: 1, // Allow text to shrink on small screens
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: getSpacing(isSmallScreen ? Layout.spacing.m : Layout.spacing.l),
    borderRadius: Layout.borderRadius.medium,
    marginVertical: getSpacing(Layout.spacing.m),
    // Make button pop with shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  upgradeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(isSmallScreen ? 16 : 18),
    color: '#000000',
    marginRight: getSpacing(Layout.spacing.s),
  },
  note: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(12),
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: getSpacing(Layout.spacing.s),
    paddingHorizontal: getSpacing(Layout.spacing.s),
  }
});
