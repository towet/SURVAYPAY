import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Clock, DollarSign } from 'lucide-react-native';

// Sample data structure for a survey
interface Survey {
  id: string;
  title: string;
  category: string;
  duration: number; // in minutes
  reward: number;
  image?: string;
}

interface RecommendedSurveysProps {
  surveys: Survey[];
}

export default function RecommendedSurveys({ surveys }: RecommendedSurveysProps) {
  const router = useRouter();

  const navigateToSurvey = (surveyId: string) => {
    router.push(`/survey/${surveyId}`);
  };
  
  const navigateToAllSurveys = () => {
    router.push('/surveys');
  };

  const renderSurveyCard = ({ item }: { item: Survey }) => (
    <TouchableOpacity
      style={styles.surveyCard}
      onPress={() => navigateToSurvey(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.card} elevation="small">
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholderImage]} />
            )}
            <Badge
              label={item.category}
              color={Colors.light.secondary}
              size="small"
              style={styles.categoryBadge}
            />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.surveyTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Clock size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText}>{item.duration} min</Text>
              </View>
              
              <View style={styles.detailItem}>
                <DollarSign size={16} color={Colors.light.success} />
                <Text style={[styles.detailText, styles.rewardText]}>
                  KES {item.reward}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommended Surveys</Text>
        <TouchableOpacity onPress={navigateToAllSurveys}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={surveys}
        renderItem={renderSurveyCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.primary,
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.s,
  },
  surveyCard: {
    width: 250,
    marginRight: Layout.spacing.m,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: Layout.borderRadius.medium,
    borderTopRightRadius: Layout.borderRadius.medium,
  },
  placeholderImage: {
    backgroundColor: Colors.light.border,
  },
  categoryBadge: {
    position: 'absolute',
    top: Layout.spacing.s,
    left: Layout.spacing.s,
  },
  infoContainer: {
    padding: Layout.spacing.m,
  },
  surveyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: Layout.spacing.s,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginLeft: 4,
  },
  rewardText: {
    color: Colors.light.success,
    fontFamily: 'Poppins-Medium',
  },
});