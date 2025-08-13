import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Header from '@/components/common/Header';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import EarningsUpgradeModal from '@/components/ui/EarningsUpgradeModal';
import AccountActivationModal from '@/components/ui/AccountActivationModal';
import PremiumUpgradeModal from '@/components/ui/PremiumUpgradeModal';
import PackagesModal from '@/components/ui/PackagesModal';
import WithdrawalPackagesModal from '@/components/ui/WithdrawalPackagesModal';
import WithdrawalModal from '@/components/ui/WithdrawalModal';
import WithdrawalLimitModal from '@/components/ui/WithdrawalLimitModal';
import { ChartBar as BarChart2, TrendingUp, Calendar, Download, CheckCircle } from 'lucide-react-native';
import { useEarningsStore } from '@/stores/earningsStore';
import { useUserStore } from '@/stores/userStore';

// Filter periods
const periodFilters = [
  { id: 'all', label: 'All Time' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

export default function EarningsScreen() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [showWithdrawalPackagesModal, setShowWithdrawalPackagesModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showPremiumUpgradeModal, setShowPremiumUpgradeModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showWithdrawalLimitModal, setShowWithdrawalLimitModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const { 
    accountType, 
    setAccountType, 
    canAccessPremiumContent,
    isAccountActivated,
    setAccountActivation,
    hasCompletedPremiumSurveys,
    hasCompletedOnlyBasicSurveys
  } = useUserStore();
  
  // Use our earnings store to get current data
  const { 
    currentBalance, 
    totalEarned,
    totalWithdrawn,
    transactions,
    withdrawFunds
  } = useEarningsStore();
  
  // Set withdrawal target (80% of total earnings)
  const withdrawalTarget = totalEarned * 0.8;
  const withdrawalProgress = totalWithdrawn / withdrawalTarget || 0;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  
  // Handle withdrawal request
  const handleWithdrawal = () => {
    // First check if balance meets minimum threshold
    if (currentBalance < 1000) {
      // Show the threshold modal for insufficient balance
      setShowThresholdModal(true);
      return;
    }
    
    // For verified users, show the upgrade message regardless of balance
    if (isAccountActivated) {
      setShowWithdrawalLimitModal(true);
      return;
    }
    
    // For non-verified users, show the withdrawal modal
    setShowWithdrawalModal(true);
  };

  // Close the threshold modal
  const closeThresholdModal = () => {
    setShowThresholdModal(false);
  };
  
  // Handlers for upgrade flow
  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    setShowPremiumUpgradeModal(false);
    setShowWithdrawalLimitModal(false);
    setShowWithdrawalPackagesModal(true);
  };
  
  const handleContinueBasic = () => {
    setShowUpgradeModal(false);
    // Navigate to a regular survey
    router.push('/survey/finance-survey');
  };
  
  // Handle account activation
  const handleActivateAccount = () => {
    setAccountActivation(true);
    setShowActivationModal(false);
    
    // Show a success message or provide feedback to the user
    showSuccessMessage('Account activated successfully!');
    
    // Process any pending withdrawal after activation
    if (withdrawalAmount > 0) {
      processWithdrawal(withdrawalAmount, 'M-Pesa');
      setWithdrawalAmount(0); // Reset after processing
    }
  };
  
  // Handle withdrawal submission
  const handleWithdrawalSubmit = (amount: number, paymentMethod: string, phoneNumber?: string) => {
    if (amount <= 0 || amount > currentBalance) {
      showSuccessMessage('Invalid withdrawal amount');
      return;
    }
    
    // Close the withdrawal modal
    setShowWithdrawalModal(false);
    
    // Show account activation modal for M-Pesa withdrawals
    if (paymentMethod === 'M-Pesa') {
      setShowActivationModal(true);
      // Store the withdrawal details to process after activation
      setWithdrawalAmount(amount);
      return;
    }
    
    // For other payment methods, process withdrawal immediately
    processWithdrawal(amount, paymentMethod, phoneNumber);
  };
  
  // Process the actual withdrawal
  const processWithdrawal = (amount: number, paymentMethod: string, phoneNumber?: string) => {
    // Process withdrawal
    withdrawFunds(amount, `Withdrawal to ${paymentMethod}${phoneNumber ? ` (${phoneNumber})` : ''}`);
    
    // Show success message
    showSuccessMessage(`${amount} KSH withdrawal initiated to ${paymentMethod}`);
  };
  
  // Simple success message function
  const showSuccessMessage = (message: string) => {
    // In a real app, you would use a proper toast/notification system
    alert(message);
  };
  
  const handleUpgradeLite = () => {
    // In a real app, this would go to a payment screen
    console.log('User upgrading to Lite package');
    setAccountType('premium');
    setShowPackagesModal(false);
  };
  
  const handleUpgradeClassic = () => {
    // In a real app, this would go to a payment screen
    console.log('User upgrading to Classic package');
    setAccountType('premium');
    setShowPackagesModal(false);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'survey':
        return <BarChart2 size={16} color={Colors.light.primary} />;
      case 'referral':
        return <TrendingUp size={16} color={Colors.light.secondary} />;
      case 'bonus':
        return <Calendar size={16} color={Colors.light.accent} />;
      case 'withdrawal':
        return <Download size={16} color={Colors.light.error} />;
      default:
        return <BarChart2 size={16} color={Colors.light.primary} />;
    }
  };

  // Filter transactions based on active period
  const getFilteredTransactions = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (activePeriod) {
      case 'week': {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        return transactions.filter(t => t.date >= oneWeekAgo && t.date <= today);
      }
      case 'month': {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
        return transactions.filter(t => t.date >= oneMonthAgo && t.date <= today);
      }
      case 'year': {
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        return transactions.filter(t => t.date >= oneYearAgo && t.date <= today);
      }
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <View style={styles.container}>
      <Header title="Earnings" />
      
      {/* Withdrawal threshold modal */}
      <Modal
        visible={showThresholdModal}
        onClose={closeThresholdModal}
        title="Withdrawal Threshold"
        message="You need at least KES 1,000 to withdraw funds. Keep completing surveys to reach the minimum withdrawal amount!"
        buttonText="Got it"
        type="warning"
      />
      
      {/* Standard Earnings Upgrade Modal */}
      <EarningsUpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentBalance={currentBalance}
        withdrawalThreshold={1000}
        onUpgrade={handleUpgradeClick}
        onContinueBasic={handleContinueBasic}
      />
      
      {/* Account Activation Modal - for users who have only completed basic surveys */}
      <AccountActivationModal
        visible={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onActivate={handleActivateAccount}
        currentBalance={currentBalance}
      />
      
      {/* Premium Upgrade Modal - for users who have attempted premium surveys */}
      <PremiumUpgradeModal
        visible={showPremiumUpgradeModal}
        onClose={() => setShowPremiumUpgradeModal(false)}
        onUpgrade={handleUpgradeClick}
        currentBalance={currentBalance}
        withdrawalThreshold={1000}
      />
      
      {/* Regular Packages Modal (for surveys) */}
      <PackagesModal
        visible={showPackagesModal}
        onClose={() => setShowPackagesModal(false)}
        onContinueBasic={handleContinueBasic}
        onUpgradeLite={handleUpgradeLite}
        onUpgradeElite={handleUpgradeClassic}
      />
      
      {/* Withdrawal Packages Modal (goes directly to packages) */}
      <WithdrawalPackagesModal
        visible={showWithdrawalPackagesModal}
        onClose={() => setShowWithdrawalPackagesModal(false)}
        onContinueBasic={handleContinueBasic}
        onUpgradePremium={handleUpgradeLite}
        onUpgradeElite={handleUpgradeClassic}
      />
      
      {/* Withdrawal Modal */}
      <WithdrawalModal
        visible={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSubmit={handleWithdrawalSubmit}
        currentBalance={currentBalance}
        minAmount={1000}
        maxAmount={currentBalance}
      />
      
      {/* Withdrawal Limit Upgrade Modal */}
      <WithdrawalLimitModal
        visible={showWithdrawalLimitModal}
        onClose={() => setShowWithdrawalLimitModal(false)}
        onUpgrade={() => {
          setShowWithdrawalLimitModal(false);
          setShowWithdrawalPackagesModal(true);
        }}
        currentBalance={currentBalance}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
      >
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.currencySymbol}>KES</Text>
            <View style={styles.balanceValueContainer}>
              <Text style={styles.balanceValue}>{currentBalance.toLocaleString()}</Text>
              {isAccountActivated && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle size={14} color={Colors.light.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>
                KES {totalEarned.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Withdrawn</Text>
              <Text style={styles.statValue}>
                KES {totalWithdrawn.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={handleWithdrawal}
          >
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.withdrawalTargetCard}>
          <View style={styles.targetHeader}>
            <Text style={styles.targetTitle}>Withdrawal Target</Text>
            <Text style={styles.targetPercentage}>
              {Math.round(withdrawalProgress * 100)}%
            </Text>
          </View>
          
          <ProgressBar progress={withdrawalProgress} height={8} />
          
          <View style={styles.targetValues}>
            <Text style={styles.targetCurrentValue}>
              KES {totalWithdrawn.toLocaleString()}
            </Text>
            <Text style={styles.targetMaxValue}>
              KES {withdrawalTarget.toLocaleString()}
            </Text>
          </View>
        </Card>
        
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {periodFilters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  activePeriod === filter.id && styles.activeFilterTab
                ]}
                onPress={() => setActivePeriod(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activePeriod === filter.id && styles.activeFilterText
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.transactionsList}>
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyTransactionsContainer}>
                <Text style={styles.emptyTransactionsText}>
                  No transactions during this period
                </Text>
              </View>
            ) : (
              filteredTransactions.map(transaction => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionIconContainer}>
                    {getTransactionIcon(transaction.type)}
                  </View>
                  
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                  
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount
                    ]}
                  >
                    {transaction.amount < 0 ? '-' : '+'} KES {Math.abs(transaction.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 100, // Added extra padding to prevent the navigation bar from overlapping content
  },
  balanceCard: {
    marginHorizontal: Layout.spacing.m,
    marginVertical: Layout.spacing.s,
  },
  balanceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Layout.spacing.m,
  },
  currencySymbol: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: Colors.light.text,
    marginRight: Layout.spacing.xs,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.light.text,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Layout.spacing.xs,
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  verifiedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.light.success,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.m,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Layout.spacing.m,
  },
  withdrawButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.s,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  withdrawalTargetCard: {
    marginHorizontal: Layout.spacing.m,
    marginVertical: Layout.spacing.s,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  targetTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
  },
  targetPercentage: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
  targetValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.xs,
  },
  targetCurrentValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  targetMaxValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  transactionsSection: {
    marginTop: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  filtersContainer: {
    marginBottom: Layout.spacing.m,
  },
  filtersContent: {
    paddingHorizontal: Layout.spacing.m,
  },
  filterTab: {
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
    marginRight: Layout.spacing.s,
    backgroundColor: Colors.light.card,
  },
  activeFilterTab: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  activeFilterText: {
    color: '#FFF',
  },
  transactionsList: {
    paddingHorizontal: Layout.spacing.m,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.small,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.s,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
  transactionAmount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  positiveAmount: {
    color: Colors.light.success,
  },
  negativeAmount: {
    color: Colors.light.error,
  },
  emptyTransactionsContainer: {
    paddingVertical: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTransactionsText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});