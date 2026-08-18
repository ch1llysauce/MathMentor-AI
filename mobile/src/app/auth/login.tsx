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
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import CustomAlertModal from '@/components/common/CustomAlertModal';

const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.72 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.61 0 6.51 5.38 2.56 13.22l7.98 6.2C12.45 13.16 17.7 9.5 24 9.5Z"
    />

    <Path
      fill="#4285F4"
      d="M46.98 24.55c0-1.64-.15-3.22-.43-4.75H24v9h12.94c-.56 3-2.24 5.54-4.77 7.25l7.73 6c4.51-4.16 7.08-10.28 7.08-17.5Z"
    />

    <Path
      fill="#34A853"
      d="M24 48c6.48 0 11.91-2.15 15.9-5.95l-7.73-6c-2.15 1.44-4.89 2.3-8.17 2.3-6.28 0-11.61-4.24-13.52-9.94l-8.04 6.19C6.48 42.52 14.55 48 24 48Z"
    />

    <Path
      fill="#FBBC05"
      d="M10.48 28.41A14.4 14.4 0 0 1 9.5 24c0-1.53.35-3.01.98-4.41v-6.37H2.56A23.96 23.96 0 0 0 0 24c0 3.87.92 7.54 2.56 10.78l7.92-6.37Z"
    />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const { login, validate2FA, loginWithGoogle } = useAuth();
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
    divider: darkMode ? '#27272a' : '#e0e3e5',
    btnSecondary: darkMode ? '#312e81' : '#e2dfff',
    btnSecondaryText: darkMode ? '#a5b4fc' : '#3323cc',
    modalBg: darkMode ? '#18181b' : '#ffffff',
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await login(trimmedEmail, trimmedPassword);
      if (response.requiresTwoFactor) {
        setTwoFAUserId(response.data?.userId ?? '');
        setTwoFAModalVisible(true);
        setLoading(false);
        return;
      }
      if (response.success) {
        setTimeout(() => router.replace('/(tabs)/dashboard'), 200);
      } else {
        setErrorMessage(response.message || 'Invalid credentials');
        setLoading(false);
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 429) {
        setErrorMessage(error.message || 'Too many login attempts. Please try again in 15 minutes.');
      } else {
        setErrorMessage(error.message || 'Incorrect email or password.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const response = await loginWithGoogle();
      if (response.requiresRegistration) {
        const profile = (response.data as any)?.googleProfile;
        router.push({
          pathname: '/auth/register',
          params: {
            fromGoogle: 'true',
            googleIdToken: profile?.idToken ?? '',
            googleEmail: profile?.email ?? '',
            googleName: profile?.displayName ?? '',
            googlePhoto: profile?.profileImage ?? '',
          },
        });
        return;
      }
      if (response.success) {
        setTimeout(() => router.replace('/(tabs)/dashboard'), 200);
      }
    } catch (error: any) {
      if (
        error.message?.includes('TurboModuleRegistry') ||
        error.message?.includes('RNGoogleSignin') ||
        error.message?.includes('not a native build') ||
        error.message?.includes('native binary')
      ) {
        setErrorMessage('Google Sign-In requires a native build. Please run "npx expo run:android".');
        setLoading(false);
        return;
      }
      if (error.code === 'SIGN_IN_CANCELLED' || error.code === 'SIGN_IN_REQUIRED') {
        setLoading(false);
        return;
      }
      setErrorMessage(error.message || error.code || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async () => {
    if (twoFACode.trim().length !== 6) {
      showAlert('Error', 'Please enter a 6-digit verification code', 'warning');
      return;
    }
    setTwoFALoading(true);
    try {
      const response = await validate2FA(twoFAUserId, twoFACode.trim());
      if (response.success) {
        setTwoFAModalVisible(false);
        setTwoFACode('');
        setTimeout(() => router.replace('/(tabs)/dashboard'), 200);
      } else {
        showAlert('Invalid Code', response.message || 'Verification failed');
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 429) {
        showAlert('Too Many Attempts', error.message || 'Too many verification attempts. Please try again later.');
      } else {
        showAlert('Invalid Code', error.message || 'Invalid verification code');
      }
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: D.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={D.bg} />
      <View style={[styles.ambientGlow, styles.glowTopLeft, { backgroundColor: primaryColor, opacity: darkMode ? 0.25 : 0.12 }]} pointerEvents="none" />
      <View style={[styles.ambientGlow, styles.glowBottomRight, { backgroundColor: primaryColor, opacity: darkMode ? 0.25 : 0.12 }]} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/MathMentorAILogoIcon.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: D.text }]}>MathMentor AI</Text>
        </View>
      </View>

      {/* Form Card — fills remaining space, centered vertically */}
      <View style={styles.body}>
        <View style={[styles.formCard, { backgroundColor: D.card, borderColor: D.border, shadowColor: primaryColor }]}>
          <View style={styles.formHeader}>
            <Text style={[styles.welcomeTitle, { color: D.text }]}>Welcome back</Text>
            <Text style={[styles.welcomeSubtitle, { color: D.textLight }]}>Access your personalized tutor dashboard.</Text>
          </View>

          {errorMessage ? (
            <View style={[styles.errorBanner, { backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca' }]}>
              <Ionicons name="alert-circle-outline" size={18} color={darkMode ? '#fca5a5' : '#b91c1c'} />
              <Text style={[styles.errorBannerText, { color: darkMode ? '#fca5a5' : '#b91c1c' }]}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: D.textLight }]}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={D.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                  placeholder="e.g. johndoe@gmail.com"
                  placeholderTextColor={D.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: D.textLight }]}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={D.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                  placeholder="••••••••"
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

            {/* Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/auth/forgot-password')}>
                <Text style={[styles.forgotPassword, { color: primaryColor }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: primaryColor, shadowColor: primaryColor }, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: D.divider }]} />
                <Text style={[styles.dividerText, { color: D.placeholder }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: D.divider }]} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, loading && styles.buttonDisabled, { backgroundColor: D.card, borderColor: D.border }]}
                onPress={handleGoogleSignIn}
                disabled={loading}
                activeOpacity={0.9}
              >
                <GoogleLogo size={20} />
                <Text style={[styles.googleButtonText, { color: D.text }]}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => router.push('/auth/register')}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={[styles.createAccountButtonText, { color: primaryColor }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: D.textLight }]}>By signing in, you agree to our</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/legal/terms')}>
                <Text style={[styles.footerLink, { color: D.placeholder }]}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={[styles.footerDivider, { color: D.border }]}>|</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/legal/privacy-policy')}>
                <Text style={[styles.footerLink, { color: D.placeholder }]}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 2FA Modal */}
      <Modal
        visible={twoFAModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => { setTwoFAModalVisible(false); setTwoFACode(''); setLoading(false); }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => { setTwoFAModalVisible(false); setTwoFACode(''); setLoading(false); }}
          />
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) + 8, backgroundColor: D.modalBg }]}>
            <View style={[styles.modalHandle]} />
            <View style={[styles.modalIconContainer, { backgroundColor: `${primaryColor}20` }]}>
              <Ionicons name="shield-checkmark" size={40} color={primaryColor} />
            </View>
            <Text style={[styles.modalTitle, { color: D.text }]}>Two-Factor Authentication</Text>
            <Text style={[styles.modalSubtitle, { color: D.textLight }]}>Enter the 6-digit code from your authenticator app</Text>
            <TextInput
              style={[styles.codeInput, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
              value={twoFACode}
              onChangeText={setTwoFACode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={D.placeholder}
              textAlign="center"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: primaryColor, shadowColor: primaryColor }, twoFALoading && styles.buttonDisabled]}
              onPress={handle2FASubmit}
              disabled={twoFALoading}
              activeOpacity={0.9}
            >
              {twoFALoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { setTwoFAModalVisible(false); setTwoFACode(''); setLoading(false); }}>
              <Text style={[styles.cancelButtonText, { color: D.placeholder }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
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
  header: { paddingVertical: 20, alignItems: 'center', paddingTop: 60 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  logoText: { fontSize: 28, fontWeight: '600', color: '#091426', letterSpacing: -0.5 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  formCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 28,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  formHeader: { marginBottom: 20 },
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: '#091426', marginBottom: 4, lineHeight: 28 },
  welcomeSubtitle: { fontSize: 14, color: '#45474c', lineHeight: 20 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b91c1c',
    flex: 1,
  },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: '#45474c', letterSpacing: 0.3, marginLeft: 4, lineHeight: 20 },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: {
    flex: 1, height: 52, paddingLeft: 48, paddingRight: 16,
    fontSize: 16, color: '#191c1e', backgroundColor: '#f2f4f6',
    borderWidth: 1, borderColor: '#c5c6cd', borderRadius: 12, lineHeight: 24,
  },
  passwordInput: { paddingRight: 48 },
  eyeIcon: { position: 'absolute', right: 16, width: 40, height: 52, justifyContent: 'center', alignItems: 'center' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
    borderColor: '#c5c6cd', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff',
  },
  checkboxChecked: { backgroundColor: '#4b41e1', borderColor: '#4b41e1' },
  checkboxLabel: { fontSize: 14, color: '#45474c', lineHeight: 20 },
  forgotPassword: { fontSize: 14, color: '#4b41e1', lineHeight: 20 },
  buttonContainer: { gap: 10 },
  signInButton: {
    height: 52, backgroundColor: '#4b41e1', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e3e5' },
  dividerText: { fontSize: 13, color: '#75777d' },
  googleButton: {
    height: 52, backgroundColor: '#ffffff', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#e0e3e5',
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#091426' },
  signInButtonText: { fontSize: 18, fontWeight: '600', color: '#ffffff', lineHeight: 28 },
  createAccountButton: {
    height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  createAccountButtonText: { fontSize: 18, fontWeight: '600', lineHeight: 28 },
  footer: { marginTop: 24, alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, color: '#45474c', lineHeight: 20 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  footerLink: { fontSize: 12, color: '#75777d', letterSpacing: 0.3 },
  footerDivider: { fontSize: 12, color: '#c5c6cd' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 32, paddingTop: 12, alignItems: 'center',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#c5c6cd', marginBottom: 20,
  },
  modalIconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(75, 65, 225, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#091426', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#45474c', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  codeInput: {
    width: '100%', height: 64, backgroundColor: '#f2f4f6',
    borderRadius: 16, borderWidth: 1, borderColor: '#c5c6cd',
    fontSize: 32, fontWeight: '700', color: '#091426',
    letterSpacing: 12, marginBottom: 24,
  },
  verifyButton: {
    width: '100%', height: 56, backgroundColor: '#4b41e1',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  verifyButtonText: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  cancelButton: { paddingVertical: 12 },
  cancelButtonText: { fontSize: 16, color: '#75777d' },
});
