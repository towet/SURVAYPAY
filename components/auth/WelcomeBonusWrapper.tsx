import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import WelcomeBonusModal from '@/components/ui/WelcomeBonusModal';

interface WelcomeBonusWrapperProps {
  visible: boolean;
  onClose: () => void;
  bonusAmount: number;
}

/**
 * This wrapper component ensures the welcome bonus modal is displayed properly
 * It provides an additional layer of control for modal visibility
 */
export default function WelcomeBonusWrapper({
  visible,
  onClose,
  bonusAmount
}: WelcomeBonusWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Ensure the modal is shown when visible prop changes
  useEffect(() => {
    if (visible) {
      console.log('WelcomeBonusWrapper: Setting showModal to true');
      // Short timeout to ensure the modal appears after component mounts
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [visible]);
  
  // Handle modal close
  const handleClose = () => {
    console.log('WelcomeBonusWrapper: Modal closing');
    setShowModal(false);
    onClose();
  };
  
  return (
    <View style={styles.container}>
      <WelcomeBonusModal
        visible={showModal}
        onClose={handleClose}
        bonusAmount={bonusAmount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100, // Ensure it's above other components
    elevation: 100, // For Android
    // The View itself is invisible
    backgroundColor: 'transparent',
    pointerEvents: 'box-none', // Allow touches to pass through except on children
  },
});
