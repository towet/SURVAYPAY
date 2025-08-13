import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { CircleUser as UserCircle, CreditCard, Award, Settings, LogOut, Gift, Trophy, CircleHelp as HelpCircle, Info, ChevronRight, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useEarningsStore } from '@/stores/earningsStore';
import ComingSoonModal from '@/components/ui/ComingSoonModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isLoading, signOut, loadUserProfile } = useAuthStore();
  const { accountType, isPremium } = useUserStore();
  const { currentBalance, totalEarned, transactions, syncWithSupabase } = useEarningsStore();
  
  // State for coming soon modal
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  
  useEffect(() => {
    if (user) {
      loadUserProfile();
      // Sync earnings with Supabase when profile loads
      syncWithSupabase();
    }
  }, [user]);

  const navigateToSettings = () => {
    // Using relative paths to avoid TypeScript errors
    router.push('./settings');
  };

  const navigateToMembership = () => {
    router.push('../membership');
  };

  // These navigation functions now show the coming soon modal instead
  const navigateToHelp = () => {
    showFeatureComingSoon('Help & Support');
  };

  const navigateToAbout = () => {
    showFeatureComingSoon('About SurveyPay');
  };

  const navigateToReferral = () => {
    showFeatureComingSoon('Refer & Earn');
  };

  const navigateToAchievements = () => {
    showFeatureComingSoon('Achievements');
  };
  
  const navigateToPaymentMethods = () => {
    showFeatureComingSoon('Payment Methods');
  };
  
  const showLanguageOptions = () => {
    showFeatureComingSoon('Language Settings');
  };

  const showFeatureComingSoon = (featureName: string) => {
    setComingSoonFeature(featureName);
    setShowComingSoonModal(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Show loading indicator while signing out
              // This gives the auth store time to fully clear state
              await signOut();
              
              // Reset all other stores if needed
              // This ensures all app state is cleared
              useUserStore.getState().reset();
              useEarningsStore.getState().resetEarnings();
              
              // Use immediate navigation to prevent any stale state issues
              setTimeout(() => {
                router.replace('/auth/login');
              }, 100);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={navigateToSettings}>
          <Settings size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.profileCard}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <View style={styles.profileContent}>
              <View style={styles.profileHeader}>
                <View style={styles.profileImageContainer}>
                  <UserCircle size={64} color={Colors.light.primary} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile?.username || 'User'}</Text>
                  <Text style={styles.profileEmail}>{profile?.email || user?.email || ''}</Text>
                  <View style={styles.membershipRow}>
                    <Badge 
                      label={isPremium ? 'Premium Member' : 'Basic Member'}
                      color={isPremium ? "#FFD700" : Colors.light.secondary}
                      size="small"
                    />
                    <TouchableOpacity
                      style={styles.upgradeButton}
                      onPress={navigateToMembership}
                    >
                      <Text style={styles.upgradeButtonText}>{isPremium ? 'Manage' : 'Upgrade'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Card>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{transactions.length || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentBalance || 0}</Text>
            <Text style={styles.statLabel}>KES Balance</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalEarned || 0}</Text>
            <Text style={styles.statLabel}>KES Earned</Text>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={navigateToPaymentMethods}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.primary + '20' }]}>
                  <CreditCard size={18} color={Colors.light.primary} />
                </View>
                <Text style={styles.menuItemText}>Payment Methods</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.subtext} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={navigateToReferral}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.accent + '20' }]}>
                  <Gift size={18} color={Colors.light.accent} />
                </View>
                <Text style={styles.menuItemText}>Refer & Earn</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.subtext} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={navigateToAchievements}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.warning + '20' }]}>
                  <Trophy size={18} color={Colors.light.warning} />
                </View>
                <Text style={styles.menuItemText}>Achievements</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.subtext} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>More</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={navigateToHelp}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.secondary + '20' }]}>
                  <HelpCircle size={18} color={Colors.light.secondary} />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.subtext} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={navigateToAbout}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.success + '20' }]}>
                  <Info size={18} color={Colors.light.success} />
                </View>
                <Text style={styles.menuItemText}>About SurveyPay</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.subtext} />
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={showLanguageOptions}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: Colors.light.primary + '20' }]}>
                  <Globe size={18} color={Colors.light.primary} />
                </View>
                <Text style={styles.menuItemText}>Language</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>English</Text>
                <ChevronRight size={18} color={Colors.light.subtext} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={18} color={Colors.light.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal
        visible={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        featureName={comingSoonFeature}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    marginTop: Layout.spacing.m,
  },
  profileContent: {
    width: '100%',
  },
  profileEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.m,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.xs,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 100, // Added extra padding to prevent the navigation bar from overlapping content
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.xl + 10,
    paddingBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.text,
  },
  profileCard: {
    marginHorizontal: Layout.spacing.m,
    marginVertical: Layout.spacing.s,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Layout.spacing.m,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 4,
  },
  membershipContainer: {
    flexDirection: 'row',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.m,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.s,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  menuSection: {
    marginTop: Layout.spacing.m,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  menuCard: {
    marginHorizontal: Layout.spacing.m,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.m,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.m,
  },
  menuItemText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginRight: Layout.spacing.xs,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 60,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Layout.spacing.xl,
    marginHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.error + '10',
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.error,
    marginLeft: Layout.spacing.s,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginVertical: Layout.spacing.m,
  },
});