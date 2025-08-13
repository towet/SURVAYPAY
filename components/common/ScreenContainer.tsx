import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noTabBar?: boolean;
}

/**
 * Screen container component that properly handles bottom spacing for tab bar
 */
export default function ScreenContainer({ children, style, noTabBar = false }: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={[
        styles.container, 
        noTabBar ? null : styles.withTabBar
      ]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  withTabBar: {
    paddingBottom: 70, // Matches tab bar height
  },
});
