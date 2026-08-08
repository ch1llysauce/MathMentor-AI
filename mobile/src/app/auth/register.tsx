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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';
import AvatarPicker from '@/components/AvatarPicker';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  // Google pre-fill params
  const params = useLocalSearchParams<{
    fromGoogle?: string;
    googleIdToken?: string;
    googleEmail?: string;
    googleName?: string;
    googlePhoto?: string;
  }>();
  const isGoogleFlow = params.fromGoogle === 'true';

  const [displayName, setDisplayName] = useState(params.googleName ?? '');
  const [email, setEmail] = useState(params.googleEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(params.googlePhoto ?? '');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName || (!isGoogleFlow && (!email || !password || !confirmPassword))) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isGoogleFlow) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        return;
      }

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        Alert.alert('Error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }
    }

    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    setLoading(true);
    try {
      if (isGoogleFlow) {
        const res = await api.post(AUTH_ENDPOINTS.GOOGLE_REGISTER, {
          idToken: params.googleIdToken,
          displayName: displayName.trim(),
          profileImage: profileImage || undefined,
        });
        const data = res.data;
        if (data.success && data.data) {
          await storage.setItem('token', data.data.token);
          await storage.setItem('user', JSON.stringify(data.data.user));
          setLoading(false);
          router.replace('/(tabs)/dashboard');
        } else {
          Alert.alert('Registration Failed', data.message || 'Registration failed');
          setLoading(false);
        }
        return;
      }

      const response = await register({ displayName, email, password, profileImage: profileImage || undefined });

      if (response.success) {
        setLoading(false);
        router.replace('/(tabs)/dashboard');
      } else {
        Alert.alert('Registration Failed', response.message || 'Registration failed');
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
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

          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              {isGoogleFlow ? 'Almost there!' : 'Create your account'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isGoogleFlow
                ? `Signing up as ${params.googleEmail}. Tap Get Started to finish.`
                : 'Your personalized math tutor is ready when you are.'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {/* Avatar */}
            <View style={styles.avatarRow}>
              <AvatarPicker
                imageUri={profileImage}
                initials={displayName || '?'}
                onChange={setProfileImage}
                disabled={loading}
              />
            </View>

            {/* Display name — shown for both flows; pre-filled from Google but editable */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DISPLAY NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Alex Rivera"
                placeholderTextColor="#75777d"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Email + password only for non-Google flow */}
            {!isGoogleFlow && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="alex@example.com"
                    placeholderTextColor="#75777d"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Min. 8 chars, 1 upper, 1 lower, 1 number"
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

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#75777d"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#75777d"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>
                Already have an account?{' '}
                <Text style={styles.backToLoginBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  ambientGlow: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: 200, backgroundColor: 'rgba(75, 65, 225, 0.08)', zIndex: -1,
  },
  glowTopLeft: { top: -200, left: -200 },
  glowBottomRight: { bottom: -200, right: -200 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 80 },
  header: { paddingTop: 75, paddingBottom: 16, alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 40, height: 40, backgroundColor: '#091426', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#091426', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  logoText: { fontSize: 20, fontWeight: '600', color: '#091426', letterSpacing: -0.3, lineHeight: 28 },
  heroSection: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
  heroTitle: {
    fontSize: 28, fontWeight: '700', color: '#091426',
    textAlign: 'center', marginBottom: 12, letterSpacing: -0.6, lineHeight: 34,
  },
  heroSubtitle: { fontSize: 16, color: '#45474c', textAlign: 'center', lineHeight: 24 },
  formCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 24,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
    borderWidth: 1, borderColor: '#e2e8f0', gap: 16,
  },
  section: { gap: 0 },
  avatarRow: { alignItems: 'center', paddingVertical: 8 },
  inputGroup: { marginBottom: 12 },
  label: {
    fontSize: 14, fontWeight: '500', color: '#45474c',
    letterSpacing: 0.3, marginBottom: 8, marginLeft: 4, lineHeight: 20,
  },
  input: {
    height: 48, paddingHorizontal: 16, fontSize: 16, color: '#191c1e',
    backgroundColor: '#f2f4f6', borderWidth: 1, borderColor: '#c5c6cd',
    borderRadius: 12, lineHeight: 24,
  },
  passwordContainer: { position: 'relative' },
  eyeIcon: {
    position: 'absolute', right: 12, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', width: 40, height: 48,
  },
  submitButton: {
    flexDirection: 'row', height: 52, backgroundColor: '#4b41e1',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 20, fontWeight: '600', color: '#ffffff', lineHeight: 28 },
  backToLogin: { alignItems: 'center', paddingVertical: 8 },
  backToLoginText: { fontSize: 15, color: '#45474c' },
  backToLoginBold: { color: '#4b41e1', fontWeight: '600' },
});
