import React, { useState, useEffect } from 'react';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Animated
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { X, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import type { AccountType } from '@/types';

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

interface PackageTransactionCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onVerificationComplete: (packageType: 'premium' | 'elite') => void;
  packageType: 'premium' | 'elite';
}

export default function PackageTransactionCodeModal({
  visible,
  onClose,
  onVerificationComplete,
  packageType
}: PackageTransactionCodeModalProps) {
  const [transactionCode, setTransactionCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'' | 'success' | 'error'>('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const { setAccountType } = useUserStore();
  
  // Animation values
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;
  const successScale = React.useRef(new Animated.Value(0)).current;
  
  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setTransactionCode('');
      setVerificationStatus('');
      setVerificationMessage('');
      setShowCloseWarning(false);
    }
  }, [visible]);
  
  // Animation when verification fails
  useEffect(() => {
    if (verificationStatus === 'error') {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [verificationStatus]);

  // Animation when verification succeeds
  useEffect(() => {
    if (verificationStatus === 'success') {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true
      }).start();
      
      // Auto-close after success
      const timer = setTimeout(() => {
        // Update account type based on package
        // Converting 'elite' to 'premium' since AccountType doesn't include 'elite'
        setAccountType(packageType === 'premium' ? 'premium' : 'premium');
        onVerificationComplete(packageType);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      successScale.setValue(0);
    }
  }, [verificationStatus]);
  
  const handleVerify = async () => {
    Keyboard.dismiss();
    setIsVerifying(true);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!transactionCode.trim()) {
      setVerificationStatus('error');
      setVerificationMessage('Please enter your M-Pesa transaction code');
      setIsVerifying(false);
      return;
    }
    
    // Check if transaction code starts with T and is at least 6 characters
    if (!transactionCode.trim().startsWith('T') || transactionCode.trim().length < 6) {
      setVerificationStatus('error');
      setVerificationMessage('Invalid transaction code. Code should start with T and be at least 6 characters');
      setIsVerifying(false);
      return;
    }
    
    // Simulate API verification check
    try {
      // Here you would normally make an API call to verify the transaction code
      // For demo purposes, we're just approving any valid code format
      
      // Success case
      setVerificationStatus('success');
      setVerificationMessage(`${packageType === 'premium' ? 'Premium' : 'Elite'} package activated successfully!`);
      setIsVerifying(false);
    } catch (error) {
      console.error('Error verifying transaction code:', error);
      setVerificationStatus('error');
      setVerificationMessage('There was an error verifying your transaction. Please try again.');
      setIsVerifying(false);
    }
  };
  
  const handleCloseAttempt = () => {
    if (transactionCode.trim() && verificationStatus !== 'success') {
      setShowCloseWarning(true);
    } else {
      onClose();
    }
  };
  
  const handleConfirmClose = () => {
    setShowCloseWarning(false);
    onClose();
  };
  
  const handleContinueVerification = () => {
    setShowCloseWarning(false);
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseAttempt}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {!showCloseWarning ? (
            // Main verification content
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Verify Payment</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseAttempt}
                >
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.subtitle}>
                Enter your M-Pesa transaction code to activate your {packageType === 'premium' ? 'Premium' : 'Elite'} package
              </Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Please check your M-Pesa message for the transaction code. It usually starts with 'T' and is followed by numbers and letters.
                </Text>
              </View>
              
              <Animated.View
                style={[
                  styles.inputContainer,
                  verificationStatus === 'error' && styles.inputError,
                  { transform: [{ translateX: shakeAnimation }] }
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ZXVDZ5RCD"
                  placeholderTextColor={Colors.light.subtext}
                  value={transactionCode}
                  onChangeText={setTransactionCode}
                  autoCapitalize="characters"
                  editable={!isVerifying && verificationStatus !== 'success'}
                />
              </Animated.View>
              
              {verificationStatus === 'error' && (
                <View style={styles.errorContainer}>
                  <AlertCircle
                    size={20}
                    color={Colors.light.error}
                    style={{ marginRight: getSpacing(Layout.spacing.xs) }}
                  />
                  <Text style={styles.errorText}>{verificationMessage}</Text>
                </View>
              )}
              
              {verificationStatus === 'success' && (
                <Animated.View
                  style={[
                    styles.successContainer,
                    { transform: [{ scale: successScale }] }
                  ]}
                >
                  <CheckCircle
                    size={20}
                    color={Colors.light.success}
                    style={{ marginRight: getSpacing(Layout.spacing.xs) }}
                  />
                  <Text style={styles.successText}>{verificationMessage}</Text>
                </Animated.View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (isVerifying || verificationStatus === 'success') && styles.verifyButtonDisabled
                ]}
                onPress={handleVerify}
                disabled={isVerifying || verificationStatus === 'success'}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {verificationStatus === 'success' ? 'Verified' : 'Verify Transaction'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.helpText}>
                Having trouble? Contact our support team for assistance.
              </Text>
            </>
          ) : (
            // Warning when trying to close with unsaved data
            <View style={styles.warningContainer}>
              <AlertCircle
                size={48}
                color={Colors.light.warning}
                style={styles.warningIcon}
              />
              <Text style={styles.warningTitle}>Abandon Verification?</Text>
              <Text style={styles.warningText}>
                Your transaction verification is in progress. If you exit now, your {packageType === 'premium' ? 'Premium' : 'Elite'} package will not be activated.
              </Text>
              <View style={styles.warningButtons}>
                <TouchableOpacity
                  style={[styles.warningButton, styles.primaryButton, styles.fullWidthButton]}
                  onPress={handleContinueVerification}
                >
                  <Text style={styles.primaryButtonText}>Continue Verification</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Define verification status type
type VerificationStatusType = '' | 'success' | 'error';

// Use regular StyleSheet without type constraint
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
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(22),
    color: Colors.light.text,
  },
  closeButton: {
    padding: getSpacing(Layout.spacing.xs),
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.subtext,
    marginBottom: getSpacing(Layout.spacing.m),
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 255, 0.05)',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.m),
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(14),
    color: Colors.light.primary,
    lineHeight: 20,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    height: 55,
    marginBottom: getSpacing(Layout.spacing.m),
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    paddingHorizontal: getSpacing(Layout.spacing.m),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.error,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.m),
  },
  successText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.success,
    flex: 1,
  },
  verifyButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(Layout.spacing.m),
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.light.subtext,
    opacity: 0.8,
  },
  verifyButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(16),
    color: '#FFF',
  },
  helpText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(14),
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  // Warning modal styles
  warningContainer: {
    alignItems: 'center',
    padding: getSpacing(Layout.spacing.m),
  },
  warningIcon: {
    marginBottom: getSpacing(Layout.spacing.m),
  },
  warningTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(20),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.s),
    textAlign: 'center',
  },
  warningText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: getSpacing(Layout.spacing.l),
  },
  warningButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  warningButton: {
    borderRadius: Layout.borderRadius.medium,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: getSpacing(Layout.spacing.xs),
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(16),
    color: '#FFF',
  },
  fullWidthButton: {
    width: '100%',
    marginHorizontal: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.text,
  },
});
