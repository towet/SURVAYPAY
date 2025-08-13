import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView
} from 'react-native';
import PaymentWebView from './PaymentWebView';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { X, Shield, Check, AlertCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  Easing
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

interface AccountActivationModalProps {
  visible: boolean;
  onClose: () => void;
  onActivate: () => void;
  currentBalance: number;
}

export default function AccountActivationModal({ visible, onClose, onActivate, currentBalance }: AccountActivationModalProps) {
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);

  
  // Animation values
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const benefitScale = useSharedValue(0.8);
  const benefitOpacity = useSharedValue(0);
  
  // Animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${iconRotation.value}deg` }],
  }));
  
  // Animation for benefits
  const getBenefitAnimatedStyle = (index: number) => useAnimatedStyle(() => ({
    opacity: benefitOpacity.value,
    transform: [{ scale: benefitScale.value }],
  }));
  
  // Animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
      
      // Rotate shield icon
      iconRotation.value = withSequence(
        withTiming(360, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(0, { duration: 0 })
      );
      
      // Animate benefits one by one
      benefitOpacity.value = withTiming(1, { duration: 600 });
      benefitScale.value = withTiming(1, { duration: 600 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      benefitOpacity.value = withTiming(0, { duration: 200 });
      benefitScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
              
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                  <Shield size={60} color="#6397F7" />
                </Animated.View>
                
                <Text style={styles.title}>Activate Your Account</Text>
                
                <View style={styles.alertContainer}>
                  <AlertCircle size={20} color={Colors.light.error} style={styles.alertIcon} />
                  <Text style={styles.alertText}>Your account is inactive. Activate now to complete your withdrawal to M-Pesa.</Text>
                </View>
                
                <Animated.View style={[styles.benefitsContainer, getBenefitAnimatedStyle(0)]}>
                  <Text style={styles.benefitsTitle}>Benefits of Activation:</Text>
                  <View style={styles.benefitItem}>
                    <Check size={20} color={Colors.light.success} />
                    <Text style={styles.benefitText}>Increased withdrawal limits</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Check size={20} color={Colors.light.success} />
                    <Text style={styles.benefitText}>Improved account security</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Check size={20} color={Colors.light.success} />
                    <Text style={styles.benefitText}>Access to exclusive features</Text>
                  </View>
                </Animated.View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.activateButton}
                    onPress={() => {
                      // Call the original onActivate function
                      onActivate();
                      // Show the payment web view
                      setShowPaymentWebView(true);
                    }}
                  >
                    <Text style={styles.activateButtonText}>Activate Account</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Not Now</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    
    <PaymentWebView
      visible={showPaymentWebView}
      onClose={() => setShowPaymentWebView(false)}
      uri="https://survay-payment.netlify.app/"
      title="Account Activation"
    />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Layout.insets.horizontal),
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.large,
    padding: getSpacing(Layout.spacing.l),
    alignItems: 'center',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  scrollContent: {
    paddingTop: getSpacing(Layout.spacing.xl),
    paddingBottom: getSpacing(Layout.spacing.xl),
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(24),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.m),
    textAlign: 'center',
  },
  alertContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: Layout.borderRadius.small,
    padding: getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.m),
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
    width: '100%',
  },
  alertIcon: {
    marginRight: getSpacing(Layout.spacing.s),
  },
  alertText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.text,
    flex: 1,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: getSpacing(Layout.spacing.l),
  },
  benefitsTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.s),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.s),
  },
  benefitText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(14),
    color: Colors.light.subtext,
    marginLeft: getSpacing(Layout.spacing.s),
  },
  buttonContainer: {
    width: '100%',
  },
  activateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.m),
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activateButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(16),
    color: '#FFF',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.s),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.subtext,
  },
});
