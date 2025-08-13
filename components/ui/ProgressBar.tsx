import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = Colors.light.border,
  progressColor = Colors.light.primary,
  animated = true,
}: ProgressBarProps) {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Create a shared value for the width
  const widthValue = useSharedValue(clampedProgress);
  
  // Update the width when progress changes
  React.useEffect(() => {
    if (animated) {
      widthValue.value = withSpring(clampedProgress, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      widthValue.value = withTiming(clampedProgress, {
        duration: 300,
      });
    }
  }, [clampedProgress, animated, widthValue]);

  // Create the animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthValue.value * 100}%`,
    };
  });

  return (
    <View 
      style={[
        styles.container, 
        { 
          height, 
          backgroundColor 
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.progress, 
          { 
            backgroundColor: progressColor 
          },
          animatedStyle
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});