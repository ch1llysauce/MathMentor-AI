import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Alert, Modal, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { user } = useAuth();

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
  };

  // ── 2FA state ────────────────────────────────────────────────────────────
  const [twoFactorAuth, setTwoFactorAuth] = useState(user?.twoFactorEnabled ?? false);

  // 2FA setup modal
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify'>('qr');

  // 2FA disable modal
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    setTwoFactorAuth(user?.twoFactorEnabled ?? false);
  }, [user]);

  // ── 2FA handlers ─────────────────────────────────────────────────────────

  const handleTwoFactorToggle = async (value: boolean) => {
    if (value) {
      setSetupStep('qr');
      setVerifyCode('');
      setSetupLoading(true);
      setSetupModalVisible(true);
      try {
        const data = await authService.setup2FA();
        setQrCode(data.qrCode);
        setSetupSecret(data.secret);
      } catch (error: any) {
        setSetupModalVisible(false);
        Alert.alert('Error', error.response?.data?.message || 'Failed to set up 2FA');
      } finally {
        setSetupLoading(false);
      }
    } else {
      setDisableCode('');
      setDisableModalVisible(true);
    }
  };

  const handleVerify2FA = async () => {
    if (verifyCode.trim().length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your authenticator app');
      return;
    }
    setSetupLoading(true);
    try {
      const response = await authService.verify2FA(verifyCode.trim());
      if (response.success) {
        setTwoFactorAuth(true);
        setSetupModalVisible(false);
        setVerifyCode('');
        Alert.alert('2FA Enabled', 'Two-factor authentication is now active on your account');
      } else {
        Alert.alert('Invalid Code', response.message || 'Verification failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid verification code');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (disableCode.trim().length !== 6) {
      Alert.alert('Error', 'Please enter your current 6-digit code to confirm');
      return;
    }
    setDisableLoading(true);
    try {
      const response = await authService.disable2FA(disableCode.trim());
      if (response.success) {
        setTwoFactorAuth(false);
        setDisableModalVisible(false);
        setDisableCode('');
        Alert.alert('2FA Disabled', 'Two-factor authentication has been turned off');
      } else {
        Alert.alert('Failed', response.message || 'Could not disable 2FA');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid verification code');
    } finally {
      setDisableLoading(false);
    }
  };

  // ── Shared components ────────────────────────────────────────────────────

  const ToggleItem = ({
    icon, title, description, value, onValueChange, iconBg, iconColor,
  }: {
    icon: string; title: string; description: string; value: boolean;
    onValueChange: (v: boolean) => void; iconBg: string; iconColor: string;
  }) => (
    <View style={[styles.toggleItem, { borderBottomColor: PV.itemBorder }]}>
      <View style={styles.toggleLeft}>
        <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleTitle, { color: PV.text }]}>{title}</Text>
          <Text style={[styles.toggleDescription, { color: PV.textLight }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: darkMode ? '#3a3a3a' : '#e0e3e5', true: '#b8b3ff' }}
        thumbColor={value ? '#4b41e1' : darkMode ? '#666666' : '#f2f4f6'}
        ios_backgroundColor={darkMode ? '#3a3a3a' : '#e0e3e5'}
      />
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: PV.text }]}>Security Settings</Text>
          <View style={[styles.toggleList, { backgroundColor: PV.card }]}>
            <ToggleItem
              icon="shield-checkmark-outline"
              title="Two-Factor Authentication"
              description={twoFactorAuth ? 'Your account has extra protection' : 'Add an extra layer of security'}
              value={twoFactorAuth}
              onValueChange={handleTwoFactorToggle}
              iconBg="rgba(0, 164, 114, 0.1)"
              iconColor="#00a472"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: PV.text }]}>Data Management</Text>
          <View style={[styles.menuList, { backgroundColor: PV.card }]}>
            <MenuItem icon="download-outline" title="Download My Data" description="Get a copy of your data"
              onPress={() => Alert.alert('Download Data', 'Your data will be prepared and sent to your email within 24 hours.')}
              iconBg="rgba(75, 65, 225, 0.1)" iconColor="#4b41e1" />
            <MenuItem icon="document-text-outline" title="Data Usage Policy" description="How we use your information"
              onPress={() => Alert.alert('Data Policy', 'View our data usage policy in the help center.')}
              iconBg="rgba(33, 150, 243, 0.1)" iconColor="#2196f3" />
            <MenuItem icon="trash-outline" title="Delete My Data" description="Permanently remove your data"
              onPress={() => {
                Alert.alert('Delete Data', 'This will permanently delete all your learning data. This action cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {} },
                ]);
              }}
              iconBg="rgba(186, 26, 26, 0.1)" iconColor="#ba1a1a" />
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
          <View style={styles.securityIconContainer}>
            <Ionicons name="shield-checkmark" size={48} color={twoFactorAuth ? '#00a472' : '#4b41e1'} />
          </View>
          <Text style={[styles.securityTitle, { color: PV.text }]}>
            {twoFactorAuth ? 'Strong Protection Active' : 'Your Account is Secure'}
          </Text>
          <Text style={[styles.securityDescription, { color: PV.textLight }]}>
            {twoFactorAuth
              ? '2FA is enabled. Your account is protected with an extra layer of verification.'
              : 'We use industry-standard encryption to protect your data and privacy.'}
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── 2FA Setup Modal ─────────────────────────────────────────────────── */}
      <Modal visible={setupModalVisible} transparent animationType="slide"
        onRequestClose={() => { setSetupModalVisible(false); setVerifyCode(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: PV.card }]}>

            {setupLoading && setupStep === 'qr' ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#4b41e1" />
                <Text style={[styles.modalSubtitle, { color: PV.textLight, marginTop: 16 }]}>
                  Generating your QR code...
                </Text>
              </View>
            ) : setupStep === 'qr' ? (
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="shield-checkmark" size={36} color="#4b41e1" />
                </View>
                <Text style={[styles.modalTitle, { color: PV.text }]}>Set Up 2FA</Text>
                <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
                  Scan this QR code with Google Authenticator or Authy
                </Text>

                {qrCode ? (
                  <Image source={{ uri: qrCode }} style={styles.qrCode} resizeMode="contain" />
                ) : null}

                <View style={[styles.secretBox, { backgroundColor: PV.input, borderColor: PV.inputBorder }]}>
                  <Text style={[styles.secretLabel, { color: PV.textLight }]}>Manual entry key</Text>
                  <Text style={[styles.secretText, { color: PV.text }]} selectable>{setupSecret}</Text>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={() => setSetupStep('verify')}>
                  <Text style={styles.primaryButtonText}>I've scanned the code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostButton} onPress={() => { setSetupModalVisible(false); setVerifyCode(''); }}>
                  <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="keypad-outline" size={36} color="#4b41e1" />
                </View>
                <Text style={[styles.modalTitle, { color: PV.text }]}>Enter Verification Code</Text>
                <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
                  Enter the 6-digit code from your authenticator app to confirm setup
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
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.primaryButton, setupLoading && styles.buttonDisabled]}
                  onPress={handleVerify2FA}
                  disabled={setupLoading}
                >
                  {setupLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryButtonText}>Enable 2FA</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostButton} onPress={() => setSetupStep('qr')}>
                  <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── 2FA Disable Modal ────────────────────────────────────────────────── */}
      <Modal visible={disableModalVisible} transparent animationType="slide"
        onRequestClose={() => { setDisableModalVisible(false); setDisableCode(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: PV.card }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(186, 26, 26, 0.1)' }]}>
              <Ionicons name="shield-outline" size={36} color="#ba1a1a" />
            </View>
            <Text style={[styles.modalTitle, { color: PV.text }]}>Disable 2FA</Text>
            <Text style={[styles.modalSubtitle, { color: PV.textLight }]}>
              Enter your current authenticator code to confirm
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
              autoFocus
            />

            <TouchableOpacity
              style={[styles.destructiveButton, disableLoading && styles.buttonDisabled]}
              onPress={handleDisable2FA}
              disabled={disableLoading}
            >
              {disableLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryButtonText}>Disable 2FA</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={() => { setDisableModalVisible(false); setDisableCode(''); }}>
              <Text style={[styles.ghostButtonText, { color: PV.textLight }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  toggleList: {
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
  securityIconContainer: { marginBottom: 16 },
  securityTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  securityDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, alignItems: 'center', paddingBottom: 48 },
  modalLoadingContainer: { paddingVertical: 40, alignItems: 'center' },
  modalIconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(75, 65, 225, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  qrCode: { width: 200, height: 200, marginBottom: 20 },
  secretBox: { width: '100%', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 24, alignItems: 'center' },
  secretLabel: { fontSize: 11, marginBottom: 4 },
  secretText: { fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  codeInput: {
    width: '100%', height: 64, borderRadius: 16, borderWidth: 1,
    fontSize: 32, fontWeight: '700', letterSpacing: 12, marginBottom: 24,
  },
  primaryButton: {
    width: '100%', height: 56, backgroundColor: '#4b41e1',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
  destructiveButton: {
    width: '100%', height: 56, backgroundColor: '#ba1a1a',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  ghostButton: { paddingVertical: 12 },
  ghostButtonText: { fontSize: 16 },
  buttonDisabled: { opacity: 0.6 },
});
