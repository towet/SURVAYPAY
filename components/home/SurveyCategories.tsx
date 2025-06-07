import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Users, Building2, ShoppingBag, Sparkles, Briefcase, HeartPulse } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Demographics',
    icon: <Users size={24} color="#FFF" />,
    color: Colors.light.primary,
    count: 12,
  },
  {
    id: '2',
    name: 'Business',
    icon: <Building2 size={24} color="#FFF" />,
    color: Colors.light.secondary,
    count: 8,
  },
  {
    id: '3',
    name: 'Products',
    icon: <ShoppingBag size={24} color="#FFF" />,
    color: Colors.light.accent,
    count: 15,
  },
  {
    id: '4',
    name: 'Lifestyle',
    icon: <Sparkles size={24} color="#FFF" />,
    color: Colors.light.success,
    count: 10,
  },
  {
    id: '5',
    name: 'Career',
    icon: <Briefcase size={24} color="#FFF" />,
    color: Colors.light.warning,
    count: 6,
  },
  {
    id: '6',
    name: 'Health',
    icon: <HeartPulse size={24} color="#FFF" />,
    color: Colors.light.error,
    count: 9,
  },
];

export default function SurveyCategories() {
  const router = useRouter();

  const navigateToCategory = (categoryId: string) => {
    router.push(`/surveys/category/${categoryId}`);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigateToCategory(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        {item.icon}
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.surveyCount}>{item.count} surveys</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
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
    marginVertical: Layout.spacing.s,
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
  listContainer: {
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.s,
  },
  categoryItem: {
    width: 110,
    alignItems: 'center',
    marginRight: Layout.spacing.m,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  categoryName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  surveyCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
});