import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from '@/components/ui/Modal';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Clock } from 'lucide-react-native';

interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
}

export default function ComingSoonModal({
  visible,
  onClose,
  featureName,
}: ComingSoonModalProps) {
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Clock size={48} color={Colors.light.primary} />
        </View>
        
        <Text style={styles.title}>Coming Soon!</Text>
        
        <Text style={styles.description}>
          The <Text style={styles.featureName}>{featureName}</Text> feature is currently under development and will be available soon.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>OK, I'll Check Later</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.l,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: Colors.light.primary + '15',
    padding: Layout.spacing.m,
    borderRadius: 50,
    marginBottom: Layout.spacing.l,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  featureName: {
    fontFamily: 'Poppins-Medium',
    color: Colors.light.primary,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.medium,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFF',
  }
});
