import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Header from '@/components/common/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Clock, DollarSign, ArrowLeft } from 'lucide-react-native';
import { getCorrectReward } from '@/utils/surveyUtils';

// Helper functions for consistent reward values
const getPremiumReward = () => 250; // Premium surveys pay 250 KSH
const getRegularReward = () => 100; // Regular surveys pay 100 KSH

// Sample surveys data - in a real app, this would be filtered from a database
const categoryData = {
  '1': {
    name: 'Demographics',
    color: Colors.light.primary,
    surveys: [
      {
        id: '101',
        title: 'Age and Income Demographics Survey',
        duration: 12,
        reward: 250, // Premium survey
        tags: ['Age', 'Income', 'Premium'],
        isPremium: true
      },
      {
        id: '102',
        title: 'Household Composition Survey',
        duration: 8,
        reward: 100, // Regular survey
        tags: ['Family', 'Household'],
        isPremium: false
      },
      {
        id: '103',
        title: 'Education and Employment Survey',
        duration: 15,
        reward: 250,
        tags: ['Education', 'Career', 'Premium'],
        isPremium: true
      },
    ],
  },
  '2': {
    name: 'Business',
    color: Colors.light.secondary,
    surveys: [
      {
        id: '201',
        title: 'Small Business Owner Feedback',
        duration: 18,
        reward: 250,
        tags: ['Small Business', 'Owner', 'Premium'],
        isPremium: true
      },
      {
        id: '202',
        title: 'Business Software Usage Survey',
        duration: 10,
        reward: 100,
        tags: ['Software', 'Tools'],
        isPremium: false
      },
    ],
  },
  '3': {
    name: 'Products',
    color: Colors.light.accent,
    surveys: [
      {
        id: '301',
        title: 'Electronics Product Feedback',
        duration: 12,
        reward: 250,
        tags: ['Electronics', 'Gadgets', 'Premium'],
        isPremium: true
      },
      {
        id: '302',
        title: 'Household Products Satisfaction',
        duration: 8,
        reward: 100,
        tags: ['Home', 'Products'],
        isPremium: false
      },
      {
        id: '303',
        title: 'Beauty Products Survey',
        duration: 10,
        reward: 100,
        tags: ['Beauty', 'Skincare'],
        isPremium: false
      },
    ],
  },
  '4': {
    name: 'Lifestyle',
    color: Colors.light.success,
    surveys: [
      {
        id: '401',
        title: 'Entertainment Preferences',
        duration: 12,
        reward: 250,
        tags: ['Entertainment', 'Leisure', 'Premium'],
        isPremium: true
      },
      {
        id: '402',
        title: 'Travel Habits Survey',
        duration: 15,
        reward: 100,
        tags: ['Travel', 'Vacation'],
        isPremium: false
      },
    ],
  },
  '5': {
    name: 'Career',
    color: Colors.light.warning,
    surveys: [
      {
        id: '501',
        title: 'Work Satisfaction Survey',
        duration: 15,
        reward: 250,
        tags: ['Workplace', 'Satisfaction', 'Premium'],
        isPremium: true
      },
      {
        id: '502',
        title: 'Remote Work Experience',
        duration: 10,
        reward: 100,
        tags: ['Remote', 'Work'],
        isPremium: false
      },
    ],
  },
  '6': {
    name: 'Health',
    color: Colors.light.error,
    surveys: [
      {
        id: '601',
        title: 'Fitness Routine Survey',
        duration: 12,
        reward: 100,
        tags: ['Fitness', 'Exercise'],
        isPremium: false
      },
      {
        id: '602',
        title: 'Nutrition and Diet Habits',
        duration: 15,
        reward: 250,
        isPremium: true,
        tags: ['Nutrition', 'Diet'],
      },
      {
        id: '603',
        title: 'Mental Health Awareness',
        duration: 20,
        reward: 250,
        tags: ['Mental Health', 'Wellness'],
      },
    ],
  },
};

export default function CategoryScreen() {
  // Get category ID from URL params and ensure it's a string
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : (Array.isArray(params.id) ? params.id[0] : '1');
  const router = useRouter();
  // Define category type for better type checking
  interface CategoryType {
    name: string;
    color: string;
    surveys: {
      id: string;
      title: string;
      duration: number;
      reward: number;
      tags: string[];
      isPremium: boolean;
    }[];
  }
  
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<CategoryType | null>(null);

  useEffect(() => {
    // Get category by ID with proper type safety
    if (id) {
      // Use a type assertion to tell TypeScript that id is a valid key
      const categoryId = id as keyof typeof categoryData;
      const categoryInfo = categoryData[categoryId];
      if (categoryInfo) {
        setCategory(categoryInfo as CategoryType);
      } else {
        setCategory(null);
      }
    }
  }, [id]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSurveyPress = (surveyId: string, isPremium: boolean, categoryName: string) => {
    // Map category and survey type to specific route
    if (categoryName === 'Finance' || categoryName === 'Business') {
      if (isPremium) {
        router.push('/survey/finance-premium1');
      } else {
        router.push('/survey/finance-survey');
      }
    } else if (categoryName === 'Technology' || categoryName === 'Products') {
      if (isPremium) {
        router.push('/survey/tech-premium1');
      } else {
        router.push('/survey/tech-survey');
      }
    } else {
      // For any other category, direct to the appropriate standard type
      if (isPremium) {
        router.push('/survey/finance-premium1'); // Default premium survey
      } else {
        router.push('/survey/tech-survey'); // Default regular survey
      }
    }
  };

  const goBack = () => {
    router.back();
  };

  // Function to ensure consistent reward values based on premium status
  const getSurveyWithCorrectReward = (survey: any) => {
    return {
      ...survey,
      reward: survey.isPremium ? 250 : 100
    };
  };

  // Define the survey item interface for better type checking
  interface SurveyItem {
    id: string;
    title: string;
    duration: number;
    reward: number;
    tags: string[];
    isPremium: boolean;
  }
  
  const renderSurveyItem = ({ item }: { item: SurveyItem }) => {
    // Apply correct reward amount based on premium status
    const surveyWithCorrectReward = getSurveyWithCorrectReward(item);
    
    return (
      <TouchableOpacity
        key={surveyWithCorrectReward.id}
        style={styles.surveyItem}
        onPress={() => handleSurveyPress(surveyWithCorrectReward.id, surveyWithCorrectReward.isPremium, category?.name || 'Default')}
        activeOpacity={0.8}
      >
        <Card style={styles.surveyCard}>
          <View style={styles.surveyHeader}>
            <Badge 
              label={category ? category.name : 'Category'} 
              color={category ? category.color : Colors.light.primary} 
            />
            <Text style={styles.reward}>KES {surveyWithCorrectReward.isPremium ? 250 : 100}</Text>
          </View>
          
          <Text style={styles.surveyTitle}>{surveyWithCorrectReward.title}</Text>
          
          <View style={styles.tagsContainer}>
            {surveyWithCorrectReward.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.surveyFooter}>
            <View style={styles.footerItem}>
              <Clock size={16} color={Colors.light.subtext} />
              <Text style={styles.footerText}>{surveyWithCorrectReward.duration} min</Text>
            </View>
            
            <View style={styles.footerItem}>
              <DollarSign size={16} color={surveyWithCorrectReward.isPremium ? Colors.light.accent : Colors.light.success} />
              <Text style={[styles.footerText, styles.rewardText]}>
                KES {surveyWithCorrectReward.isPremium ? 250 : 100}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category ? category.name : 'Category'} Surveys</Text>
          <View style={{width: 24}} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.noDataText}>This category doesn't exist or has no surveys.</Text>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category ? category.name : 'Category'} Surveys</Text>
        <View style={{width: 24}} />
      </View>
      
      <FlatList
        data={category ? [...category.surveys].sort((a, b) => {
          if (a.isPremium === b.isPremium) return 0;
          return a.isPremium ? 1 : -1; // Regular surveys (isPremium: false) appear first
        }) : []}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.surveysListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.noDataText}>No surveys available for this category.</Text>
          </View>
        }
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  noDataText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
  },
  backButton: {
    padding: Layout.spacing.m,
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
  },
  backButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    fontSize: 16,
  },
  surveysListContent: {
    padding: Layout.spacing.m,
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
