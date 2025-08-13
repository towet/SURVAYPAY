import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculate safe area insets (approximation for devices without notches)
const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);
const bottomInset = Platform.OS === 'ios' ? 34 : 16; // iOS devices with home indicator need more bottom space

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isTablet: width >= 768,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    xxl: 24,
    circle: 9999,
  },
  // Safe area insets
  insets: {
    top: statusBarHeight,
    bottom: bottomInset,
    horizontal: width < 375 ? 12 : 16, // Smaller horizontal padding on small devices
  },
  // Responsive font sizes
  fontSize: {
    xs: width < 350 ? 10 : 12,
    s: width < 350 ? 12 : 14,  
    m: width < 350 ? 14 : 16,
    l: width < 350 ? 16 : 18,
    xl: width < 350 ? 18 : 22,
    xxl: width < 350 ? 22 : 28,
  },
};