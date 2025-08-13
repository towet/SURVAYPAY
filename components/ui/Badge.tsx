import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({
  label,
  color = Colors.light.primary,
  textColor = '#FFF',
  size = 'medium',
}: BadgeProps) {
  const badgeSize = {
    small: {
      paddingHorizontal: Layout.spacing.xs,
      paddingVertical: 2,
      fontSize: 10,
      borderRadius: Layout.borderRadius.small,
    },
    medium: {
      paddingHorizontal: Layout.spacing.s,
      paddingVertical: 4,
      fontSize: 12,
      borderRadius: Layout.borderRadius.medium,
    },
    large: {
      paddingHorizontal: Layout.spacing.m,
      paddingVertical: Layout.spacing.xs,
      fontSize: 14,
      borderRadius: Layout.borderRadius.medium,
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color,
          paddingHorizontal: badgeSize[size].paddingHorizontal,
          paddingVertical: badgeSize[size].paddingVertical,
          borderRadius: badgeSize[size].borderRadius,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: badgeSize[size].fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});