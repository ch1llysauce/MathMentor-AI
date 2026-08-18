import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';
import AvatarPicker from '@/components/AvatarPicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithToken } = useAuth();
  const { darkMode, primaryColor } = useTheme();
  const insets = useSafeAreaInsets();

  const D = {
    bg: darkMode ? '#09090b' : '#f7f9fb',
    card: darkMode ? '#18181b' : '#ffffff',
    border: darkMode ? '#27272a' : '#e0e3e5',
    text: darkMode ? '#f4f4f5' : '#091426',
    textLight: darkMode ? '#a1a1aa' : '#45474c',
    placeholder: darkMode ? '#71717a' : '#75777d',
    inputBg: darkMode ? '#27272a' : '#f2f4f6',
    inputBorder: darkMode ? '#3f3f46' : '#c5c6cd',
  };

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!displayName.trim()) {
      setErrorMessage('Please enter a display name');
      return;
    }

    if (!isGoogleFlow) {
      if (!email || !password || !confirmPassword) {
        setErrorMessage('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters');
        return;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        setErrorMessage('Password needs at least one uppercase, one lowercase, and one number');
        return;
      }
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
          await loginWithToken(data.data.token, data.data.user);
          setLoading(false);
          router.replace('/(tabs)/dashboard');
        } else {
          setErrorMessage(data.message || 'Registration failed');
          setLoading(false);
        }
        return;
      }

      const response = await register({ displayName, email, password, profileImage: profileImage || undefined });
      if (response.success) {
        setLoading(false);
        router.replace('/(tabs)/dashboard');
      } else {
        setErrorMessage(response.message || 'Registration failed');
        setLoading(false);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: D.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={D.bg} />
      <View style={[styles.ambientGlow, styles.glowTopLeft, { backgroundColor: primaryColor, opacity: darkMode ? 0.25 : 0.12 }]} pointerEvents="none" />
      <View style={[styles.ambientGlow, styles.glowBottomRight, { backgroundColor: primaryColor, opacity: darkMode ? 0.25 : 0.12 }]} pointerEvents="none" />

      {/* Slim top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/MathMentorAILogoIcon.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: D.text }]}>MathMentor AI</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formCard, { backgroundColor: D.card, borderColor: D.border, shadowColor: primaryColor }]}>
          {/* Title */}
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: D.text }]}>
              {isGoogleFlow ? 'Almost there!' : 'Create your account'}
            </Text>
            {isGoogleFlow && (
              <Text style={[styles.cardSubtitle, { color: D.textLight }]}>Signing up as {params.googleEmail}</Text>
            )}
          </View>

          {errorMessage ? (
            <View style={[styles.errorBanner, { backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca' }]}>
              <Ionicons name="alert-circle-outline" size={18} color={darkMode ? '#fca5a5' : '#b91c1c'} />
              <Text style={[styles.errorBannerText, { color: darkMode ? '#fca5a5' : '#b91c1c' }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Avatar */}
          <View style={styles.avatarRow}>
            <AvatarPicker
              imageUri={profileImage}
              initials={displayName || '?'}
              onChange={setProfileImage}
              size={80}
              disabled={loading}
            />
          </View>

          {/* Display Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: D.textLight }]}>DISPLAY NAME</Text>
            <TextInput
              style={[styles.input, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
              placeholder="Alex Rivera"
              placeholderTextColor={D.placeholder}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Email + password — normal flow only */}
          {!isGoogleFlow && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: D.textLight }]}>EMAIL</Text>
                <TextInput
                  style={[styles.input, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                  placeholder="alex@example.com"
                  placeholderTextColor={D.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: D.textLight }]}>PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                    placeholder="Min. 8 chars, 1 upper, 1 lower, 1 number"
                    placeholderTextColor={D.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={D.placeholder} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: D.textLight }]}>CONFIRM PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                    placeholder="Re-enter your password"
                    placeholderTextColor={D.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={D.placeholder} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: primaryColor, shadowColor: primaryColor }, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()} disabled={loading} activeOpacity={0.7}>
            <Text style={[styles.backToLoginText, { color: D.textLight }]}>
              Already have an account?{' '}
              <Text style={[styles.backToLoginBold, { color: primaryColor }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb', overflow: 'hidden' },
  ambientGlow: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: 200, backgroundColor: 'rgba(75, 65, 225, 0.08)', zIndex: -1,
  },
  glowTopLeft: { top: -200, left: -200 },
  glowBottomRight: { bottom: -200, right: -200 },
  topBar: { paddingVertical: 50, alignItems: 'center', paddingBottom: 20 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoText: { fontSize: 17, fontWeight: '600', color: '#091426', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: 16 },
  formCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 20,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
    borderWidth: 1, borderColor: '#e2e8f0', gap: 12, paddingBottom: 30, paddingTop: 30
  },
  cardHeader: { gap: 2 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#091426', letterSpacing: -0.4 },
  cardSubtitle: { fontSize: 13, color: '#45474c' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#b91c1c',
    flex: 1,
  },
  avatarRow: { alignItems: 'center', paddingVertical: 4 },
  inputGroup: { gap: 4 },
  label: {
    fontSize: 12, fontWeight: '600', color: '#45474c',
    letterSpacing: 0.5, marginLeft: 4,
  },
  input: {
    height: 46, paddingHorizontal: 14, fontSize: 15, color: '#191c1e',
    backgroundColor: '#f2f4f6', borderWidth: 1, borderColor: '#c5c6cd', borderRadius: 12,
  },
  passwordContainer: { position: 'relative' },
  eyeIcon: {
    position: 'absolute', right: 12, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', width: 40, height: 46,
  },
  submitButton: {
    flexDirection: 'row', height: 50, backgroundColor: '#4b41e1',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, marginTop: 4,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
  backToLogin: { alignItems: 'center', paddingVertical: 4 },
  backToLoginText: { fontSize: 14, color: '#45474c' },
  backToLoginBold: { color: '#4b41e1', fontWeight: '600' },
});
