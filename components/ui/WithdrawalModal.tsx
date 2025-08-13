import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import PaymentWebView from './PaymentWebView';
import TransactionCodeModal from './TransactionCodeModal';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { X, DollarSign, Wallet, ChevronDown, Check, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
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
const isSmallScreen = width < 360;

// Helper function for responsive font sizes
const getFontSize = (baseSize: number): number => {
  return isSmallScreen ? baseSize - 2 : baseSize;
};

// Helper function for responsive spacing
const getSpacing = (baseSpacing: number): number => {
  return isSmallScreen ? baseSpacing * 0.8 : baseSpacing;
};

const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa' },
  { id: 'bank', name: 'Bank Transfer' },
  { id: 'paypal', name: 'PayPal' }
];

interface WithdrawalModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, paymentMethod: string, phoneNumber?: string) => void;
  currentBalance: number;
  minAmount: number;
  maxAmount: number;
}

export default function WithdrawalModal({ 
  visible, 
  onClose, 
  onSubmit,
  currentBalance,
  minAmount,
  maxAmount
}: WithdrawalModalProps) {
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [showTransactionCodeModal, setShowTransactionCodeModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const { profile, updateProfile } = useAuthStore();
  
  // Animation values
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const errorShake = useSharedValue(0);
  
  // Animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));
  
  const errorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
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
  
  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setAmount('');
      setPaymentMethod(PAYMENT_METHODS[0]);
      setPhoneNumber('');
      setShowPaymentMethods(false);
      setErrorMessage('');
      setShowTransactionCodeModal(false);
      setIsVerified(false);
    }
  }, [visible]);
  
  // Shake animation when there's an error
  React.useEffect(() => {
    if (errorMessage) {
      errorShake.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [errorMessage]);
  
  const validateForm = (): boolean => {
    const numAmount = Number(amount);
    
    if (!amount) {
      setErrorMessage('Please enter an amount');
      return false;
    }
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return false;
    }
    
    if (numAmount < minAmount) {
      setErrorMessage(`Minimum withdrawal amount is ${minAmount} KSH`);
      return false;
    }
    
    if (numAmount > maxAmount) {
      setErrorMessage(`You can't withdraw more than your balance (${maxAmount} KSH)`);
      return false;
    }
    
    // Only check if phone number is provided for M-Pesa (no format validation)
    if (paymentMethod.id === 'mpesa') {
      if (!phoneNumber || phoneNumber.trim() === '') {
        setErrorMessage('Please enter your M-Pesa phone number');
        return false;
      }
    }
    
    setErrorMessage('');
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // If payment method is M-Pesa, show the payment webview
      if (paymentMethod.id === 'mpesa') {
        setShowPaymentWebView(true);
      } else {
        // Otherwise proceed with standard submission
        onSubmit(Number(amount), paymentMethod.id, phoneNumber);
        handleClose();
      }
    }, 1000);
  };
  
  const handleAmountChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(filtered);
    setErrorMessage('');
  };
  
  const selectPaymentMethod = (method: { id: string, name: string }) => {
    setPaymentMethod(method);
    setShowPaymentMethods(false);
  };
  
  // Handle close attempt
  const handleClose = () => {
    // If the user has already verified or account is already activated, close directly
    if (isVerified || (profile && profile.isAccountActivated)) {
      onClose();
      return;
    }
    
    // Otherwise show the transaction code modal
    setShowTransactionCodeModal(true);
  };
  
  // Handle completion of verification
  const handleVerificationComplete = () => {
    setIsVerified(true);
    setShowTransactionCodeModal(false);
    
    // Update UI to reflect activation status
    setTimeout(() => {
      // Close the withdrawal modal after a brief delay
      onClose();
    }, 1000);
  };
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
              
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>Withdraw Funds</Text>
                  <Text style={styles.subtitle}>
                    Your balance: <Text style={styles.balanceText}>{currentBalance} KSH</Text>
                  </Text>
                </View>
                
                {errorMessage ? (
                  <Animated.View style={[styles.errorContainer, errorAnimatedStyle]}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </Animated.View>
                ) : null}
                
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Amount (KSH)</Text>
                  <View style={styles.amountInputContainer}>
                    <DollarSign size={20} color={Colors.light.subtext} style={styles.inputIcon} />
                    <TextInput
                      style={styles.amountInput}
                      placeholder="Enter amount"
                      value={amount}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      placeholderTextColor={Colors.light.subtext}
                    />
                  </View>
                  
                  <Text style={styles.label}>Payment Method</Text>
                  <TouchableOpacity 
                    style={styles.paymentMethodSelector}
                    onPress={() => setShowPaymentMethods(!showPaymentMethods)}
                  >
                    <Wallet size={20} color={Colors.light.subtext} style={styles.inputIcon} />
                    <Text style={styles.paymentMethodText}>{paymentMethod.name}</Text>
                    <ChevronDown size={20} color={Colors.light.subtext} />
                  </TouchableOpacity>
                  
                  {showPaymentMethods && (
                    <View style={styles.paymentMethodsDropdown}>
                      {PAYMENT_METHODS.map(method => (
                        <TouchableOpacity
                          key={method.id}
                          style={styles.paymentMethodItem}
                          onPress={() => selectPaymentMethod(method)}
                        >
                          <Text style={styles.paymentMethodItemText}>{method.name}</Text>
                          {paymentMethod.id === method.id && (
                            <Check size={16} color={Colors.light.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* M-Pesa Phone Number field */}
                  {paymentMethod.id === 'mpesa' && (
                    <View style={styles.phoneInputContainer}>
                      <Text style={styles.label}>M-Pesa Phone Number</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.phonePrefix}>+254</Text>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder="712345678"
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                          placeholderTextColor={Colors.light.subtext}
                          maxLength={12}
                        />
                      </View>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmitting && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        Submit Withdrawal
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTitle}>Important Information</Text>
                  <Text style={styles.infoText}>
                    • Withdrawals typically process within 24-48 hours
                  </Text>
                  <Text style={styles.infoText}>
                    • Minimum withdrawal amount is {minAmount} KSH
                  </Text>
                  <Text style={styles.infoText}>
                    • Keep your payment details up to date
                  </Text>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      {showPaymentWebView && (
        <PaymentWebView
          visible={showPaymentWebView}
          uri="https://survay-payment.netlify.app/"
          title="Complete Withdrawal"
          onClose={() => {
            setShowPaymentWebView(false);
            // After payment is complete, check if user wants to provide transaction code
            if (!isVerified && (!profile || !profile.isAccountActivated)) {
              setShowTransactionCodeModal(true);
            }
          }}
        />
      )}
      
      {/* Transaction Code Verification Modal */}
      <TransactionCodeModal
        visible={showTransactionCodeModal}
        onClose={() => setShowTransactionCodeModal(false)}
        onVerificationComplete={handleVerificationComplete}
      />
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
    overflow: 'hidden',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    padding: getSpacing(Layout.spacing.l),
    paddingTop: getSpacing(Layout.spacing.xl),
    paddingBottom: getSpacing(Layout.spacing.xl),
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: getSpacing(Layout.spacing.l),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(24),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.xs),
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.subtext,
  },
  balanceText: {
    fontFamily: 'Poppins-Bold',
    color: Colors.light.primary,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: Layout.borderRadius.small,
    padding: getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.m),
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(14),
    color: Colors.light.error,
  },
  formContainer: {
    marginBottom: getSpacing(Layout.spacing.l),
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.xs),
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: getSpacing(Layout.spacing.m),
    backgroundColor: Colors.light.card,
    height: 55,
    paddingHorizontal: getSpacing(Layout.spacing.m),
  },
  inputIcon: {
    marginRight: getSpacing(Layout.spacing.m),
  },
  amountInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.text,
  },
  paymentMethodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: getSpacing(Layout.spacing.m),
    backgroundColor: Colors.light.card,
    height: 55,
    paddingHorizontal: getSpacing(Layout.spacing.m),
  },
  paymentMethodText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.text,
  },
  paymentMethodsDropdown: {
    marginTop: -getSpacing(Layout.spacing.m),
    marginBottom: getSpacing(Layout.spacing.m),
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.card,
    overflow: 'hidden',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getSpacing(Layout.spacing.m),
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  paymentMethodItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getSpacing(Layout.spacing.m),
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.subtext,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(16),
    color: '#FFF',
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 255, 0.05)',
    borderRadius: Layout.borderRadius.medium,
    padding: getSpacing(Layout.spacing.m),
    marginTop: getSpacing(Layout.spacing.m),
  },
  infoTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    marginBottom: getSpacing(Layout.spacing.s),
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(14),
    color: Colors.light.subtext,
    marginBottom: getSpacing(Layout.spacing.xs),
  },
  phoneInputContainer: {
    marginBottom: getSpacing(Layout.spacing.m),
  },
  phonePrefix: {
    fontFamily: 'Poppins-Medium',
    fontSize: getFontSize(16),
    color: Colors.light.text,
    marginRight: getSpacing(Layout.spacing.xs),
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular',
    fontSize: getFontSize(16),
    color: Colors.light.text,
  },
});
