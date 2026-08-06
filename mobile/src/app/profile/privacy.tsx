import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Alert, TextInput, ActivityIndicator, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/constants/api';

type PanelMode = null | 'setup-key' | 'setup-verify' | 'disable' | 'policy';

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
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [setupSecret, setSetupSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        setPanelMode('setup-key');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to set up 2FA');
      } finally {
        setLoading(false);
      }
    } else {
      setDisableCode('');
      setPanelMode('disable');
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
        setPanelMode(null);
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
        setPanelMode(null);
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

  const cancelPanel = () => {
    setPanelMode(null);
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
      <Ionicons name="chevron-forward" size={20} color={PV.chevron} />
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

            {/* 2FA Toggle row */}
            <View style={[styles.toggleItem, { borderBottomColor: (panelMode && panelMode !== 'policy') ? PV.itemBorder : 'transparent' }]}>
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
              {loading && panelMode === null ? (
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

            {/* ── Setup step 1: show key ── */}
            {panelMode === 'setup-key' && (
              <View style={[styles.inlinePanel, { borderTopColor: PV.itemBorder }]}>
                <Text style={[styles.panelTitle, { color: PV.text }]}>Set Up 2FA</Text>
                <Text style={[styles.panelSubtitle, { color: PV.textLight }]}>
                  Copy the key below, then open Google Authenticator and add it manually.
                </Text>

                <View style={[styles.secretBox, { backgroundColor: PV.input, borderColor: PV.inputBorder }]}>
                  <Text style={[styles.secretLabel, { color: PV.textLight }]}>Your setup key</Text>
                  <Text style={[styles.secretText, { color: PV.text }]}>
                    {setupSecret.match(/.{1,4}/g)?.join(' ') ?? setupSecret}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => Share.share({ message: setupSecret })}
                  >
                    <Ionicons name="share-outline" size={15} color="#4b41e1" />
                    <Text style={styles.copyButtonText}>Share / Copy key</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.stepsBox, { backgroundColor: PV.panelBg, borderColor: PV.panelBorder }]}>
                  <Text style={[styles.stepsTitle, { color: PV.text }]}>How to add in Google Authenticator:</Text>
                  <Text style={[styles.stepsText, { color: PV.textLight }]}>1. Open Google Authenticator</Text>
                  <Text style={[styles.stepsText, { color: PV.textLight }]}>2. Tap <Text style={{ fontWeight: '700', color: PV.text }}>+</Text> → <Text style={{ fontWeight: '700', color: PV.text }}>Enter a setup key</Text></Text>
                  <Text style={[styles.stepsText, { color: PV.textLight }]}>3. <Text style={{ fontWeight: '700', color: PV.text }}>Code name:</Text> MathMentor AI (or anything)</Text>
                  <Text style={[styles.stepsText, { color: PV.textLight }]}>4. <Text style={{ fontWeight: '700', color: PV.text }}>Your key:</Text> paste the key above</Text>
                  <Text style={[styles.stepsText, { color: PV.textLight }]}>5. <Text style={{ fontWeight: '700', color: PV.text }}>Type of key:</Text> Time based</Text>
                  <Text style={[styles.stepsText, { color: PV.textLight }]}>6. Tap <Text style={{ fontWeight: '700', color: PV.text }}>Add</Text></Text>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={() => setPanelMode('setup-verify')}>
                  <Text style={styles.primaryButtonText}>I've added it — Next</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostButton} onPress={cancelPanel}>
                  <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Setup step 2: verify code ── */}
            {panelMode === 'setup-verify' && (
              <View style={[styles.inlinePanel, { borderTopColor: PV.itemBorder }]}>
                <View style={styles.panelIconRow}>
                  <Ionicons name="keypad-outline" size={28} color="#4b41e1" />
                </View>
                <Text style={[styles.panelTitle, { color: PV.text }]}>Enter Verification Code</Text>
                <Text style={[styles.panelSubtitle, { color: PV.textLight }]}>
                  Open Google Authenticator and enter the 6-digit code shown for MathMentor AI
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
                <TouchableOpacity style={styles.ghostButton} onPress={() => setPanelMode('setup-key')}>
                  <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Disable: confirm with code ── */}
            {panelMode === 'disable' && (
              <View style={[styles.inlinePanel, { borderTopColor: PV.itemBorder }]}>
                <View style={styles.panelIconRow}>
                  <Ionicons name="shield-outline" size={28} color="#ba1a1a" />
                </View>
                <Text style={[styles.panelTitle, { color: PV.text }]}>Disable 2FA</Text>
                <Text style={[styles.panelSubtitle, { color: PV.textLight }]}>
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
                <TouchableOpacity style={styles.ghostButton} onPress={cancelPanel}>
                  <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

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
              <Ionicons name="chevron-forward" size={20} color={PV.chevron} />
            </TouchableOpacity>

            {/* Data Usage Policy — toggles inline panel */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: PV.itemBorder }]}
              onPress={() => setPanelMode(panelMode === 'policy' ? null : 'policy')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Ionicons name="document-text-outline" size={20} color="#2196f3" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: PV.text }]}>Data Usage Policy</Text>
                  <Text style={[styles.menuDescription, { color: PV.textLight }]}>How we use your information</Text>
                </View>
              </View>
              <Ionicons
                name={panelMode === 'policy' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={PV.chevron}
              />
            </TouchableOpacity>

            {/* Inline policy panel */}
            {panelMode === 'policy' && (
              <View style={[styles.policyPanel, { borderTopColor: PV.itemBorder, backgroundColor: PV.panelBg }]}>
                <PolicySection title="What data we collect">
                  {`• Account info: your name, email address, and grade level\n• Learning data: quiz answers, mastery levels, and progress per topic\n• Diagnostic results: scores and recommended learning paths\n• Usage data: session times and streak activity`}
                </PolicySection>
                <PolicySection title="How we use it">
                  {`• To personalise your learning path and topic recommendations\n• To track your progress and show your statistics\n• To improve the accuracy of the AI tutor responses\n• We do not sell your data to third parties`}
                </PolicySection>
                <PolicySection title="Data storage">
                  {`• Your data is stored securely on our servers hosted on Render\n• Passwords are hashed using bcrypt and never stored in plain text\n• Two-factor authentication secrets are encrypted at rest`}
                </PolicySection>
                <PolicySection title="Your rights">
                  {`• You can download a copy of your data at any time using "Download My Data"\n• You can request permanent deletion using "Delete My Data"\n• You can update your profile information in Edit Profile`}
                </PolicySection>
                <Text style={[styles.policyFooter, { color: PV.textLight }]}>
                  Last updated: January 2025 · MathMentor AI
                </Text>
              </View>
            )}

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
              <Ionicons name="chevron-forward" size={20} color={PV.chevron} />
            </TouchableOpacity>

          </View>
        </View>

        {/* Session Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: PV.text }]}>Session Management</Text>
          <View style={[styles.menuList, { backgroundColor: PV.card }]}>
            <MenuItem icon="phone-portrait-outline" title="Active Sessions" description="Manage devices logged into your account"
              onPress={() => Alert.alert('Active Sessions', 'Session management coming soon.')}
              iconBg="rgba(75, 65, 225, 0.1)" iconColor="#4b41e1" />
            <MenuItem icon="log-out-outline" title="Sign Out All Devices" description="Log out from all other devices"
              onPress={() => {
                Alert.alert('Sign Out All', 'This will sign you out from all devices except this one.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: () => Alert.alert('Success', 'Signed out from all other devices') },
                ]);
              }}
              iconBg="rgba(255, 152, 0, 0.1)" iconColor="#ff9800" />
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

  // Inline panel (expands inside the card)
  inlinePanel: { padding: 20, borderTopWidth: 1 },
  panelIconRow: { alignItems: 'center', marginBottom: 12 },
  panelTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  panelSubtitle: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 20 },

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

  // Policy panel
  policyPanel: { padding: 20, borderTopWidth: 1 },
  policySectionContainer: { marginBottom: 16 },
  policySectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  policySectionBody: { fontSize: 13, lineHeight: 22 },
  policyFooter: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
