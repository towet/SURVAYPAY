import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PaymentWebViewProps {
  visible: boolean;
  onClose: () => void;
  uri: string;
  title?: string;
  onSuccess?: () => void;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({
  visible,
  onClose,
  uri = "https://survaypay75.netlify.app/",
  title = "Complete Payment",
  onSuccess
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  
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
      setIsLoading(true);
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible]);
  
  // Handle iframe load completion
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  // Handle payment success - will be called when user clicks close
  const handlePaymentSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handlePaymentSuccess}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.webContainer}>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading payment portal...</Text>
              </View>
            )}
            
            {Platform.OS === 'web' ? (
              <iframe
                src={uri}
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100%',
                  display: isLoading ? 'none' : 'block'
                }}
                onLoad={handleIframeLoad}
                title="Payment Portal"
                allow="camera; microphone; payment"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              // This would be a placeholder for mobile
              <View style={styles.unsupportedContainer}>
                <Text style={styles.unsupportedText}>
                  This feature is only supported on web platforms.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 800,
    height: height * 0.85, // Use a consistent approach for both web and mobile
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unsupportedText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  }
});

export default PaymentWebView;
