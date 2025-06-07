import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal as RNModal, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showCloseButton?: boolean;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = 'OK',
  type = 'info',
  showCloseButton = true,
  children,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Helper function to safely trigger haptic feedback
  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    // Only use haptics on native platforms, not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style).catch(() => {
        // Silently catch any haptics errors
      });
    }
  };

  useEffect(() => {
    if (visible) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  // Determine button and header color based on type
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return Colors.light.success;
      case 'error':
        return Colors.light.error;
      case 'warning':
        return Colors.light.warning;
      default:
        return Colors.light.primary;
    }
  };

  const handleClose = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={30} style={styles.backdrop}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.header, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.title}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.content}>
            {children ? (
              children
            ) : (
              <>
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: getTypeColor() }]}
                  onPress={handleClose}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </RNModal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: width * 0.85,
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 24,
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  button: {
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Modal;
