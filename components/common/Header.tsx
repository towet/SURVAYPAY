import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface HeaderProps {
  title: string;
}

export default function Header({
  title
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Image 
        source={require('@/assets/images/applogo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.xl + 10,
    paddingBottom: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: Colors.light.text,
  },
  logo: {
    width: 36,
    height: 36,
  },
});