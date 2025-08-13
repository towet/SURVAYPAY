import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import PaymentWebView from './PaymentWebView';
import PackageTransactionCodeModal from './PackageTransactionCodeModal';
import Colors from '@/constants/Colors';
import { X, Check, Star, ArrowRight, Shield, Clock, Zap, Crown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;
const isNarrowScreen = width < 400;

// Helper functions for responsive design
const getFontSize = (baseSize: number): number => {
  if (isSmallScreen) return baseSize - 2;
  if (isNarrowScreen) return baseSize - 1;
  return baseSize;
};

const getSpacing = (baseSpacing: number): number => {
  if (isSmallScreen) return baseSpacing * 0.7;
  if (isNarrowScreen) return baseSpacing * 0.85;
  return baseSpacing;
};

interface WithdrawalPackagesModalProps {
  visible: boolean;
  onClose: () => void;
  onContinueBasic: () => void;
  onUpgradePremium: () => void;
  onUpgradeElite: () => void;
}

export default function WithdrawalPackagesModal({
  visible,
  onClose,
  onContinueBasic,
  onUpgradePremium,
  onUpgradeElite,
}: WithdrawalPackagesModalProps) {
  const router = useRouter();
  const [showPremiumPaymentWebView, setShowPremiumPaymentWebView] = useState(false);
  const [showElitePaymentWebView, setShowElitePaymentWebView] = useState(false);
  const [showPremiumTransactionModal, setShowPremiumTransactionModal] = useState(false);
  const [showEliteTransactionModal, setShowEliteTransactionModal] = useState(false);
  
  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const liteButtonScale = useSharedValue(1);
  const eliteButtonScale = useSharedValue(1);
  
  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }]
  }));
  
  const liteButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: liteButtonScale.value }]
  }));
  
  const eliteButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eliteButtonScale.value }]
  }));
  
  // Reset and run animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Entrance animations
      contentOpacity.value = withTiming(1, { duration: 400 });
      contentTranslateY.value = withSpring(0, { damping: 15 });
    } else {
      // Exit animations
      contentOpacity.value = withTiming(0, { duration: 300 });
      contentTranslateY.value = withTiming(50, { duration: 300 });
    }
  }, [visible]);
  
  // Button press animations
  const handlePremiumButtonPress = () => {
    liteButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setShowPremiumPaymentWebView(true);
  };
  
  const handleEliteButtonPress = () => {
    eliteButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setShowElitePaymentWebView(true);
  };

  // Handle successful payment completion
  const handlePaymentComplete = (packageType: 'premium' | 'elite') => {
    if (packageType === 'premium') {
      setShowPremiumPaymentWebView(false);
      onUpgradePremium();
    } else {
      setShowElitePaymentWebView(false);
      onUpgradeElite();
    }
    onClose();
  };

  return (
    <>
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, contentAnimatedStyle]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={onClose}
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
                
                <Text style={styles.packagesTitle}>Choose Your Package</Text>
                <Text style={styles.packagesSubtitle}>
                  Upgrade your account to withdraw your full balance and access premium features
                </Text>
              </View>
              
              <ScrollView 
                style={styles.packagesScrollView}
                contentContainerStyle={styles.packagesScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Premium Package */}
                <View style={[styles.packageCard, styles.premiumCard]}>
                  <LinearGradient
                    colors={['#5965DE', '#556CD6']}
                    style={styles.packageHeaderGradient}
                  >
                    <Text style={styles.packageName}>Premium Package</Text>
                    <View style={styles.packagePriceContainer}>
                      <Text style={styles.packageCurrency}>KES</Text>
                      <Text style={styles.packagePrice}>350</Text>
                      <Text style={styles.packagePeriod}>for life</Text>
                    </View>
                  </LinearGradient>
                  
                  <View style={styles.packageContent}>
                    {[
                      'Withdraw up to KES 10,000 at once',
                      'Activate your account permanently',
                      'Access to premium surveys (250 KSH each)',
                      'Access to exclusive offers',
                      'Priority customer support'
                    ].map((feature, index) => (
                      <View key={index} style={styles.packageFeatureItem}>
                        <View style={[styles.checkCircle, styles.premiumCheckCircle]}>
                          <Check size={16} color="#FFF" />
                        </View>
                        <Text style={styles.packageFeatureText}>{feature}</Text>
                      </View>
                    ))}
                    
                    <Animated.View style={liteButtonAnimatedStyle}>
                      <TouchableOpacity 
                        style={[styles.packageButton, styles.premiumButton]}
                        onPress={handlePremiumButtonPress}
                      >
                        <Text style={styles.packageButtonText}>Get Premium Package</Text>
                        <ArrowRight size={18} color="#FFF" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>
                
                {/* Elite Package */}
                <View style={[styles.packageCard, styles.eliteCard]}>
                  <LinearGradient
                    colors={['#FF8326', '#FF6B00']}
                    style={styles.packageHeaderGradient}
                  >
                    <Text style={styles.packageName}>Elite Package</Text>
                    <View style={styles.eliteNameContainer}>
                      <View style={styles.eliteBadge}>
                        <Text style={styles.eliteBadgeText}>MOST POPULAR</Text>
                      </View>
                    </View>
                    <View style={styles.packagePriceContainer}>
                      <Text style={styles.packageCurrency}>KES</Text>
                      <Text style={styles.packagePrice}>650</Text>
                      <Text style={styles.packagePeriod}>for life</Text>
                    </View>
                  </LinearGradient>
                  
                  <View style={styles.packageContent}>
                    {[
                      'Withdraw UNLIMITED amounts at once',
                      'Activate your account permanently',
                      'Access to ALL premium surveys',
                      'Exclusive Elite-only surveys (500 KSH each)',
                      'VIP customer support',
                      'Receive double referral bonuses'
                    ].map((feature, index) => (
                      <View key={index} style={styles.packageFeatureItem}>
                        <View style={[styles.checkCircle, styles.eliteCheckCircle]}>
                          <Check size={16} color="#FFF" />
                        </View>
                        <Text style={styles.packageFeatureText}>{feature}</Text>
                      </View>
                    ))}
                    
                    <Animated.View style={eliteButtonAnimatedStyle}>
                      <TouchableOpacity 
                        style={[styles.packageButton, styles.eliteButton]}
                        onPress={handleEliteButtonPress}
                      >
                        <Text style={styles.packageButtonText}>Get Elite Package</Text>
                        <ArrowRight size={18} color="#FFF" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>
                
                <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <TouchableOpacity 
                  style={styles.continueBasicButton}
                  onPress={onContinueBasic}
                >
                  <Text style={styles.continueBasicText}>Continue with Basic Account</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    {/* Premium Package Payment WebView */}
    <PaymentWebView
      visible={showPremiumPaymentWebView}
      onClose={() => setShowPremiumPaymentWebView(false)}
      uri="https://elite-package-payment.netlify.app/"
      title="Premium Package Payment"
      onSuccess={() => {
        setShowPremiumPaymentWebView(false);
        setShowPremiumTransactionModal(true);
      }}
    />

    {/* Elite Package Payment WebView */}
    <PaymentWebView
      visible={showElitePaymentWebView}
      onClose={() => setShowElitePaymentWebView(false)}
      uri="https://elite-package-payment.netlify.app/"
      title="Elite Package Payment"
      onSuccess={() => {
        setShowElitePaymentWebView(false);
        setShowEliteTransactionModal(true);
      }}
    />
    
    {/* Transaction Verification Modals */}
    <PackageTransactionCodeModal
      visible={showPremiumTransactionModal}
      onClose={() => setShowPremiumTransactionModal(false)}
      onVerificationComplete={(packageType) => {
        setShowPremiumTransactionModal(false);
        onUpgradePremium();
      }}
      packageType="premium"
    />
    
    <PackageTransactionCodeModal
      visible={showEliteTransactionModal}
      onClose={() => setShowEliteTransactionModal(false)}
      onVerificationComplete={(packageType) => {
        setShowEliteTransactionModal(false);
        onUpgradeElite();
      }}
      packageType="elite"
    />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(16),
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  modalHeader: {
    padding: getSpacing(24),
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: getSpacing(16),
    right: getSpacing(16),
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Packages Selection styles
  packagesTitle: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: getSpacing(8),
    textAlign: 'center',
  },
  packagesSubtitle: {
    fontSize: getFontSize(16),
    color: '#6B7280',
    marginBottom: getSpacing(24),
    textAlign: 'center',
    lineHeight: 24,
  },
  packagesScrollView: {
    width: '100%',
    maxHeight: height * 0.7,
  },
  packagesScrollContent: {
    paddingHorizontal: getSpacing(24),
    paddingBottom: getSpacing(24),
  },
  packageCard: {
    width: '100%',
    borderRadius: 20,
    marginBottom: getSpacing(20),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  eliteCard: {
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  packageHeaderGradient: {
    padding: getSpacing(20),
    alignItems: 'center',
  },
  packageName: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: getSpacing(8),
  },
  eliteNameContainer: {
    alignItems: 'center',
  },
  eliteBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: getSpacing(10),
    paddingVertical: getSpacing(4),
    borderRadius: 12,
    marginTop: getSpacing(4),
  },
  eliteBadgeText: {
    fontSize: getFontSize(12),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  packagePriceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  packageCurrency: {
    fontSize: getFontSize(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'flex-start',
    marginTop: getSpacing(6),
  },
  packagePrice: {
    fontSize: getFontSize(36),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: getSpacing(4),
  },
  packagePeriod: {
    fontSize: getFontSize(14),
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
    marginBottom: getSpacing(6),
  },
  packageContent: {
    padding: getSpacing(20),
  },
  packageFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(14),
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCheckCircle: {
    backgroundColor: Colors.light.primary,
  },
  eliteCheckCircle: {
    backgroundColor: '#FF6B00',
  },
  packageFeatureText: {
    fontSize: getFontSize(15),
    color: '#4B5563',
    marginLeft: getSpacing(12),
    flex: 1,
  },
  packageButton: {
    borderRadius: 12,
    paddingVertical: getSpacing(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: getSpacing(8),
  },
  premiumButton: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  eliteButton: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  packageButtonText: {
    fontSize: getFontSize(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: getSpacing(8),
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: getSpacing(16),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: getFontSize(14),
    color: '#9CA3AF',
    marginHorizontal: getSpacing(12),
  },
  continueBasicButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: getSpacing(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  continueBasicText: {
    fontSize: getFontSize(15),
    color: '#6B7280',
  },
});
