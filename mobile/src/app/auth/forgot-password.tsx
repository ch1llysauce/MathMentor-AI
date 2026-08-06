import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { Alert.alert('Error', 'Please enter your email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) { Alert.alert('Error', 'Please enter a valid email address'); return; }

    setLoading(true);
    try {
      await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email: trimmed });
      // Always advance — server hides whether account exists
      setStep('otp');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to send reset code. Please try again.';
      Alert.alert('Error', msg);
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
      Alert.alert('Invalid Code', error.response?.data?.message || 'The code is incorrect or has expired.');
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = {
    email: { number: 1, title: 'Forgot Password', subtitle: "Enter the email address associated with your account and we'll send you a reset code." },
    otp: { number: 2, title: 'Check Your Email', subtitle: `We sent a 6-digit code to ${email}. Enter it below.` },
    password: { number: 3, title: 'New Password', subtitle: 'Create a new password for your account.' },
  };

  const current = stepConfig[step];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
      <View style={[styles.ambientGlow, styles.glowTopLeft]} />
      <View style={[styles.ambientGlow, styles.glowBottomRight]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step === 'email' ? router.back() : setStep(step === 'otp' ? 'email' : 'otp')}>
              <Ionicons name="arrow-back" size={24} color="#091426" />
            </TouchableOpacity>
          </View>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
              <View key={s} style={styles.stepRow}>
                <View style={[styles.stepDot, step === s && styles.stepDotActive, i < ['email', 'otp', 'password'].indexOf(step) && styles.stepDotDone]}>
                  {i < ['email', 'otp', 'password'].indexOf(step)
                    ? <Ionicons name="checkmark" size={12} color="#fff" />
                    : <Text style={[styles.stepNum, step === s && styles.stepNumActive]}>{i + 1}</Text>}
                </View>
                {i < 2 && <View style={[styles.stepLine, i < ['email', 'otp', 'password'].indexOf(step) && styles.stepLineDone]} />}
              </View>
            ))}
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={step === 'email' ? 'mail-outline' : step === 'otp' ? 'keypad-outline' : 'lock-closed-outline'}
                size={28}
                color="#4b41e1"
              />
            </View>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>

            {/* Step 1 — Email */}
            {step === 'email' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#75777d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
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
                <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSendOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Code</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* Step 2 — OTP */}
            {step === 'otp' && (
              <>
                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor="#75777d"
                  textAlign="center"
                  editable={!loading}
                />
                <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Code</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.resendBtn} onPress={handleSendOtp} disabled={loading}>
                  <Text style={styles.resendText}>Didn't receive it? Resend code</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3 — New Password */}
            {step === 'password' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#75777d" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48 }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor="#75777d"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#75777d" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm new password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#75777d" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48 }]}
                      placeholder="Repeat your password"
                      placeholderTextColor="#75777d"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                      <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#75777d" />
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
            <Text style={styles.backToLoginText}>Back to Login</Text>
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

  backToLogin: { marginTop: 24, alignItems: 'center' },
  backToLoginText: { fontSize: 14, color: '#75777d' },
});
