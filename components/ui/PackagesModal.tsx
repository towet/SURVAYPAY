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

// Types of modals we can show
enum ModalType {
  PREMIUM_SURVEY_NOTICE,
  PACKAGES_SELECTION
}

interface PackagesModalProps {
  visible: boolean;
  onClose: () => void;
  onContinueBasic: () => void;
  onUpgradeLite: () => void;
  onUpgradeElite: () => void;
  initialModalType?: ModalType;
}

export default function PackagesModal({
  visible,
  onClose,
  onContinueBasic,
  onUpgradeLite,
  onUpgradeElite,
  initialModalType = ModalType.PREMIUM_SURVEY_NOTICE
}: PackagesModalProps) {
  const router = useRouter();
  const [showPremiumPaymentWebView, setShowPremiumPaymentWebView] = useState(false);
  const [showElitePaymentWebView, setShowElitePaymentWebView] = useState(false);
  const [showPremiumTransactionModal, setShowPremiumTransactionModal] = useState(false);
  const [showEliteTransactionModal, setShowEliteTransactionModal] = useState(false);
  const [currentModalType, setCurrentModalType] = React.useState<ModalType>(initialModalType);
  
  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const liteButtonScale = useSharedValue(1);
  const eliteButtonScale = useSharedValue(1);
  const noticeIconScale = useSharedValue(0.8);
  const noticeIconRotate = useSharedValue(0);
  
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
  
  const noticeIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: noticeIconScale.value },
      { rotate: `${noticeIconRotate.value}deg` }
    ]
  }));
  
  // Reset and run animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset to initial state when opening
      setCurrentModalType(initialModalType);
      
      // Entrance animations
      contentOpacity.value = withTiming(1, { duration: 400 });
      contentTranslateY.value = withSpring(0, { damping: 15 });
      
      // Notice icon animation
      noticeIconScale.value = withSequence(
        withTiming(0.8, { duration: 10 }),
        withDelay(300, withSpring(1.2, { damping: 8 })),
        withSpring(1, { damping: 12 })
      );
      
      noticeIconRotate.value = withSequence(
        withTiming(0, { duration: 10 }),
        withDelay(300, withTiming(10, { duration: 100 })),
        withTiming(-10, { duration: 100 }),
        withTiming(8, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } else {
      // Exit animations
      contentOpacity.value = withTiming(0, { duration: 300 });
      contentTranslateY.value = withTiming(50, { duration: 300 });
    }
  }, [visible, initialModalType]);
  
  // Button press animations
  const handleLiteButtonPress = () => {
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
  
  const handleViewPackages = () => {
    setCurrentModalType(ModalType.PACKAGES_SELECTION);
    
    // Reset animations for new content
    contentOpacity.value = withTiming(0, { duration: 150 }, () => {
      contentTranslateY.value = 30;
      contentOpacity.value = withTiming(1, { duration: 300 });
      contentTranslateY.value = withSpring(0, { damping: 15 });
    });
  };
  
  // Render premium survey notice modal
  const renderPremiumSurveyNotice = () => (
    <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
      <Animated.View style={[styles.noticeIconContainer, noticeIconAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.noticeIconGradient}
        >
          <Crown size={40} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
      
      <Text style={styles.noticeTitle}>Premium Survey Detected!</Text>
      
      <Text style={styles.noticeDescription}>
        This is a premium survey worth more rewards. Upgrade your account to unlock full earnings and premium benefits.
      </Text>
      
      <View style={styles.premiumBenefitContainer}>
        <View style={styles.benefitItem}>
          <Check size={18} color={Colors.light.success} />
          <Text style={styles.benefitText}>Higher rewards (250 KSH per survey)</Text>
        </View>
        <View style={styles.benefitItem}>
          <Check size={18} color={Colors.light.success} />
          <Text style={styles.benefitText}>Faster payment processing</Text>
        </View>
        <View style={styles.benefitItem}>
          <Check size={18} color={Colors.light.success} />
          <Text style={styles.benefitText}>Priority survey matching</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={handleViewPackages}
        activeOpacity={0.9}
      >
        <Text style={styles.upgradeButtonText}>View Upgrade Options</Text>
        <ArrowRight size={18} color="#FFFFFF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.basicButton}
        onPress={onContinueBasic}
        activeOpacity={0.7}
      >
        <Text style={styles.basicButtonText}>Continue with Basic Survey (100 KSH)</Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  // Render packages selection modal
  const renderPackagesSelection = () => {
    // Elite package features (formerly Premium)
    const eliteFeatures = [
      'Access to premium surveys (250 KSH each)',
      'Faster survey matching',
      'Get paid within 48 hours',
      'Email support',
      'Unlock premium earnings'
    ];
    
    // Premium package features (formerly Elite)
    const premiumFeatures = [
      'All Elite package features',
      '10% bonus on all survey earnings',
      'Lower withdrawal threshold (1000 KSH)',
      'Priority support',
      'Get paid within 24 hours'
    ];
    
    return (
      <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
        <Text style={styles.packagesTitle}>Choose Your Plan</Text>
        
        <Text style={styles.packagesSubtitle}>
          Upgrade to unlock premium features and maximize your earnings
        </Text>
        
        <ScrollView 
          style={styles.packagesScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.packagesScrollContent}
        >
          {/* Elite Package Card (formerly Premium) */}
          <Animated.View style={[styles.packageCard, styles.premiumCard]}>
            <LinearGradient
              colors={[Colors.light.primary, '#5E72E4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.packageHeaderGradient}
            >
              <Text style={styles.packageName}>Elite Package</Text>
              <View style={styles.packagePriceContainer}>
                <Text style={styles.packageCurrency}>KES</Text>
                <Text style={styles.packagePrice}>650</Text>
                <Text style={styles.packagePeriod}>for life</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.packageContent}>
              {eliteFeatures.map((feature, index) => (
                <View key={`elite-${index}`} style={styles.packageFeatureItem}>
                  <View style={[styles.checkCircle, styles.premiumCheckCircle]}>
                    <Check size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.packageFeatureText}>{feature}</Text>
                </View>
              ))}
              
              <Animated.View style={liteButtonAnimatedStyle}>
                <TouchableOpacity
                  style={[styles.packageButton, styles.premiumButton]}
                  onPress={handleLiteButtonPress}
                  activeOpacity={0.9}
                >
                  <Text style={styles.packageButtonText}>Upgrade Now</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Premium Package Card (formerly Elite) */}
          <Animated.View style={[styles.packageCard, styles.eliteCard]}>
            <LinearGradient
              colors={['#FF9D00', '#FF6B00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.packageHeaderGradient}
            >
              <View style={styles.eliteNameContainer}>
                <Text style={styles.packageName}>Premium Package</Text>
                <View style={styles.eliteBadge}>
                  <Text style={styles.eliteBadgeText}>BEST VALUE</Text>
                </View>
              </View>
              <View style={styles.packagePriceContainer}>
                <Text style={styles.packageCurrency}>KES</Text>
                <Text style={styles.packagePrice}>350</Text>
                <Text style={styles.packagePeriod}>for life</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.packageContent}>
              {premiumFeatures.map((feature, index) => (
                <View key={`premium-${index}`} style={styles.packageFeatureItem}>
                  <View style={[styles.checkCircle, styles.eliteCheckCircle]}>
                    <Star size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.packageFeatureText}>{feature}</Text>
                </View>
              ))}
              
              <Animated.View style={eliteButtonAnimatedStyle}>
                <TouchableOpacity
                  style={[styles.packageButton, styles.eliteButton]}
                  onPress={handleEliteButtonPress}
                  activeOpacity={0.9}
                >
                  <Text style={styles.packageButtonText}>Upgrade Now</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
          
          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity
            style={styles.continueBasicButton}
            onPress={onContinueBasic}
            activeOpacity={0.7}
          >
            <Text style={styles.continueBasicText}>Continue with basic account (100 KSH)</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  };

  // Handle successful payment completion
  const handlePaymentComplete = (packageType: 'premium' | 'elite') => {
    if (packageType === 'premium') {
      setShowPremiumPaymentWebView(false);
      onUpgradeLite();
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
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              
              {currentModalType === ModalType.PREMIUM_SURVEY_NOTICE
                ? renderPremiumSurveyNotice()
                : renderPackagesSelection()}
            </View>
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
      uri="https://premiumplan-survey.netlify.app/"
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
        onUpgradeElite();
      }}
      packageType="premium"
    />
    
    <PackageTransactionCodeModal
      visible={showEliteTransactionModal}
      onClose={() => setShowEliteTransactionModal(false)}
      onVerificationComplete={(packageType) => {
        setShowEliteTransactionModal(false);
        onUpgradeLite();
      }}
      packageType="elite"
    />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(16),
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: height * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: getSpacing(24),
    alignItems: 'center',
  },
  
  // Premium Survey Notice styles
  noticeIconContainer: {
    marginBottom: getSpacing(24),
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  noticeIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeTitle: {
    fontSize: getFontSize(22),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: getSpacing(12),
    textAlign: 'center',
  },
  noticeDescription: {
    fontSize: getFontSize(16),
    color: '#4B5563',
    marginBottom: getSpacing(24),
    textAlign: 'center',
    lineHeight: 24,
  },
  premiumBenefitContainer: {
    width: '100%',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    padding: getSpacing(16),
    marginBottom: getSpacing(24),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: getFontSize(15),
    color: '#4B5563',
    marginLeft: getSpacing(12),
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: getSpacing(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(12),
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: getFontSize(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: getSpacing(8),
  },
  basicButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: getSpacing(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  basicButtonText: {
    fontSize: getFontSize(15),
    color: '#6B7280',
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