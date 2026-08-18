import { useState, useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Alert, TextInput, ActivityIndicator, Share, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';

type ModalType = null | 'setup-key' | 'setup-verify' | 'disable' | 'policy' | 'sessions' | 'revoke-others-confirm' | 'revoke-others-success';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();

  const PV = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    itemBorder: darkMode ? '#1e1e1e' : '#f2f4f6',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#75777d',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    chevron: darkMode ? '#666666' : '#75777d',
    input: darkMode ? '#2a2a2a' : '#f2f4f6',
    inputBorder: darkMode ? '#3a3a3a' : '#c5c6cd',
    panelBg: darkMode ? '#111111' : '#f0eeff',
    panelBorder: darkMode ? '#2e2e2e' : '#c5bfff',
  };

  const [twoFactorAuth, setTwoFactorAuth] = useState(user?.twoFactorEnabled ?? false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [setupSecret, setSetupSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sessions state
  interface LoginSession {
    id: string;
    deviceInfo: string;
    ipAddress: string;
    lastActiveAt: string;
    createdAt: string;
    isCurrent: boolean;
    city?: string;
    location?: string;
  }
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);

  useEffect(() => {
    setTwoFactorAuth(user?.twoFactorEnabled ?? false);
  }, [user]);

  // ── 2FA handlers ─────────────────────────────────────────────────────────

  const handleTwoFactorToggle = async (value: boolean) => {
    if (value) {
      setLoading(true);
      try {
        const data = await authService.setup2FA();
        setSetupSecret(data.secret);
        setVerifyCode('');
        setModalType('setup-key');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to set up 2FA');
      } finally {
        setLoading(false);
      }
    } else {
      setDisableCode('');
      setModalType('disable');
    }
  };

  const handleVerify2FA = async () => {
    if (verifyCode.trim().length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your authenticator app');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.verify2FA(verifyCode.trim());
      if (response.success) {
        setTwoFactorAuth(true);
        setModalType(null);
        setVerifyCode('');
        Alert.alert('2FA Enabled', 'Two-factor authentication is now active on your account');
      } else {
        Alert.alert('Invalid Code', response.message || 'Verification failed. Check the code and try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (disableCode.trim().length !== 6) {
      Alert.alert('Error', 'Please enter your current 6-digit code to confirm');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.disable2FA(disableCode.trim());
      if (response.success) {
        setTwoFactorAuth(false);
        setModalType(null);
        setDisableCode('');
        Alert.alert('2FA Disabled', 'Two-factor authentication has been turned off');
      } else {
        Alert.alert('Failed', response.message || 'Could not disable 2FA');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setVerifyCode('');
    setDisableCode('');
  };

  // ── Download My Data ──────────────────────────────────────────────────────

  const handleDownloadData = async () => {
    setDownloadLoading(true);
    try {
      const response = await api.get(AUTH_ENDPOINTS.DATA_EXPORT);
      const exportData = response.data.data;

      const formatted = [
        '=== MathMentor AI — My Data Export ===',
        `Exported: ${new Date(exportData.exportedAt).toLocaleString()}`,
        '',
        '--- PROFILE ---',
        `Name: ${exportData.profile.displayName}`,
        `Email: ${exportData.profile.email}`,
        `Grade Level: ${exportData.profile.gradeLevel ?? 'Not set'}`,
        `Focus Areas: ${exportData.profile.focusAreas?.join(', ') || 'None'}`,
        `Difficulty: ${exportData.profile.learningPreferences?.difficulty ?? 'Easy'}`,
        `Current Streak: ${exportData.profile.currentStreak} days`,
        `Longest Streak: ${exportData.profile.longestStreak} days`,
        `Total Study Time: ${Math.round((exportData.profile.totalStudyTime ?? 0) / 60)} minutes`,
        `Member Since: ${new Date(exportData.profile.memberSince).toLocaleDateString()}`,
        `Last Active: ${new Date(exportData.profile.lastActive).toLocaleDateString()}`,
        '',
        '--- PROGRESS BY TOPIC ---',
        ...exportData.progress.map((p: any) =>
          `${p.topic} › ${p.subtopic}: ${p.masteryLevel}% mastery, ${p.correctAnswers}/${p.questionsAnswered} correct (${p.accuracy}% accuracy)`
        ),
        '',
        '--- DIAGNOSTIC RESULTS ---',
        ...exportData.diagnosticResults.map((d: any, i: number) =>
          `[${i + 1}] ${new Date(d.completedAt).toLocaleDateString()} — Overall: ${d.overallScore}% | Algebra: ${d.algebraScore}% | Geometry: ${d.geometryScore}% | Trigonometry: ${d.trigonometryScore}%`
        ),
      ].join('\n');

      await Share.share({
        message: formatted,
        title: 'My MathMentor AI Data',
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to export data. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // ── Delete Account ────────────────────────────────────────────────────────

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete All My Data',
      'This will permanently delete your account, all learning progress, and diagnostic results. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            // Second confirmation with typed acknowledgement via Alert
            Alert.alert(
              'Are you absolutely sure?',
              'Your account will be deleted immediately and you will be logged out. There is no way to recover your data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: confirmDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(AUTH_ENDPOINTS.DELETE_ACCOUNT);
      await logout();
      // logout clears storage; router will redirect to login via AuthContext
      router.replace('/auth/login');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Session Management ────────────────────────────────────────────────────

  const openSessionsModal = async () => {
    setModalType('sessions');
    setSessionsLoading(true);
    try {
      const response = await api.get(AUTH_ENDPOINTS.SESSIONS);
      setSessions(response.data.data.sessions);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load active sessions');
      setModalType(null);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await api.delete(`${AUTH_ENDPOINTS.SESSIONS}/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOtherSessions = () => {
    setModalType('revoke-others-confirm');
  };

  const confirmRevokeOtherSessions = async () => {
    setRevokeAllLoading(true);
    try {
      await api.delete(AUTH_ENDPOINTS.REVOKE_OTHER_SESSIONS);
      setSessions(prev => prev.filter(s => s.isCurrent));
      setModalType('revoke-others-success');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to sign out other devices');
      setModalType(null);
    } finally {
      setRevokeAllLoading(false);
    }
  };

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const PolicySection = ({ title, children }: { title: string; children: string }) => (
    <View style={styles.policySectionContainer}>
      <Text style={[styles.policySectionTitle, { color: PV.text }]}>{title}</Text>
      <Text style={[styles.policySectionBody, { color: PV.textLight }]}>{children}</Text>
    </View>
  );

  const MenuItem = ({
    icon, title, description, onPress, iconBg, iconColor,
  }: {
    icon: string; title: string; description: string;
    onPress: () => void; iconBg: string; iconColor: string;
  }) => (
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: PV.itemBorder }]} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: PV.text }]}>{title}</Text>
          <Text style={[styles.menuDescription, { color: PV.textLight }]}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: PV.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PV.header, borderBottomColor: PV.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: PV.backBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PV.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: PV.text }]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: PV.text }]}>Security Settings</Text>
          <View style={[styles.card, { backgroundColor: PV.card }]}>
            <View style={[styles.toggleItem, { borderBottomColor: 'transparent' }]}>
              <View style={styles.toggleLeft}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(0, 164, 114, 0.1)' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#00a472" />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: PV.text }]}>Two-Factor Authentication</Text>
                  <Text style={[styles.toggleDescription, { color: PV.textLight }]}>
                    {twoFactorAuth ? 'Your account has extra protection' : 'Add an extra layer of security'}
                  </Text>
                </View>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="#00a472" />
              ) : (
                <Switch
                  value={twoFactorAuth}
                  onValueChange={handleTwoFactorToggle}
                  disabled={loading}
                  trackColor={{ false: darkMode ? '#3a3a3a' : '#e0e3e5', true: '#b8b3ff' }}
                  thumbColor={twoFactorAuth ? '#4b41e1' : darkMode ? '#666666' : '#f2f4f6'}
                  ios_backgroundColor={darkMode ? '#3a3a3a' : '#e0e3e5'}
                />
              )}
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: PV.text }]}>Data Management</Text>
          <View style={[styles.card, { backgroundColor: PV.card }]}>

            {/* Download My Data */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: PV.itemBorder }]}
              onPress={handleDownloadData}
              disabled={downloadLoading}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  {downloadLoading
                    ? <ActivityIndicator size="small" color="#4b41e1" />
                    : <Ionicons name="download-outline" size={20} color="#4b41e1" />}
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: PV.text }]}>Download My Data</Text>
                  <Text style={[styles.menuDescription, { color: PV.textLight }]}>
                    {downloadLoading ? 'Preparing your data...' : 'Get a copy of your learning data'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Data Usage Policy */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: PV.itemBorder }]}
              onPress={() => setModalType('policy')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Ionicons name="document-text-outline" size={20} color="#2196f3" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: PV.text }]}>Data Usage Policy</Text>
                  <Text style={[styles.menuDescription, { color: PV.textLight }]}>Overview of data collection, usage, AI privacy & user rights</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Delete My Data */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: 'transparent' }]}
              onPress={handleDeleteAccount}
              disabled={deleteLoading}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(186, 26, 26, 0.1)' }]}>
                  {deleteLoading
                    ? <ActivityIndicator size="small" color="#ba1a1a" />
                    : <Ionicons name="trash-outline" size={20} color="#ba1a1a" />}
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: '#ba1a1a' }]}>Delete My Data</Text>
                  <Text style={[styles.menuDescription, { color: PV.textLight }]}>
                    {deleteLoading ? 'Deleting your account...' : 'Permanently remove all your data'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* Session Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: PV.text }]}>Session Management</Text>
          <View style={[styles.card, { backgroundColor: PV.card }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: PV.itemBorder }]}
              onPress={openSessionsModal}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#4b41e1" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: PV.text }]}>Active Sessions</Text>
                  <Text style={[styles.menuDescription, { color: PV.textLight }]}>View and manage logged-in devices</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: 'transparent' }]}
              onPress={handleRevokeOtherSessions}
              disabled={revokeAllLoading}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                  {revokeAllLoading
                    ? <ActivityIndicator size="small" color="#ff9800" />
                    : <Ionicons name="log-out-outline" size={20} color="#ff9800" />}
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: PV.text }]}>Sign Out All Devices</Text>
                  <Text style={[styles.menuDescription, { color: PV.textLight }]}>Log out from all other devices</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security status card */}
        <View style={[styles.securityCard, { backgroundColor: PV.card }]}>
          <Ionicons name="shield-checkmark" size={48} color={twoFactorAuth ? '#00a472' : '#4b41e1'} style={{ marginBottom: 16 }} />
          <Text style={[styles.securityTitle, { color: PV.text }]}>
            {twoFactorAuth ? 'Strong Protection Active' : 'Your Account is Secure'}
          </Text>
          <Text style={[styles.securityDescription, { color: PV.textLight }]}>
            {twoFactorAuth
              ? '2FA is enabled. Your account is protected with an extra layer of verification.'
              : 'We use industry-standard encryption to protect your data and privacy.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── 2FA Setup Modal: show key ── */}
      <Modal
        visible={modalType === 'setup-key'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalIconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#4b41e1" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Set Up 2FA</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              Copy the key, open Google Authenticator, and add it manually.
            </Text>
            <View style={[styles.secretBox, { backgroundColor: PV.input, borderColor: PV.inputBorder }]}>
              <Text style={[styles.secretLabel, { color: PV.textLight }]}>Your setup key</Text>
              <Text style={[styles.secretText, { color: PV.text }]}>
                {setupSecret.match(/.{1,4}/g)?.join(' ') ?? setupSecret}
              </Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => Share.share({ message: setupSecret })}>
                <Ionicons name="share-outline" size={15} color="#4b41e1" />
                <Text style={styles.copyButtonText}>Share / Copy key</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.stepsBox, { backgroundColor: PV.panelBg, borderColor: PV.panelBorder }]}>
              <Text style={[styles.stepsTitle, { color: PV.text }]}>In Google Authenticator:</Text>
              <Text style={[styles.stepsText, { color: PV.textLight }]}>1. Tap <Text style={{ fontWeight: '700', color: PV.text }}>+</Text> → <Text style={{ fontWeight: '700', color: PV.text }}>Enter a setup key</Text></Text>
              <Text style={[styles.stepsText, { color: PV.textLight }]}>2. <Text style={{ fontWeight: '700', color: PV.text }}>Code name:</Text> MathMentor AI</Text>
              <Text style={[styles.stepsText, { color: PV.textLight }]}>3. <Text style={{ fontWeight: '700', color: PV.text }}>Your key:</Text> paste the key above</Text>
              <Text style={[styles.stepsText, { color: PV.textLight }]}>4. <Text style={{ fontWeight: '700', color: PV.text }}>Type of key:</Text> Time based → Tap Add</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setModalType('setup-verify')}>
              <Text style={styles.primaryButtonText}>I've added it — Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 2FA Setup Modal: verify code ── */}
      <Modal
        visible={modalType === 'setup-verify'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalIconContainer}>
              <Ionicons name="keypad-outline" size={32} color="#4b41e1" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Enter Verification Code</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              Enter the 6-digit code from Google Authenticator for MathMentor AI
            </Text>
            <TextInput
              style={[styles.codeInput, { backgroundColor: PV.input, borderColor: PV.inputBorder, color: PV.text }]}
              value={verifyCode}
              onChangeText={setVerifyCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={PV.textLight}
              textAlign="center"
            />
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleVerify2FA}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enable 2FA</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={() => setModalType('setup-key')}>
              <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Back</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 2FA Disable Modal ── */}
      <Modal
        visible={modalType === 'disable'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(186,26,26,0.1)' }]}>
              <Ionicons name="shield-outline" size={32} color="#ba1a1a" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Disable 2FA</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              Enter your current 6-digit authenticator code to confirm
            </Text>
            <TextInput
              style={[styles.codeInput, { backgroundColor: PV.input, borderColor: PV.inputBorder, color: PV.text }]}
              value={disableCode}
              onChangeText={setDisableCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={PV.textLight}
              textAlign="center"
            />
            <TouchableOpacity
              style={[styles.destructiveButton, loading && styles.buttonDisabled]}
              onPress={handleDisable2FA}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Disable 2FA</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalType === 'sessions'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, styles.policyModalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(75,65,225,0.1)' }]}>
              <Ionicons name="phone-portrait-outline" size={28} color="#4b41e1" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Active Sessions</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              Devices currently logged into your account
            </Text>

            {sessionsLoading ? (
              <ActivityIndicator size="large" color="#4b41e1" style={{ marginVertical: 24 }} />
            ) : sessions.length === 0 ? (
              <Text style={[styles.modalSubtitle, { color: PV.textLight, marginBottom: 16 }]}>
                No active sessions found
              </Text>
            ) : (
              <ScrollView style={styles.policyScroll} showsVerticalScrollIndicator={false}>
                {sessions.map((session) => (
                  <View
                    key={session.id}
                    style={[styles.sessionRow, {
                      backgroundColor: session.isCurrent
                        ? 'rgba(75,65,225,0.07)'
                        : (darkMode ? '#1e1e1e' : '#f7f9fb'),
                      borderColor: session.isCurrent ? '#4b41e1' : PV.inputBorder,
                    }]}
                  >
                    <View style={styles.sessionIcon}>
                      <Ionicons
                        name={
                          /mobile|android|iphone|ipad|ios|okhttp/i.test(session.deviceInfo)
                            ? 'phone-portrait-outline'
                            : 'desktop-outline'
                        }
                        size={22}
                        color={session.isCurrent ? '#4b41e1' : PV.textLight}
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionTitleRow}>
                        <Text style={[styles.sessionDevice, { color: PV.text }]}>
                          {session.deviceInfo}
                        </Text>
                        {session.isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>This device</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.sessionMetaRow}>
                        <Ionicons name="location-outline" size={13} color={PV.textLight} />
                        <Text style={[styles.sessionMeta, { color: PV.textLight }]}>
                          {session.city || session.location || 'Unknown Location'}
                        </Text>
                      </View>
                      <View style={styles.sessionMetaRow}>
                        <Ionicons name="time-outline" size={13} color={PV.textLight} />
                        <Text style={[styles.sessionMeta, { color: PV.textLight }]}>
                          Last active {formatSessionDate(session.lastActiveAt)}
                        </Text>
                      </View>
                    </View>
                    {!session.isCurrent && (
                      <TouchableOpacity
                        style={styles.revokeBtn}
                        onPress={() => handleRevokeSession(session.id)}
                        disabled={revokingId === session.id}
                      >
                        {revokingId === session.id
                          ? <ActivityIndicator size="small" color="#ba1a1a" />
                          : <Ionicons name="close-circle-outline" size={22} color="#ba1a1a" />}
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <View style={{ height: 8 }} />
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 16, width: '100%' }]}
              onPress={closeModal}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalType === 'policy'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, styles.policyModalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(33,150,243,0.1)' }]}>
              <Ionicons name="document-text" size={28} color="#2196f3" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Data Usage Policy</Text>
            <ScrollView
              style={styles.policyScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <PolicySection title="1. What data we collect">
                {`• Account info: Display name, email address, password hash, grade level & focus areas\n• Learning data: Quiz/practice answers, topic mastery %, diagnostic results & learning path progress\n• Usage data: Session timestamps, study time & streak data, device/browser information, and IP address (used strictly for session security auditing)`}
              </PolicySection>
              <PolicySection title="2. How we use your data">
                {`• To personalise problem difficulty, diagnostic tests & adaptive study recommendations\n• To calculate topic mastery levels and track study streaks over time\n• To power the AI Tutor (math questions are processed via Groq/Gemini — no personal identifiers like name, email, or IP are sent to AI providers)\n• Zero Data Sale Guarantee: We do NOT sell, rent, or trade your data to third parties`}
              </PolicySection>
              <PolicySection title="3. Data storage & security">
                {`• Stored securely on cloud database infrastructure (MongoDB Atlas) hosted on Render\n• Passwords hashed using bcrypt (one-way encryption) & all API traffic encrypted via HTTPS/TLS\n• 2FA secrets encrypted at rest & session tokens managed with strict expiry limits`}
              </PolicySection>
              <PolicySection title="4. Your rights & control">
                {`• Data Export: Download a full JSON copy of your progress and diagnostic history anytime using "Download My Data"\n• Data Deletion: Permanently delete your account and all associated study data using "Delete My Data"\n• Correction: Update your profile information and preferences in Edit Profile`}
              </PolicySection>
              <Text style={[styles.policyFooter, { color: PV.textLight }]}>
                Effective: August 2026 · MathMentor AI
              </Text>
            </ScrollView>
            <View style={{ width: '100%', marginTop: 14 }}>
              <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
                <Text style={styles.primaryButtonText}>Got it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: 8, marginTop: 4 }}
                onPress={() => {
                  closeModal();
                  router.push('/legal/privacy-policy');
                }}
              >
                <Text style={{ fontSize: 13, color: '#4b41e1', fontWeight: '600' }}>
                  View Full Policy Document
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Revoke Other Sessions Confirmation Modal ── */}
      <Modal
        visible={modalType === 'revoke-others-confirm'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(255,152,0,0.12)' }]}>
              <Ionicons name="log-out-outline" size={30} color="#ff9800" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Sign Out All Other Devices?</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              This will log out all other active sessions across all devices. You will remain logged in on this device.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#ff9800' }, revokeAllLoading && styles.buttonDisabled]}
              onPress={confirmRevokeOtherSessions}
              disabled={revokeAllLoading}
            >
              {revokeAllLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Out Devices</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Revoke Other Sessions Success Modal ── */}
      <Modal
        visible={modalType === 'revoke-others-success'}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalBox, { backgroundColor: PV.card }]}>
            <View style={styles.modalHandle} />
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(0,164,114,0.12)' }]}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#00a472" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Signed Out All Other Devices</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              All other active sessions have been successfully logged out. You remain signed in on this device.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
              <Text style={styles.primaryButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: {
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  toggleItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  toggleIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  toggleTextContainer: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  toggleDescription: { fontSize: 12 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0e3e5', marginBottom: 20,
  },
  modalIconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(75,65,225,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 20 },

  secretBox: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, alignItems: 'center' },
  secretLabel: { fontSize: 11, marginBottom: 8 },
  secretText: { fontSize: 16, fontWeight: '700', letterSpacing: 3, textAlign: 'center', marginBottom: 12 },
  copyButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(75, 65, 225, 0.1)', borderRadius: 20,
  },
  copyButtonText: { fontSize: 13, fontWeight: '600', color: '#4b41e1' },

  stepsBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  stepsTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  stepsText: { fontSize: 13, lineHeight: 22 },

  codeInput: {
    width: '100%', height: 64, borderRadius: 16, borderWidth: 1,
    fontSize: 28, fontWeight: '700', letterSpacing: 10, marginBottom: 16,
  },
  primaryButton: {
    width: '100%', height: 52, backgroundColor: '#4b41e1',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  destructiveButton: {
    width: '100%', height: 52, backgroundColor: '#ba1a1a',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  ghostButton: { alignItems: 'center', paddingVertical: 10 },
  ghostButtonText: { fontSize: 15 },
  buttonDisabled: { opacity: 0.6 },

  menuList: {
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  menuDescription: { fontSize: 12 },

  securityCard: {
    padding: 24, borderRadius: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  securityTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  securityDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Policy content (used in modal)
  policySectionContainer: { marginBottom: 16, width: '100%' },
  policySectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  policySectionBody: { fontSize: 13, lineHeight: 22 },
  policyFooter: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  policyModalBox: { maxHeight: '72%' },
  policyScroll: { width: '100%', flexShrink: 1 },

  // Session rows
  sessionRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    padding: 12, marginBottom: 10,
  },
  sessionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(75,65,225,0.08)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  sessionInfo: { flex: 1 },
  sessionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sessionDevice: { fontSize: 14, fontWeight: '600' },
  sessionMeta: { fontSize: 11 },
  sessionMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  currentBadge: {
    backgroundColor: '#4b41e1', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  revokeBtn: { padding: 6 },
});
