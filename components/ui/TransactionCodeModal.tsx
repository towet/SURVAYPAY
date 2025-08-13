import React, { useState, useEffect } from 'react';
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
import { useAuthStore } from '@/stores/authStore';

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

interface TransactionCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

export default function TransactionCodeModal({
  visible,
  onClose,
  onVerificationComplete
}: TransactionCodeModalProps) {
  const [transactionCode, setTransactionCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'success' | 'error'>('none');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const { updateProfile } = useAuthStore();
  
  // Animation values
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;
  const successScale = React.useRef(new Animated.Value(0)).current;
  
  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setTransactionCode('');
      setVerificationStatus('none');
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
        onVerificationComplete();
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
      setVerificationMessage('Invalid activation code. Code should start with T and be at least 6 characters');
      setIsVerifying(false);
      return;
    }
    
    // Success case
    setVerificationStatus('success');
    setVerificationMessage('Account activated successfully!');
    setIsVerifying(false);
    
    // Update user profile to set account as activated
    try {
      await updateProfile({ isAccountActivated: true });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const handleCloseAttempt = () => {
    if (verificationStatus !== 'success') {
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
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCloseAttempt}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {!showCloseWarning ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Verify Transaction</Text>
                <TouchableOpacity onPress={handleCloseAttempt} style={styles.closeButton}>
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.subtitle}>
                Paste your M-Pesa transaction code to complete activation
              </Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  You will receive an STK push message on your phone. 
                  After completing the payment, paste the transaction code here.
                </Text>
              </View>
              
              <Animated.View style={[
                styles.inputContainer, 
                verificationStatus === 'error' && styles.inputError,
                { transform: [{ translateX: shakeAnimation }] }
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ZXVDZ5RCD"
                  placeholderTextColor={Colors.light.subtext}
                  value={transactionCode}
                  onChangeText={setTransactionCode}
                  autoCapitalize="characters"
                />
              </Animated.View>
              
              {verificationStatus === 'error' && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={18} color={Colors.light.error} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{verificationMessage}</Text>
                </View>
              )}
              
              {verificationStatus === 'success' && (
                <Animated.View style={[
                  styles.successContainer,
                  { transform: [{ scale: successScale }] }
                ]}>
                  <CheckCircle size={24} color={Colors.light.success} style={{ marginRight: 8 }} />
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
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    {verificationStatus === 'success' ? 'Verified' : 'Verify Code'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.helpText}>
                Your transaction code can be found in the M-Pesa confirmation message
              </Text>
            </>
          ) : (
            // Close warning view
            <View style={styles.warningContainer}>
              <AlertCircle size={48} color={Colors.light.warning} style={styles.warningIcon} />
              
              <Text style={styles.warningTitle}>Wait! Complete Activation</Text>
              
              <Text style={styles.warningText}>
                You haven't completed your account activation yet. Are you sure you want to exit?
              </Text>
              
              <View style={styles.warningButtons}>
                <TouchableOpacity 
                  style={[styles.warningButton, styles.primaryButton, styles.fullWidthButton]} 
                  onPress={handleContinueVerification}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.large,
    padding: getSpacing(Layout.spacing.l),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 5,
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
    backgroundColor: verificationStatus => 
      verificationStatus === 'success' ? Colors.light.success : Colors.light.subtext,
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
