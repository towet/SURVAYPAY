import { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, Animated } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ArrowRight } from 'lucide-react-native';

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to SurveyPay',
    description: 'Earn money by sharing your opinions. Complete surveys and get paid in KES.',
    image: 'https://images.pexels.com/photos/7563687/pexels-photo-7563687.jpeg'
  },
  {
    id: '2',
    title: 'Choose Your Surveys',
    description: 'Browse through different categories and select surveys that interest you.',
    image: 'https://images.pexels.com/photos/6953871/pexels-photo-6953871.jpeg'
  },
  {
    id: '3',
    title: 'Track Your Earnings',
    description: 'Watch your balance grow with each completed survey and cash out when ready.',
    image: 'https://images.pexels.com/photos/6953855/pexels-photo-6953855.jpeg'
  },
  {
    id: '4',
    title: 'Upgrade Your Membership',
    description: 'Unlock premium surveys and higher payouts with our membership tiers.',
    image: 'https://images.pexels.com/photos/5926393/pexels-photo-5926393.jpeg'
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(tabs)');
    }
  };

  const skipToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipToHome}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <FlatList
        data={onboardingData}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        ref={slidesRef}
      />

      <View style={styles.paginationContainer}>
        <View style={styles.paginationDots}>
          {onboardingData.map((_, index) => {
            const inputRange = [
              (index - 1) * Layout.window.width,
              index * Layout.window.width,
              (index + 1) * Layout.window.width
            ];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View 
                key={index} 
                style={[
                  styles.dot, 
                  { 
                    width: dotWidth,
                    opacity
                  }
                ]} 
              />
            );
          })}
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={20} color="#FFF" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
  slide: {
    width: Layout.window.width,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: Layout.window.width * 0.8,
    height: Layout.window.width * 0.8,
    borderRadius: 20,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    maxWidth: '80%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFF',
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 5,
  }
});