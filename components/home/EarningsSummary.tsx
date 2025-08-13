import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { ChartBar as BarChart2, Crown, Gift } from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { useEarningsStore } from '@/stores/earningsStore';

interface EarningsSummaryProps {
  currentEarnings: number;
  targetEarnings: number;
  maxDailyEarnings?: number;
  currency?: string;
  period?: string;
}

export default function EarningsSummary({
  currentEarnings,
  targetEarnings,
  maxDailyEarnings = 850,
  currency = 'KES',
  period = 'This Week',
}: EarningsSummaryProps) {
  // Get the user's account type from the user store
  const { accountType } = useUserStore();
  // Get the current balance from earnings store to ensure welcome bonus is included
  const { currentBalance } = useEarningsStore();
  
  // Use the store's currentBalance instead of the passed prop to ensure welcome bonus is included
  const displayedEarnings = currentBalance > 0 ? currentBalance : currentEarnings;
  
  const progress = targetEarnings > 0 ? Math.min(displayedEarnings / targetEarnings, 1) : 0;
  const percentage = Math.round(progress * 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <BarChart2 size={20} color="#fff" />
        </View>
        <Text style={styles.title}>Earnings Summary</Text>
        <Text style={styles.period}>{period}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <Text style={styles.amount}>{displayedEarnings.toLocaleString()}</Text>
        
        {/* Show package status badge */}
        {(accountType === 'premium' || accountType === 'basic') && (
          <View style={[styles.packageBadge, 
            accountType === 'premium' ? styles.premiumBadge : styles.basicBadge
          ]}>
            <Crown size={12} color="#FFF" style={styles.badgeIcon} />
            <Text style={styles.packageText}>
              {accountType === 'premium' ? 'PREMIUM' : 'BASIC'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.potentialContainer}>
        <View style={styles.bonusIconContainer}>
          <Gift size={14} color={Colors.light.primary} />
        </View>
        <Text style={styles.potentialText}>KSH 250 Welcome Bonus Included</Text>
      </View>

      <View style={styles.targetContainer}>
        <Text style={styles.targetText}>
          Withdrawal limit of {currency} {targetEarnings.toLocaleString()} per day
        </Text>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>

      <ProgressBar progress={progress} height={10} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Layout.spacing.m,
    marginVertical: Layout.spacing.s,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  iconContainer: {
    backgroundColor: Colors.light.primary,
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
    marginRight: Layout.spacing.s,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  period: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Layout.spacing.s,
  },
  currencySymbol: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.light.text,
    marginRight: Layout.spacing.xs,
    marginBottom: 4,
  },
  amount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.light.text,
  },
  packageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: Layout.spacing.s,
    alignSelf: 'center',
  },
  premiumBadge: {
    backgroundColor: Colors.light.primary,
  },
  basicBadge: {
    backgroundColor: '#F5A623', // Gold color for Basic
  },
  badgeIcon: {
    marginRight: 4,
  },
  packageText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  potentialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  bonusIconContainer: {
    marginRight: Layout.spacing.xs,
  },
  potentialText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.success,
    fontStyle: 'italic',
  },
  targetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.s,
  },
  targetText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  percentageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.primary,
  },
});