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
import { X, DollarSign, LockIcon, UnlockIcon, ArrowRight, Star } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  withSequence
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

interface EarningsUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  withdrawalThreshold: number;
  onUpgrade: () => void;
  onContinueBasic: () => void;
}

export default function EarningsUpgradeModal({
  visible,
  onClose,
  currentBalance,
  withdrawalThreshold,
  onUpgrade,
  onContinueBasic
}: EarningsUpgradeModalProps) {
  const router = useRouter();
  
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const lockScale = useSharedValue(1);
  const lockRotate = useSharedValue(0);
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }]
    };
  });
  
  const lockAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: lockScale.value },
        { rotateY: `${lockRotate.value}deg` }
      ]
    };
  });
  
  // Use responsive dimensions based on screen size
  
  React.useEffect(() => {
    if (visible) {
      contentOpacity.value = withTiming(1, { duration: 300 });
      contentTranslateY.value = withSpring(0, { damping: 15 });
      
      // Animate the lock with a sequence
      lockScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );
      
      lockRotate.value = withSequence(
        withTiming(0, { duration: 10 }),
        withDelay(300, withTiming(180, { duration: 500 }))
      );
    } else {
      contentOpacity.value = withTiming(0, { duration: 300 });
      contentTranslateY.value = withTiming(50, { duration: 300 });
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
                <Animated.View style={[styles.lockContainer, lockAnimatedStyle]}>
                  <LockIcon size={60} color={Colors.light.accent} />
                </Animated.View>
                
                <Text style={styles.title}>Unlock Full Earnings Access</Text>
                
                <Text style={styles.subtitle}>
                  Upgrade your account to access premium features:
                </Text>
                
                <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <DollarSign size={20} color={Colors.light.primary} />
                  <Text style={styles.featureText}>View your complete earnings dashboard</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <DollarSign size={20} color={Colors.light.primary} />
                  <Text style={styles.featureText}>Withdraw earnings as soon as you reach 1000 KSH (premium users)</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <DollarSign size={20} color={Colors.light.primary} />
                  <Text style={styles.featureText}>Get paid within 24 hours (premium users)</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Star size={20} color={Colors.light.primary} />
                  <Text style={styles.featureText}>10% earnings bonus on all surveys (Classic plan)</Text>
                </View>
              </View>
              
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceTitle}>Your current balance:</Text>
                <Text style={styles.balanceAmount}>KES {currentBalance.toFixed(2)}</Text>
                <Text style={styles.balanceNote}>
                  {currentBalance < withdrawalThreshold 
                    ? `You need KES ${(withdrawalThreshold - currentBalance).toFixed(2)} more to withdraw.`
                    : 'You have reached the withdrawal threshold!'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={onUpgrade}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade Account
                </Text>
                <ArrowRight size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.basicButton}
                onPress={onContinueBasic}
                activeOpacity={0.8}
              >
                <Text style={styles.basicButtonText}>
                  Continue with Basic Account
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.note}>
                Basic users can withdraw earnings after reaching KES {withdrawalThreshold} threshold
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
    padding: 0, // Remove padding since we'll use ScrollView
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
  lockContainer: {
    width: isSmallScreen ? 80 : 100,
    height: isSmallScreen ? 80 : 100,
    borderRadius: isSmallScreen ? 40 : 50,
    backgroundColor: Colors.light.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
    borderWidth: 2,
    borderColor: Colors.light.accent + '30',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: getFontSize(22),
    color: Colors.light.text,
    marginTop: getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.s),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.subtext,
    marginBottom: isSmallScreen ? Layout.spacing.m : Layout.spacing.l,
    textAlign: 'center',
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
  balanceContainer: {
    width: '100%',
    backgroundColor: Colors.light.primary + '15',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(isSmallScreen ? Layout.spacing.m : Layout.spacing.l),
    marginVertical: getSpacing(Layout.spacing.m),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
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
    color: Colors.light.primary,
    marginBottom: getSpacing(Layout.spacing.s),
  },
  balanceNote: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#1E88E5', // Brighter blue for better visibility
    paddingVertical: getSpacing(isSmallScreen ? Layout.spacing.m : Layout.spacing.l),
    borderRadius: Layout.borderRadius.medium,
    marginVertical: getSpacing(Layout.spacing.m),
    // Make button pop with shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 0,
  },
  upgradeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: getFontSize(isSmallScreen ? 16 : 18),
    color: '#FFFFFF',
    marginRight: getSpacing(Layout.spacing.s),
  },
  basicButton: {
    width: '100%',
    paddingVertical: getSpacing(isSmallScreen ? Layout.spacing.s : Layout.spacing.m),
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
    backgroundColor: Colors.light.background,
  },
  basicButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.text,
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
