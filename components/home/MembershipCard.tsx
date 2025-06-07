import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Award, ChevronRight } from 'lucide-react-native';

interface MembershipCardProps {
  tier: 'Basic' | 'Premium' | 'Elite';
  onPress: () => void;
}

export default function MembershipCard({ tier, onPress }: MembershipCardProps) {
  const membershipColors = {
    Basic: ['#7380c2', '#6C63FF'],
    Premium: ['#4ECDC4', '#26A69A'],
    Elite: ['#F97316', '#F59E0B']
  };

  const tierBenefits = {
    Basic: 'Up to KES 250 per survey',
    Premium: 'Up to KES 1,000 per survey',
    Elite: 'Up to KES 500 per survey'
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={membershipColors[tier]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.tierContainer}>
              <Award size={20} color="#FFF" />
              <Text style={styles.tierText}>{tier}</Text>
            </View>
            <View style={styles.benefitContainer}>
              <Text style={styles.benefitText}>{tierBenefits[tier]}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.upgradeText}>
              {tier === 'Basic' ? 'Upgrade membership' : 'View benefits'}
            </Text>
            <ChevronRight size={20} color="#FFF" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.medium,
    marginHorizontal: Layout.spacing.m,
    marginVertical: Layout.spacing.s,
    padding: Layout.spacing.m,
  },
  content: {
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFF',
    marginLeft: Layout.spacing.xs,
  },
  benefitContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: Layout.spacing.xs,
  },
  benefitText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFF',
    marginRight: Layout.spacing.xs,
  },
});