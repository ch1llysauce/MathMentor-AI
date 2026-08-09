import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();

  const D = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    placeholder: darkMode ? '#6b7280' : '#75777d',
    inputBg: darkMode ? '#242424' : '#f2f4f6',
    inputBorder: darkMode ? '#2e2e2e' : '#c5c6cd',
    glow: darkMode ? 'rgba(75, 65, 225, 0.15)' : 'rgba(75, 65, 225, 0.08)',
    stepDot: darkMode ? '#2e2e2e' : '#e2e8f0',
    stepLine: darkMode ? '#2e2e2e' : '#e2e8f0',
  };

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP countdown — sourced from the backend response
  const [otpExpirySeconds, setOtpExpirySeconds] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerKey, setTimerKey] = useState(0);

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { Alert.alert('Error', 'Please enter your email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { Alert.alert('Error', 'Please enter a valid email address'); return; }

    setLoading(true);
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email: trimmed });
      const expiresIn = response.data?.data?.expiresIn ?? 600;
      const cooldown = response.data?.data?.resendCooldown ?? 60;
      setOtpExpirySeconds(expiresIn);
      setResendCooldown(cooldown);
      setOtp('');
      setStep('otp');
      setTimerKey((k) => k + 1);
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || 'Failed to send reset code. Please try again.';
      Alert.alert(status === 429 ? 'Too Many Requests' : 'Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) { Alert.alert('Error', 'Please enter the 6-digit code'); return; }

    setLoading(true);
    try {
      const response = await api.post(AUTH_ENDPOINTS.VERIFY_RESET_OTP, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setResetToken(response.data.data.resetToken);
      setStep('password');
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.message || 'The code is incorrect or has expired.';
      Alert.alert(status === 429 ? 'Too Many Attempts' : 'Invalid Code', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ───────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (newPassword.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }

    setLoading(true);
    try {
      await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, { resetToken, newPassword });
      Alert.alert(
        'Password Reset',
        'Your password has been reset successfully. Please log in with your new password.',
        [{ text: 'Log In', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.message || 'Failed to reset password. Please try again.';
      Alert.alert(status === 429 ? 'Too Many Attempts' : 'Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Countdown timer (single interval for both OTP expiry + resend cooldown) ──
  useEffect(() => {
    if (step !== 'otp' || (otpExpirySeconds === null && resendCooldown === 0)) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setOtpExpirySeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step, timerKey]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stepConfig = {
    email: { number: 1, title: 'Forgot Password', subtitle: "Enter the email address associated with your account and we'll send you a reset code." },
    otp: { number: 2, title: 'Check Your Email', subtitle: `We sent a 6-digit code to ${email}. Enter it below.` },
    password: { number: 3, title: 'New Password', subtitle: 'Create a new password for your account.' },
  };

  const current = stepConfig[step];

  return (
    <View style={[styles.container, { backgroundColor: D.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={D.bg} />
      <View style={[styles.ambientGlow, styles.glowTopLeft, { backgroundColor: D.glow }]} />
      <View style={[styles.ambientGlow, styles.glowBottomRight, { backgroundColor: D.glow }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: D.inputBg }]} onPress={() => step === 'email' ? router.back() : setStep(step === 'otp' ? 'email' : 'otp')}>
              <Ionicons name="arrow-back" size={24} color={D.text} />
            </TouchableOpacity>
          </View>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
              <View key={s} style={styles.stepRow}>
                <View style={[styles.stepDot, step === s && styles.stepDotActive, i < ['email', 'otp', 'password'].indexOf(step) && styles.stepDotDone, { backgroundColor: step === s ? '#4b41e1' : i < ['email', 'otp', 'password'].indexOf(step) ? '#00a472' : D.stepDot }]}>
                  {i < ['email', 'otp', 'password'].indexOf(step)
                    ? <Ionicons name="checkmark" size={12} color="#fff" />
                    : <Text style={[styles.stepNum, step === s && styles.stepNumActive, { color: step === s ? '#fff' : D.textLight }]}>{i + 1}</Text>}
                </View>
                {i < 2 && <View style={[styles.stepLine, i < ['email', 'otp', 'password'].indexOf(step) && styles.stepLineDone, { backgroundColor: i < ['email', 'otp', 'password'].indexOf(step) ? '#00a472' : D.stepLine }]} />}
              </View>
            ))}
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: D.card, borderColor: D.border, shadowColor: darkMode ? '#000' : '#4b41e1' }]}>
            <View style={[styles.iconContainer, { backgroundColor: darkMode ? 'rgba(75,65,225,0.15)' : 'rgba(75,65,225,0.1)' }]}>
              <Ionicons
                name={step === 'email' ? 'mail-outline' : step === 'otp' ? 'keypad-outline' : 'lock-closed-outline'}
                size={28}
                color="#4b41e1"
              />
            </View>
            <Text style={[styles.title, { color: D.text }]}>{current.title}</Text>
            <Text style={[styles.subtitle, { color: D.textLight }]}>{current.subtitle}</Text>

            {/* Step 1 — Email */}
            {step === 'email' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: D.textLight }]}>Email address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color={D.placeholder} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                      placeholder="your@email.com"
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
                <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSendOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Code</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* Step 2 — OTP */}
            {step === 'otp' && (
              <>
                <TextInput
                  style={[styles.otpInput, { color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor={D.placeholder}
                  textAlign="center"
                  editable={!loading}
                />
                <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Code</Text>}
                </TouchableOpacity>

                {/* OTP expiry countdown + resend */}
                <View style={styles.otpFooter}>
                  {otpExpirySeconds !== null && otpExpirySeconds > 0 ? (
                    <Text style={styles.countdownText}>
                      Code expires in{' '}
                      <Text style={styles.countdownValue}>{formatTime(otpExpirySeconds)}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.countdownTextExpired}>The code has expired. Request a new one below.</Text>
                  )}
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleSendOtp}
                    disabled={loading || resendCooldown > 0}
                  >
                    <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
                      {resendCooldown > 0
                        ? `Resend code (${Math.floor(resendCooldown)}s)`
                        : "Didn't receive it? Resend code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Step 3 — New Password */}
            {step === 'password' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: D.textLight }]}>New password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={D.placeholder} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48, color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor={D.placeholder}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={D.placeholder} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: D.textLight }]}>Confirm new password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={D.placeholder} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48, color: D.text, backgroundColor: D.inputBg, borderColor: D.inputBorder }]}
                      placeholder="Repeat your password"
                      placeholderTextColor={D.placeholder}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                      <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={D.placeholder} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.backToLogin}>
            <Text style={[styles.backToLoginText, { color: D.placeholder }]}>Back to Login</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  ambientGlow: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(75,65,225,0.08)', zIndex: -1 },
  glowTopLeft: { top: -200, left: -200 },
  glowBottomRight: { bottom: -200, right: -200 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: { paddingTop: 52, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },

  // Step indicator
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#4b41e1' },
  stepDotDone: { backgroundColor: '#00a472' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#75777d' },
  stepNumActive: { color: '#ffffff' },
  stepLine: { width: 40, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#00a472' },

  // Card
  card: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 28,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
    borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center',
  },
  iconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(75,65,225,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#091426', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#45474c', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  inputGroup: { width: '100%', gap: 6, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#45474c', marginLeft: 4 },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: {
    flex: 1, height: 52, paddingLeft: 48, paddingRight: 16,
    fontSize: 16, color: '#191c1e', backgroundColor: '#f2f4f6',
    borderWidth: 1, borderColor: '#c5c6cd', borderRadius: 12,
  },
  eyeIcon: { position: 'absolute', right: 16, height: 52, justifyContent: 'center' },

  otpInput: {
    width: '100%', height: 72, backgroundColor: '#f2f4f6',
    borderWidth: 1, borderColor: '#c5c6cd', borderRadius: 16,
    fontSize: 36, fontWeight: '700', letterSpacing: 14,
    color: '#091426', marginBottom: 20,
  },

  btn: {
    width: '100%', height: 56, backgroundColor: '#4b41e1',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#4b41e1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 18, fontWeight: '600', color: '#ffffff' },

  resendBtn: { marginTop: 16, paddingVertical: 8 },
  resendText: { fontSize: 14, color: '#4b41e1', textAlign: 'center' },
  resendTextDisabled: { color: '#94a3b8' },

  otpFooter: { alignItems: 'center', marginTop: 16, gap: 12 },
  countdownText: { fontSize: 13, color: '#45474c' },
  countdownValue: { color: '#091426', fontWeight: '700' },
  countdownTextExpired: { fontSize: 13, color: '#ef4444', textAlign: 'center' },

  backToLogin: { marginTop: 24, alignItems: 'center' },
  backToLoginText: { fontSize: 14, color: '#75777d' },
});
