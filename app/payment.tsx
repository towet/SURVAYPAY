import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import PaymentWebView from '@/components/ui/PaymentWebView';
import PackageTransactionCodeModal from '@/components/ui/PackageTransactionCodeModal';
import { useUserStore } from '@/stores/userStore';

export default function PaymentScreen() {
  const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [showPaymentWebView, setShowPaymentWebView] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const { setAccountType } = useUserStore();
  
  // Set proper account type based on plan
  const handleUpgradeComplete = () => {
    if (plan === 'Premium' || plan === 'Elite') {
      setAccountType('premium');
    }
    
    // Navigate back to home
    router.replace('/');
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Payment WebView */}
      <PaymentWebView
        visible={showPaymentWebView}
        onClose={() => router.back()}
        uri={plan === 'Elite' ? "https://premiumplan-survey.netlify.app/" : "https://elite-package-payment.netlify.app/"}
        title={`${plan} Package Payment`}
        onSuccess={() => {
          setShowPaymentWebView(false);
          setShowTransactionModal(true);
        }}
      />
      
      {/* Transaction Code Modal */}
      <PackageTransactionCodeModal
        visible={showTransactionModal}
        onClose={() => router.back()}
        onVerificationComplete={handleUpgradeComplete}
        packageType={plan?.toLowerCase() as 'premium' | 'elite'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
