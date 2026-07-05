import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await login(trimmedEmail, trimmedPassword);
      
      if (response.success) {
        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 200);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Login Failed', 'Incorrect email or password.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
      {/* Ambient Glows */}
      <View style={[styles.ambientGlow, styles.glowTopLeft]} />
      <View style={[styles.ambientGlow, styles.glowBottomRight]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="calculator" size={24} color="#ffffff" />
              </View>
              <Text style={styles.logoText}>MathMentor AI</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.welcomeTitle}>Welcome back</Text>
                <Text style={styles.welcomeSubtitle}>Access your personalized tutor dashboard.</Text>
              </View>

              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#75777d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. johndoe@gmail.com"
                      placeholderTextColor="#75777d"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#75777d" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor="#75777d"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#75777d"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity 
                    style={styles.checkboxContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.signInButton, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.createAccountButton}
                    onPress={() => router.push('/auth/register')}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.createAccountButtonText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>By signing in, you agree to our</Text>
                <View style={styles.footerLinks}>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.footerLink}>Terms of Service</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerDivider}>|</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.footerLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  ambientGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(75, 65, 225, 0.08)',
    zIndex: -1,
  },
  glowTopLeft: {
    top: -200,
    left: -200,
  },
  glowBottomRight: {
    bottom: -200,
    right: -200,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 100,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#4b41e1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#091426',
    letterSpacing: -0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formHeader: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 4,
    lineHeight: 28,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#45474c',
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#45474c',
    letterSpacing: 0.3,
    marginLeft: 4,
    lineHeight: 20,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 52,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#191c1e',
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#c5c6cd',
    borderRadius: 12,
    lineHeight: 24,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#c5c6cd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#4b41e1',
    borderColor: '#4b41e1',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#45474c',
    lineHeight: 20,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#4b41e1',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    paddingTop: 16,
  },
  signInButton: {
    height: 56,
    backgroundColor: '#4b41e1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 28,
  },
  createAccountButton: {
    height: 56,
    backgroundColor: '#e2dfff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3323cc',
    lineHeight: 28,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#45474c',
    lineHeight: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
    color: '#75777d',
    letterSpacing: 0.3,
  },
  footerDivider: {
    fontSize: 12,
    color: '#c5c6cd',
  },
});
