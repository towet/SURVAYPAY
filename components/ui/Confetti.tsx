import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface ConfettiPieceProps {
  delay: number;
  left: number;
}

function ConfettiPiece({ delay, left }: ConfettiPieceProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSequence(
      withDelay(
        delay,
        withSpring(-200, { damping: 10, stiffness: 80 })
      ),
      withTiming(1000, { duration: 2000 })
    );
    
    scale.value = withSequence(
      withDelay(delay, withSpring(1)),
      withDelay(1000, withTiming(0))
    );
    
    rotate.value = withSequence(
      withDelay(
        delay,
        withSpring(360 * (Math.random() > 0.5 ? 1 : -1))
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        { left },
        { backgroundColor: Colors.light[
          ['primary', 'secondary', 'accent', 'success'][
            Math.floor(Math.random() * 4)
          ]
        ]},
        animatedStyle,
      ]}
    />
  );
}

export default function Confetti() {
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiPiece
          key={i}
          delay={Math.random() * 1000}
          left={Math.random() * 400}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});