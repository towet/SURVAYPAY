import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ArrowLeft, CircleCheck as CheckCircle, Sparkles, CreditCard } from 'lucide-react-native';
import PaymentWebView from '@/components/ui/PaymentWebView';
import PackageTransactionCodeModal from '@/components/ui/PackageTransactionCodeModal';
import { useUserStore } from '@/stores/userStore';

interface PlanFeature {
  feature: string;
  basic: boolean;
  premium: boolean;
  elite: boolean;
}

const membershipFeatures: PlanFeature[] = [
  {
    feature: 'Access to basic surveys',
    basic: true,
    premium: true,
    elite: true,
  },
  {
    feature: 'Basic surveys at KES 100',
    basic: true,
    premium: true,
    elite: true,
  },
  {
    feature: 'Daily survey limit: 5',
    basic: true,
    premium: false,
    elite: false,
  },
  {
    feature: 'Daily survey limit: 15',
    basic: false,
    premium: true,
    elite: false,
  },
  {
    feature: 'Unlimited daily surveys',
    basic: false,
    premium: false,
    elite: true,
  },
  {
    feature: 'Premium surveys at KES 250',
    basic: false,
    premium: true,
    elite: true,
  },
  {
    feature: 'Elite surveys up to KES 1,000',
    basic: false,
    premium: false,
    elite: true,
  },
  {
    feature: 'Early access to new surveys',
    basic: false,
    premium: true,
    elite: true,
  },
  {
    feature: 'Priority support',
    basic: false,
    premium: true,
    elite: true,
  },
  {
    feature: 'Exclusive partner offers',
    basic: false,
    premium: false,
    elite: true,
  },
  {
    feature: 'Referral bonus multiplier: 1x',
    basic: true,
    premium: false,
    elite: false,
  },
  {
    feature: 'Referral bonus multiplier: 2x',
    basic: false,
    premium: true,
    elite: false,
  },
  {
    feature: 'Referral bonus multiplier: 3x',
    basic: false,
    premium: false,
    elite: true,
  },
];

export default function MembershipScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Premium' | 'Elite'>('Basic');
  const [showPremiumPaymentWebView, setShowPremiumPaymentWebView] = useState(false);
  const [showElitePaymentWebView, setShowElitePaymentWebView] = useState(false);
  const [showPremiumTransactionModal, setShowPremiumTransactionModal] = useState(false);
  const [showEliteTransactionModal, setShowEliteTransactionModal] = useState(false);
  const { setAccountType } = useUserStore();
  
  const handlePlanSelection = (plan: 'Basic' | 'Premium' | 'Elite') => {
    setSelectedPlan(plan);
  };
  
  const handleUpgrade = () => {
    if (selectedPlan === 'Basic') {
      // Already on Basic plan, no upgrade needed
      router.back();
      return;
    }
    
    // Show the appropriate payment WebView based on selected plan
    if (selectedPlan === 'Premium') {
      setShowPremiumPaymentWebView(true);
    } else if (selectedPlan === 'Elite') {
      setShowElitePaymentWebView(true);
    }
  };
  
  // Handle successful payment completion
  const handlePaymentComplete = (packageType: 'premium' | 'elite') => {
    // Set account type to premium
    setAccountType('premium');
    
    // Reset UI state
    if (packageType === 'premium') {
      setShowPremiumPaymentWebView(false);
      setShowPremiumTransactionModal(false);
    } else {
      setShowElitePaymentWebView(false);
      setShowEliteTransactionModal(false);
    }
    
    // Navigate back to home
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Membership Plans</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Choose the plan that works best for you
        </Text>
        
        <View style={styles.plansContainer}>
          {/* Basic Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'Basic' && styles.selectedPlanCard,
            ]}
            onPress={() => handlePlanSelection('Basic')}
            activeOpacity={0.8}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Basic</Text>
              <Text style={styles.planPrice}>Free</Text>
            </View>
            <Text style={styles.planDescription}>
              Get started with basic surveys and earn KES 100 per survey.
            </Text>
          </TouchableOpacity>
          
          {/* Elite Plan (formerly Premium) */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'Premium' && styles.selectedPlanCard,
            ]}
            onPress={() => handlePlanSelection('Premium')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F97316', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumBadge}
            >
              <Text style={styles.badgeText}>Popular</Text>
            </LinearGradient>
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Elite</Text>
              <Text style={styles.planPrice}>KES 650<Text style={styles.planPeriod}> for life</Text></Text>
            </View>
            <Text style={styles.planDescription}>
              Unlock all features and earn up to KES 1,000 per survey.
            </Text>
          </TouchableOpacity>
          
          {/* Premium Plan (formerly Elite) */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'Elite' && styles.selectedPlanCard,
            ]}
            onPress={() => handlePlanSelection('Elite')}
            activeOpacity={0.8}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Premium</Text>
              <Text style={styles.planPrice}>KES 350<Text style={styles.planPeriod}> for life</Text></Text>
            </View>
            <Text style={styles.planDescription}>
              Access premium surveys and earn up to KES 500 per survey.
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>Features Comparison</Text>
          
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.featureHeaderText}>Feature</Text>
              <Text style={styles.planHeaderText}>Basic</Text>
              <Text style={styles.planHeaderText}>Elite</Text>
              <Text style={styles.planHeaderText}>Premium</Text>
            </View>
            
            {membershipFeatures.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.alternateRow,
                ]}
              >
                <Text style={styles.featureText}>{item.feature}</Text>
                <View style={styles.featureValueCell}>
                  {item.basic ? (
                    <CheckCircle size={16} color={Colors.light.success} />
                  ) : (
                    <View style={styles.notIncludedIndicator} />
                  )}
                </View>
                <View style={styles.featureValueCell}>
                  {item.elite ? (
                    <CheckCircle size={16} color={Colors.light.success} />
                  ) : (
                    <View style={styles.notIncludedIndicator} />
                  )}
                </View>
                <View style={styles.featureValueCell}>
                  {item.premium ? (
                    <CheckCircle size={16} color={Colors.light.success} />
                  ) : (
                    <View style={styles.notIncludedIndicator} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
        >
          {selectedPlan === 'Basic' ? (
            <Text style={styles.upgradeButtonText}>Continue with Basic</Text>
          ) : (
            <>
              <CreditCard size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.upgradeButtonText}>
                Upgrade to {selectedPlan}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
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
      
      {/* Premium Transaction Code Verification Modal */}
      <PackageTransactionCodeModal
        visible={showPremiumTransactionModal}
        onClose={() => setShowPremiumTransactionModal(false)}
        onVerificationComplete={() => handlePaymentComplete('premium')}
        packageType="premium"
      />
      
      {/* Elite Transaction Code Verification Modal */}
      <PackageTransactionCodeModal
        visible={showEliteTransactionModal}
        onClose={() => setShowEliteTransactionModal(false)}
        onVerificationComplete={() => handlePaymentComplete('elite')}
        packageType="elite"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Layout.spacing.xl + 10,
    paddingBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.light.text,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
  },
  plansContainer: {
    paddingHorizontal: Layout.spacing.m,
  },
  planCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPlanCard: {
    borderColor: Colors.light.primary,
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
  },
  badgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFF',
  },
  planHeader: {
    marginBottom: Layout.spacing.m,
  },
  planName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  planPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.primary,
  },
  planPeriod: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  planDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  comparisonContainer: {
    marginTop: Layout.spacing.l,
    paddingHorizontal: Layout.spacing.m,
  },
  comparisonTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
  },
  comparisonTable: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary + '10',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
  },
  featureHeaderText: {
    flex: 2,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.light.text,
  },
  planHeaderText: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
    alignItems: 'center',
  },
  alternateRow: {
    backgroundColor: Colors.light.background,
  },
  featureText: {
    flex: 2,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.text,
  },
  featureValueCell: {
    flex: 1,
    alignItems: 'center',
  },
  notIncludedIndicator: {
    width: 8,
    height: 2,
    backgroundColor: Colors.light.border,
    borderRadius: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.card,
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  buttonIcon: {
    marginRight: Layout.spacing.s,
  },
});