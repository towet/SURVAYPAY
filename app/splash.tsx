import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/auth';

export default function SplashScreen() {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    // Start animations
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });

    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    translateY.value = withSequence(
      withDelay(
        300,
        withSpring(0, {
          damping: 20,
          stiffness: 90,
        })
      )
    );

    // Check authentication after animations
    const checkAuthAndNavigate = async () => {
      if (!mounted) return;
      
      const isAuthenticated = await checkAuth();
      if (!mounted) return;
      
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    };

    timer = setTimeout(checkAuthAndNavigate, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/7563687/pexels-photo-7563687.jpeg' }}
          style={styles.logo}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});