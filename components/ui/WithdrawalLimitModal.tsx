import React from 'react';
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
import { ChevronRight, ArrowUpRight, Shield } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring
} from 'react-native-reanimated';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;

// Helper function for responsive font sizes
const getFontSize = (baseSize: number): number => {
  return isSmallScreen ? baseSize - 2 : baseSize;
};

// Helper function for responsive spacing
const getSpacing = (baseSpacing: number): number => {
  return isSmallScreen ? baseSpacing * 0.8 : baseSpacing;
};

interface WithdrawalLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentBalance: number;
}

export default function WithdrawalLimitModal({
  visible,
  onClose,
  onUpgrade,
  currentBalance
}: WithdrawalLimitModalProps) {
  // Animation values
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  
  // Animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));
  
  // Animation when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
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
        <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={28} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>Upgrade Required</Text>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Current Balance</Text>
            <Text style={styles.balanceValue}>KES {currentBalance.toLocaleString()}</Text>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Your account balance is higher than the current withdrawal limit. 
              Upgrade your account to access a higher withdrawal limit and 
              withdraw your full balance.
            </Text>
          </View>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <ArrowUpRight size={16} color={Colors.light.primary} />
              </View>
              <Text style={styles.benefitText}>Higher withdrawal limits</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <ArrowUpRight size={16} color={Colors.light.primary} />
              </View>
              <Text style={styles.benefitText}>Priority processing</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <ArrowUpRight size={16} color={Colors.light.primary} />
              </View>
              <Text style={styles.benefitText}>Access to premium surveys</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Account</Text>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.laterButton}
            onPress={onClose}
          >
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.large,
    padding: getSpacing(Layout.spacing.l),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(85, 108, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(Layout.spacing.s),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(22),
    color: Colors.light.text,
    textAlign: 'center',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
    backgroundColor: 'rgba(85, 108, 214, 0.05)',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.m),
  },
  balanceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.subtext,
    marginBottom: getSpacing(Layout.spacing.xs),
  },
  balanceValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(24),
    color: Colors.light.text,
  },
  messageContainer: {
    marginBottom: getSpacing(Layout.spacing.m),
  },
  messageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(85, 108, 214, 0.05)',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.m),
  },
  benefitsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.s),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.xs),
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(85, 108, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Layout.spacing.s),
  },
  benefitText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(14),
    color: Colors.light.text,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(16),
    color: '#FFF',
    marginRight: getSpacing(Layout.spacing.xs),
  },
  laterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  laterButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.subtext,
  },
});
