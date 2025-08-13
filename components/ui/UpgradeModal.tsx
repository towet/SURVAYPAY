import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import Modal from './Modal';
import Colors from '@/constants/Colors';
import { Crown, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onContinue: () => void;
  premiumAmount?: number;
  basicAmount?: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  onContinue,
  premiumAmount = 250,
  basicAmount = 100
}) => {
  const benefits = [
    'Access to premium surveys',
    `Earn ${premiumAmount}+ KSH per survey`,
    'Priority access to new surveys',
    'Faster payment processing',
    'Premium customer support'
  ];

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Upgrade to Premium"
      message=""
      buttonText=""
      type="info"
      showCloseButton={false}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.light.accent, Colors.light.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientHeader}
          >
            <Crown size={40} color="#FFF" />
            <Text style={styles.headerTitle}>Premium Account</Text>
            <Text style={styles.headerSubtitle}>Unlock higher earnings!</Text>
          </LinearGradient>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
          
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Check size={18} color={Colors.light.success} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Special Offer</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>KES</Text>
            <Text style={styles.price}>399</Text>
            <Text style={styles.period}>/month</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={onContinue}
          >
            <Text style={styles.continueButtonText}>Continue with Basic</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  content: {
    width: '100%',
    paddingHorizontal: 5,
  },
  headerContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientHeader: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  priceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 5,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  period: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 5,
    marginLeft: 2,
  },
  buttonsContainer: {
    marginTop: 10,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    marginTop: 5,
  },
  continueButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UpgradeModal;
