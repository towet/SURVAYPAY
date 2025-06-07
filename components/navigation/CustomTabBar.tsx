import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Colors from '@/constants/Colors';
import { Home, LayoutGrid, BarChart2, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 65;

// Define colors for each tab
const tabColors = {
  home: '#6C63FF',
  surveys: '#4ECDC4',
  earnings: '#FFB627',
  profile: '#FF6B6B',
};

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

const TabItem = ({ icon, label, isActive, onPress, color }: TabItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.tabItemContent}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        
        {isActive ? (
          <LinearGradient
            colors={[color, color]}
            style={styles.activePill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.activeLabel}>{label}</Text>
          </LinearGradient>
        ) : (
          <Text style={[styles.inactiveLabel, {color: Colors.light.tabIconDefault}]}>
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine which tab is active based on the current path
  const isHomeActive = pathname === '/' || pathname === '/index';
  const isSurveysActive = pathname?.includes('/surveys');
  const isEarningsActive = pathname?.includes('/earnings');
  const isProfileActive = pathname?.includes('/profile');
  
  // Navigation handlers
  const goToHome = () => router.push('/');
  const goToSurveys = () => router.push('/surveys');
  const goToEarnings = () => router.push('/earnings');
  const goToProfile = () => router.push('/profile');
  
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TabItem
          icon={<Home size={24} color={tabColors.home} />}
          label="Home"
          isActive={isHomeActive}
          onPress={goToHome}
          color={tabColors.home}
        />
        
        <TabItem
          icon={<LayoutGrid size={24} color={tabColors.surveys} />}
          label="Surveys"
          isActive={isSurveysActive}
          onPress={goToSurveys}
          color={tabColors.surveys}
        />
        
        <TabItem
          icon={<BarChart2 size={24} color={tabColors.earnings} />}
          label="Earnings"
          isActive={isEarningsActive}
          onPress={goToEarnings}
          color={tabColors.earnings}
        />
        
        <TabItem
          icon={<User size={24} color={tabColors.profile} />}
          label="Profile"
          isActive={isProfileActive}
          onPress={goToProfile}
          color={tabColors.profile}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  inactiveLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  activeLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    fontSize: 12,
  },
  activePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  }
});
