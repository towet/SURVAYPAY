import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import Colors from '@/constants/Colors';
import Header from '@/components/common/Header';
import EarningsSummary from '@/components/home/EarningsSummary';
import MembershipCard from '@/components/home/MembershipCard';
import SurveyCategories from '@/components/home/SurveyCategories';
import RecommendedSurveys from '@/components/home/RecommendedSurveys';
import { useRouter } from 'expo-router';

// Sample surveys data
const sampleSurveys = [
  // Regular surveys (100 KSH) first
  {
    id: '1',
    title: 'Shopping Habits in Kenya',
    category: 'Shopping',
    duration: 10,
    reward: 100, // Regular survey
    image: 'https://images.pexels.com/photos/5632379/pexels-photo-5632379.jpeg',
    isPremium: false
  },
  {
    id: '3',
    title: 'Food Delivery Service Feedback',
    category: 'Food',
    duration: 8,
    reward: 100, // Regular survey
    image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg',
    isPremium: false
  },
  {
    id: '4',
    title: 'Social Media Usage Patterns',
    category: 'Technology',
    duration: 12,
    reward: 100, // Regular survey
    image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg',
    isPremium: false
  },
  // Premium surveys (250 KSH) after
  {
    id: '2',
    title: 'Mobile Banking Experience Survey',
    category: 'Finance',
    duration: 15,
    reward: 250, // Premium survey
    image: 'https://images.pexels.com/photos/5926383/pexels-photo-5926383.jpeg',
    isPremium: true
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleMembershipPress = () => {
    router.push('/membership');
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  return (
    <View style={styles.container}>
      <Header
        title="SurveyPay"
        hasNotifications={true}
        notificationCount={3}
        onNotificationPress={handleNotificationPress}
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
        <EarningsSummary
          currentEarnings={250}
          targetEarnings={1000}
          maxDailyEarnings={850}
        />
        
        <MembershipCard
          tier="Basic"
          onPress={handleMembershipPress}
        />
        
        <SurveyCategories />
        
        <RecommendedSurveys surveys={sampleSurveys} />
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
});