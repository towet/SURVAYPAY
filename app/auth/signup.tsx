import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuthStore } from '@/stores/authStore';
import BonusPopup from '@/components/ui/BonusPopup';
import { Eye, EyeOff, UserPlus, Mail, Key, User } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  
  const { signUp, isLoading, error } = useAuthStore();
  
  // Animation values
  const logoScale = useSharedValue(0.8);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);
  const errorShake = useSharedValue(0);
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }]
  }));
  
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }]
  }));
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));
  
  const errorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }]
  }));
  
  // Start animations when component mounts
  React.useEffect(() => {
    logoScale.value = withSpring(1, { damping: 15 });
    formOpacity.value = withTiming(1, { duration: 800 });
    formTranslateY.value = withTiming(0, { duration: 800 });
  }, []);
  
  // Handle button press animation
  const animateButtonPress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };
  
  // Handle error animation
  React.useEffect(() => {
    if (error || validationError) {
      errorShake.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error, validationError]);
  
  const validateInputs = (): boolean => {
    if (!username.trim()) {
      setValidationError('Username is required');
      return false;
    }
    
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      setValidationError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    
    setValidationError('');
    return true;
  };
  
  const handleSignup = async () => {
    animateButtonPress();
    
    if (!validateInputs()) {
      return;
    }
    
    try {
      const response = await signUp(email, password, username);
      
      if (!response.error) {
        console.log('Signup successful - showing welcome bonus popup');
        // Show the welcome bonus popup
        setShowWelcomeBonus(true);
        // Navigation to login will happen when the popup is closed via handleWelcomeBonusClose
      }
    } catch (error) {
      console.log('Signup error:', error);
    }
  };
  
  // Handle welcome bonus modal close
  const handleWelcomeBonusClose = () => {
    setShowWelcomeBonus(false);
    // Navigate to login page after closing the modal
    router.replace('/auth/login');
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Welcome Bonus Popup */}
      <BonusPopup
        visible={showWelcomeBonus}
        onClose={handleWelcomeBonusClose}
        amount={250}
      />
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.logoText}>SurvayPay</Text>
          <Text style={styles.tagline}>Create your account today</Text>
        </Animated.View>
        
        <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
          <Text style={styles.headerText}>Sign Up</Text>
          <Text style={styles.subHeaderText}>Start earning from surveys</Text>
          
          {(error || validationError) && (
            <Animated.View style={[styles.errorContainer, errorAnimatedStyle]}>
              <Text style={styles.errorText}>{error || validationError}</Text>
            </Animated.View>
          )}
          
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.light.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={Colors.light.subtext}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.light.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.light.subtext}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Key size={20} color={Colors.light.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.light.subtext}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? 
                <EyeOff size={20} color={Colors.light.subtext} /> : 
                <Eye size={20} color={Colors.light.subtext} />
              }
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Key size={20} color={Colors.light.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={Colors.light.subtext}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              {showConfirmPassword ? 
                <EyeOff size={20} color={Colors.light.subtext} /> : 
                <Eye size={20} color={Colors.light.subtext} />
              }
            </TouchableOpacity>
          </View>
          
          <Text style={styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
          
          <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.signupButtonText}>Create Account</Text>
                  <UserPlus size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.l,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: Colors.light.primary,
    marginBottom: Layout.spacing.xs,
  },
  tagline: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: isSmallScreen ? 22 : 24,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  subHeaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.l,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: Layout.borderRadius.small,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.light.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.light.card,
    height: 55,
    paddingHorizontal: Layout.spacing.m,
  },
  inputIcon: {
    marginRight: Layout.spacing.m,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.light.text,
    paddingLeft: 5, // Add padding to prevent first letter from hiding
  },
  passwordToggle: {
    padding: Layout.spacing.xs,
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: Layout.spacing.s,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.medium,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  signupButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFF',
    marginRight: Layout.spacing.s,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.m,
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
  },
  loginLink: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: Colors.light.primary,
  },
});
