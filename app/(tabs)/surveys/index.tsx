import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Header from '@/components/common/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Clock, DollarSign, Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';

// Survey data structure
interface Survey {
  id: string;
  title: string;
  category: string;
  duration: number;
  reward: number;
  tags: string[];
  isPremium: boolean;
  categoryId: string;
}

// Sample data
// Function to ensure proper reward values based on premium status
const getPremiumReward = () => 250; // Premium surveys pay 250 KSH
const getRegularReward = () => 100; // Regular surveys pay 100 KSH

export const availableSurveys: Survey[] = [
  // ========== DEMOGRAPHICS (Category 1) ==========
  // Regular surveys (100 KSH each)
  {
    id: 'demo1',
    title: 'Age Group Demographics',
    category: 'Demographics',
    duration: 8,
    reward: 100,
    tags: ['Age', 'Population'],
    isPremium: false,
    categoryId: '1'
  },
  {
    id: 'demo2',
    title: 'Education Background Survey',
    category: 'Demographics',
    duration: 12,
    reward: 100,
    tags: ['Education', 'Academic'],
    isPremium: false,
    categoryId: '1'
  },
  {
    id: 'demo3',
    title: 'Family Structure Survey',
    category: 'Demographics',
    duration: 10,
    reward: 100,
    tags: ['Family', 'Household'],
    isPremium: false,
    categoryId: '1'
  },
  {
    id: 'demo4',
    title: 'Income Distribution Analysis',
    category: 'Demographics',
    duration: 15,
    reward: 100,
    tags: ['Income', 'Economics'],
    isPremium: false,
    categoryId: '1'
  },
  {
    id: 'demo5',
    title: 'Housing Patterns Survey',
    category: 'Demographics',
    duration: 12,
    reward: 100,
    tags: ['Housing', 'Living'],
    isPremium: false,
    categoryId: '1'
  },
  // Premium surveys (250 KSH each)
  {
    id: 'demo6',
    title: 'Comprehensive Household Expenditure',
    category: 'Demographics',
    duration: 20,
    reward: 250,
    tags: ['Spending', 'Economics', 'Premium'],
    isPremium: true,
    categoryId: '1'
  },
  {
    id: 'demo7',
    title: 'Urban vs Rural Lifestyle Analysis',
    category: 'Demographics',
    duration: 25,
    reward: 250,
    tags: ['Urban', 'Rural', 'Premium'],
    isPremium: true,
    categoryId: '1'
  },
  {
    id: 'demo8',
    title: 'Regional Migration Patterns',
    category: 'Demographics',
    duration: 18,
    reward: 250,
    tags: ['Migration', 'Population', 'Premium'],
    isPremium: true,
    categoryId: '1'
  },
  {
    id: 'demo9',
    title: 'Cultural Identity Assessment',
    category: 'Demographics',
    duration: 30,
    reward: 250,
    tags: ['Culture', 'Identity', 'Premium'],
    isPremium: true,
    categoryId: '1'
  },
  {
    id: 'demo10',
    title: 'Employment Status Deep Dive',
    category: 'Demographics',
    duration: 22,
    reward: 250,
    tags: ['Employment', 'Work', 'Premium'],
    isPremium: true,
    categoryId: '1'
  },

  // ========== BUSINESS (Category 2) ==========
  // Regular surveys (100 KSH each)
  {
    id: 'bus1',
    title: 'Small Business Operations',
    category: 'Business',
    duration: 12,
    reward: 100,
    tags: ['SME', 'Operations'],
    isPremium: false,
    categoryId: '2'
  },
  {
    id: 'bus2',
    title: 'Remote Work Practices',
    category: 'Business',
    duration: 8,
    reward: 100,
    tags: ['Remote', 'Work'],
    isPremium: false,
    categoryId: '2'
  },
  {
    id: 'bus3',
    title: 'Business Communication Tools',
    category: 'Business',
    duration: 10,
    reward: 100,
    tags: ['Communication', 'Tools'],
    isPremium: false,
    categoryId: '2'
  },
  {
    id: 'bus4',
    title: 'Office Environment Preferences',
    category: 'Business',
    duration: 7,
    reward: 100,
    tags: ['Office', 'Workspace'],
    isPremium: false,
    categoryId: '2'
  },
  {
    id: 'bus5',
    title: 'Mobile Banking Experience Survey',
    category: 'Business',
    duration: 15,
    reward: 100,
    tags: ['Banking', 'Mobile'],
    isPremium: false,
    categoryId: '2'
  },
  // Premium surveys (250 KSH each)
  {
    id: 'bus6',
    title: 'Corporate Strategy Assessment',
    category: 'Business',
    duration: 30,
    reward: 250,
    tags: ['Strategy', 'Corporate', 'Premium'],
    isPremium: true,
    categoryId: '2'
  },
  {
    id: 'bus7',
    title: 'Financial Market Analysis',
    category: 'Business',
    duration: 25,
    reward: 250,
    tags: ['Finance', 'Markets', 'Premium'],
    isPremium: true,
    categoryId: '2'
  },
  {
    id: 'bus8',
    title: 'Executive Leadership Insights',
    category: 'Business',
    duration: 35,
    reward: 250,
    tags: ['Leadership', 'Executive', 'Premium'],
    isPremium: true,
    categoryId: '2'
  },
  {
    id: 'bus9',
    title: 'Digital Transformation Strategy',
    category: 'Business',
    duration: 28,
    reward: 250,
    tags: ['Digital', 'Transformation', 'Premium'],
    isPremium: true,
    categoryId: '2'
  },
  {
    id: 'bus10',
    title: 'Business Expansion Readiness',
    category: 'Business',
    duration: 40,
    reward: 250,
    tags: ['Expansion', 'Growth', 'Premium'],
    isPremium: true,
    categoryId: '2'
  },
  
  // ========== PRODUCTS (Category 3) ==========
  // Regular surveys (100 KSH each)
  {
    id: 'prod1',
    title: 'Shopping Habits in Kenya',
    category: 'Products',
    duration: 10,
    reward: 100,
    tags: ['Retail', 'Consumer'],
    isPremium: false,
    categoryId: '3'
  },
  {
    id: 'prod2',
    title: 'Household Products Usage',
    category: 'Products',
    duration: 12,
    reward: 100,
    tags: ['Household', 'Consumer'],
    isPremium: false,
    categoryId: '3'
  },
  {
    id: 'prod3',
    title: 'Food Delivery Service Feedback',
    category: 'Products',
    duration: 8,
    reward: 100,
    tags: ['Delivery', 'Service'],
    isPremium: false,
    categoryId: '3'
  },
  {
    id: 'prod4',
    title: 'Online Shopping Experience',
    category: 'Products',
    duration: 15,
    reward: 100,
    tags: ['Online', 'Shopping'],
    isPremium: false,
    categoryId: '3'
  },
  {
    id: 'prod5',
    title: 'Consumer Electronics Preferences',
    category: 'Products',
    duration: 10,
    reward: 100,
    tags: ['Electronics', 'Gadgets'],
    isPremium: false,
    categoryId: '3'
  },
  // Premium surveys (250 KSH each)
  {
    id: 'prod6',
    title: 'Luxury Goods Market Research',
    category: 'Products',
    duration: 22,
    reward: 250,
    tags: ['Luxury', 'Premium', 'High-end'],
    isPremium: true,
    categoryId: '3'
  },
  {
    id: 'prod7',
    title: 'Beauty Industry Trends Analysis',
    category: 'Products',
    duration: 20,
    reward: 250,
    tags: ['Beauty', 'Cosmetics', 'Premium'],
    isPremium: true,
    categoryId: '3'
  },
  {
    id: 'prod8',
    title: 'Automotive Market Preferences',
    category: 'Products',
    duration: 30,
    reward: 250,
    tags: ['Automotive', 'Vehicle', 'Premium'],
    isPremium: true,
    categoryId: '3'
  },
  {
    id: 'prod9',
    title: 'Smart Home Technology Assessment',
    category: 'Products',
    duration: 25,
    reward: 250,
    tags: ['Smart Home', 'IoT', 'Premium'],
    isPremium: true,
    categoryId: '3'
  },
  {
    id: 'prod10',
    title: 'Premium Food and Beverage Trends',
    category: 'Products',
    duration: 18,
    reward: 250,
    tags: ['Food', 'Beverage', 'Premium'],
    isPremium: true,
    categoryId: '3'
  },

  // ========== LIFESTYLE (Category 4) ==========
  // Regular surveys (100 KSH each)
  {
    id: 'life1',
    title: 'Social Media Usage Patterns',
    category: 'Lifestyle',
    duration: 12,
    reward: 100,
    tags: ['Social', 'Internet'],
    isPremium: false,
    categoryId: '4'
  },
  {
    id: 'life2',
    title: 'Entertainment Preferences',
    category: 'Lifestyle',
    duration: 10,
    reward: 100,
    tags: ['Entertainment', 'Leisure'],
    isPremium: false,
    categoryId: '4'
  },
  {
    id: 'life3',
    title: 'Daily Routine Analysis',
    category: 'Lifestyle',
    duration: 15,
    reward: 100,
    tags: ['Routine', 'Daily'],
    isPremium: false,
    categoryId: '4'
  },
  {
    id: 'life4',
    title: 'Hobbies and Interests Survey',
    category: 'Lifestyle',
    duration: 8,
    reward: 100,
    tags: ['Hobbies', 'Interests'],
    isPremium: false,
    categoryId: '4'
  },
  {
    id: 'life5',
    title: 'Weekend Activities Preferences',
    category: 'Lifestyle',
    duration: 10,
    reward: 100,
    tags: ['Weekend', 'Activities'],
    isPremium: false,
    categoryId: '4'
  },
  // Premium surveys (250 KSH each)
  {
    id: 'life6',
    title: 'International Travel Patterns',
    category: 'Lifestyle',
    duration: 25,
    reward: 250,
    tags: ['Travel', 'International', 'Premium'],
    isPremium: true,
    categoryId: '4'
  },
  {
    id: 'life7',
    title: 'Fine Dining Experience Analysis',
    category: 'Lifestyle',
    duration: 20,
    reward: 250,
    tags: ['Dining', 'Cuisine', 'Premium'],
    isPremium: true,
    categoryId: '4'
  },
  {
    id: 'life8',
    title: 'Fashion Trends and Preferences',
    category: 'Lifestyle',
    duration: 18,
    reward: 250,
    tags: ['Fashion', 'Trends', 'Premium'],
    isPremium: true,
    categoryId: '4'
  },
  {
    id: 'life9',
    title: 'Luxury Vacation Destinations',
    category: 'Lifestyle',
    duration: 30,
    reward: 250,
    tags: ['Vacation', 'Luxury', 'Premium'],
    isPremium: true,
    categoryId: '4'
  },
  {
    id: 'life10',
    title: 'Personal Wellness Regimen',
    category: 'Lifestyle',
    duration: 22,
    reward: 250,
    tags: ['Wellness', 'Self-care', 'Premium'],
    isPremium: true,
    categoryId: '4'
  },

  // ========== CAREER (Category 5) ==========
  // Regular surveys (100 KSH each)
  {
    id: 'career1',
    title: 'Job Satisfaction Assessment',
    category: 'Career',
    duration: 12,
    reward: 100,
    tags: ['Job', 'Satisfaction'],
    isPremium: false,
    categoryId: '5'
  },
  {
    id: 'career2',
    title: 'Work-Life Balance Survey',
    category: 'Career',
    duration: 10,
    reward: 100,
    tags: ['Work-Life', 'Balance'],
    isPremium: false,
    categoryId: '5'
  },
  {
    id: 'career3',
    title: 'Remote Work Challenges',
    category: 'Career',
    duration: 8,
    reward: 100,
    tags: ['Remote', 'Challenges'],
    isPremium: false,
    categoryId: '5'
  },
  {
    id: 'career4',
    title: 'Skills Development Needs',
    category: 'Career',
    duration: 15,
    reward: 100,
    tags: ['Skills', 'Development'],
    isPremium: false,
    categoryId: '5'
  },
  {
    id: 'career5',
    title: 'Job Search Methods Survey',
    category: 'Career',
    duration: 10,
    reward: 100,
    tags: ['Job Search', 'Methods'],
    isPremium: false,
    categoryId: '5'
  },
  // Premium surveys (250 KSH each)
  {
    id: 'career6',
    title: 'Executive Career Progression',
    category: 'Career',
    duration: 30,
    reward: 250,
    tags: ['Executive', 'Progression', 'Premium'],
    isPremium: true,
    categoryId: '5'
  },
  {
    id: 'career7',
    title: 'Industry Leadership Analysis',
    category: 'Career',
    duration: 25,
    reward: 250,
    tags: ['Leadership', 'Industry', 'Premium'],
    isPremium: true,
    categoryId: '5'
  },
  {
    id: 'career8',
    title: 'International Career Opportunities',
    category: 'Career',
    duration: 20,
    reward: 250,
    tags: ['International', 'Opportunities', 'Premium'],
    isPremium: true,
    categoryId: '5'
  },
  {
    id: 'career9',
    title: 'High-level Compensation Analysis',
    category: 'Career',
    duration: 35,
    reward: 250,
    tags: ['Compensation', 'Salary', 'Premium'],
    isPremium: true,
    categoryId: '5'
  },
  {
    id: 'career10',
    title: 'Corporate Board Positions Survey',
    category: 'Career',
    duration: 28,
    reward: 250,
    tags: ['Board', 'Corporate', 'Premium'],
    isPremium: true,
    categoryId: '5'
  },

  // ========== HEALTH (Category 6) ==========
  // Regular surveys (100 KSH each)
  {
    id: 'health1',
    title: 'Healthcare Services Satisfaction',
    category: 'Health',
    duration: 20,
    reward: 100,
    tags: ['Medical', 'Service'],
    isPremium: false,
    categoryId: '6'
  },
  {
    id: 'health2',
    title: 'Exercise Habits Survey',
    category: 'Health',
    duration: 10,
    reward: 100,
    tags: ['Exercise', 'Fitness'],
    isPremium: false,
    categoryId: '6'
  },
  {
    id: 'health3',
    title: 'Nutrition and Diet Assessment',
    category: 'Health',
    duration: 15,
    reward: 100,
    tags: ['Nutrition', 'Diet'],
    isPremium: false,
    categoryId: '6'
  },
  {
    id: 'health4',
    title: 'Sleep Patterns Analysis',
    category: 'Health',
    duration: 12,
    reward: 100,
    tags: ['Sleep', 'Rest'],
    isPremium: false,
    categoryId: '6'
  },
  {
    id: 'health5',
    title: 'Public Transportation Experience',
    category: 'Health',
    duration: 10,
    reward: 100,
    tags: ['Public', 'Urban'],
    isPremium: false,
    categoryId: '6'
  },
  // Premium surveys (250 KSH each)
  {
    id: 'health6',
    title: 'Comprehensive Health Assessment',
    category: 'Health',
    duration: 35,
    reward: 250,
    tags: ['Comprehensive', 'Assessment', 'Premium'],
    isPremium: true,
    categoryId: '6'
  },
  {
    id: 'health7',
    title: 'Mental Wellness Deep Dive',
    category: 'Health',
    duration: 30,
    reward: 250,
    tags: ['Mental', 'Wellness', 'Premium'],
    isPremium: true,
    categoryId: '6'
  },
  {
    id: 'health8',
    title: 'Specialized Medical Treatments',
    category: 'Health',
    duration: 25,
    reward: 250,
    tags: ['Specialized', 'Medical', 'Premium'],
    isPremium: true,
    categoryId: '6'
  },
  {
    id: 'health9',
    title: 'Private Healthcare Options',
    category: 'Health',
    duration: 20,
    reward: 250,
    tags: ['Private', 'Healthcare', 'Premium'],
    isPremium: true,
    categoryId: '6'
  },
  {
    id: 'health10',
    title: 'Advanced Fitness Program Analysis',
    category: 'Health',
    duration: 28,
    reward: 250,
    tags: ['Advanced', 'Fitness', 'Premium'],
    isPremium: true,
    categoryId: '6'
  }
];

// Filter tabs
const filterTabs = [
  { id: 'all', label: 'All Surveys' },
  { id: 'newest', label: 'Newest' },
  { id: 'highest', label: 'Highest Paying' },
  { id: 'quickest', label: 'Quick Surveys' },
];

export default function SurveysScreen() {
  const router = useRouter();
  const { canAccessPremiumContent, setLastAttemptedPremiumSurvey } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const navigateToSurvey = (surveyId: string) => {
    router.push(`/survey/${surveyId}`);
  };

  const navigateToSearch = () => {
    // Using a properly typed path for router
    router.push('/search' as any);
  };

  const navigateToFilters = () => {
    // Using a properly typed path for router
    router.push('/filters' as any);
  };

  // Handle survey selection
  const handleSelectSurvey = (survey: Survey) => {
    // Check if it's a premium survey
    if (survey.isPremium) {
      // Store the last attempted premium survey ID
      setLastAttemptedPremiumSurvey(survey.id);
      
      // For premium surveys, check if user has premium access
      if (!canAccessPremiumContent()) {
        // If not, navigate to the premium version which will show the upgrade modal
        if (survey.category === 'Finance') {
          router.push('/survey/finance-premium1');
        } else if (survey.category === 'Technology') {
          router.push('/survey/tech-premium1');
        } else {
          // For other categories, fallback to a general survey
          router.push(`/survey/${survey.id}`);
        }
        return;
      }
    }
    
    // Navigate to the specific survey
    if (survey.category === 'Finance') {
      if (survey.isPremium) {
        router.push('/survey/finance-premium1');
      } else {
        router.push('/survey/finance-survey');
      }
    } else if (survey.category === 'Technology') {
      if (survey.isPremium) {
        router.push('/survey/tech-premium1');
      } else {
        router.push('/survey/tech-survey');
      }
    } else {
      // For other categories, fallback to a general survey
      router.push(`/survey/${survey.id}`);
    }
  };

  // Filter surveys based on active tab
  const getFilteredSurveys = () => {
    switch (selectedCategory) {
      case 'newest':
        // In a real app, we'd sort by date
        return [...availableSurveys].sort((a, b) => b.id.localeCompare(a.id));
      case 'highest':
        return [...availableSurveys].sort((a, b) => b.reward - a.reward);
      case 'quickest':
        return [...availableSurveys].sort((a, b) => a.duration - b.duration);
      default:
        // Sort surveys to show regular (100 KSH) surveys first, then premium (250 KSH) surveys
        return [...availableSurveys].sort((a, b) => {
          if (a.isPremium === b.isPremium) return 0;
          return a.isPremium ? 1 : -1; // Regular surveys (isPremium: false) appear first
        });
    }
  };

  const renderSurveyItem = ({ item }: { item: Survey }) => (
    <TouchableOpacity
      style={styles.surveyItem}
      onPress={() => navigateToSurvey(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.surveyCard}>
        <View style={styles.surveyHeader}>
          <Badge label={item.category} color={item.isPremium ? Colors.light.accent : Colors.light.secondary} />
          <Text style={styles.reward}>KES {item.reward}</Text>
        </View>
        
        <Text style={styles.surveyTitle}>{item.title}</Text>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.surveyFooter}>
          <View style={styles.footerItem}>
            <Clock size={16} color={Colors.light.subtext} />
            <Text style={styles.footerText}>{item.duration} min</Text>
          </View>
          
          <View style={styles.footerItem}>
            <DollarSign size={16} color={Colors.light.success} />
            <Text style={[styles.footerText, styles.rewardText]}>
              KES {item.reward} {item.isPremium && '(Premium)'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Surveys" />
      
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={navigateToSearch}
          activeOpacity={0.7}
        >
          <Search size={20} color={Colors.light.subtext} />
          <Text style={styles.searchPlaceholder}>Search surveys...</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={navigateToFilters}
        >
          <Filter size={20} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedCategory === tab.id && styles.activeTab
            ]}
            onPress={() => setSelectedCategory(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === tab.id && styles.activeTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FlatList
        data={getFilteredSurveys()}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.surveysListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    marginRight: Layout.spacing.s,
  },
  searchPlaceholder: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: Layout.spacing.s,
  },
  filterButton: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.s,
  },
  tabsContainer: {
    flexGrow: 0,
    marginBottom: Layout.spacing.m,
  },
  tabsContent: {
    paddingHorizontal: Layout.spacing.m,
  },
  tab: {
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.medium,
    marginRight: Layout.spacing.s,
    backgroundColor: Colors.light.card,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  activeTabText: {
    color: '#FFF',
  },
  surveysListContent: {
    padding: Layout.spacing.m,
    paddingBottom: 100, // Added extra bottom padding to prevent navigation overlap
  },
  surveyItem: {
    marginBottom: Layout.spacing.m,
  },
  surveyCard: {
    padding: Layout.spacing.m,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  reward: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.success,
  },
  surveyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: Layout.spacing.s,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.s,
  },
  tag: {
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.small,
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: 2,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  tagText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
  surveyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.xs,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 4,
  },
  rewardText: {
    fontFamily: 'Poppins-Medium',
    color: Colors.light.success,
  },
});