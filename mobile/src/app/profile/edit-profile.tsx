import { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { authService } from '@/services/authService';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import AvatarPicker from '@/components/AvatarPicker';
import { BANNER_THEMES, getBannerGradientColors } from '@/constants/bannerThemes';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const { darkMode } = useTheme();

  const EP = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    label: darkMode ? '#a0a0a0' : '#45474c',
    inputBg: darkMode ? '#1a1a1a' : '#ffffff',
    inputBorder: darkMode ? '#2e2e2e' : '#e0e3e5',
    inputText: darkMode ? '#f0f0f0' : '#091426',
    disabledBg: darkMode ? '#242424' : '#f2f4f6',
    disabledText: darkMode ? '#666666' : '#75777d',
    helperText: darkMode ? '#666666' : '#75777d',
    iconColor: darkMode ? '#888888' : '#75777d',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    modalBg: darkMode ? '#161616' : '#ffffff',
    cardBg: darkMode ? '#1a1a1a' : '#ffffff',
  };

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [bannerTheme, setBannerTheme] = useState<string>(user?.bannerTheme || 'indigo');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Detect unsaved changes
  const hasChanges = useMemo(() => {
    const nameChanged = displayName.trim() !== (user?.displayName || '');
    const imageChanged = profileImage !== (user?.profileImage || '');
    const bannerChanged = bannerTheme !== (user?.bannerTheme || 'indigo');
    const passwordStarted = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
    return nameChanged || imageChanged || bannerChanged || passwordStarted;
  }, [displayName, profileImage, bannerTheme, currentPassword, newPassword, confirmPassword, user?.displayName, user?.profileImage, user?.bannerTheme]);

  // Intercept Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [hasChanges])
  );

  const handleBack = () => {
    if (!hasChanges) {
      router.back();
    } else {
      setShowDiscardModal(true);
    }
  };

  const handleSavePress = () => {
    setErrorMsg('');
    if (!displayName.trim()) {
      setErrorMsg('Display name cannot be empty');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (newPassword && !currentPassword) {
      setErrorMsg('Please enter your current password to set a new one');
      return;
    }

    setShowSaveModal(true);
  };

  const executeSave = async () => {
    setShowSaveModal(false);
    setIsSaving(true);
    setErrorMsg('');
    try {
      const nameChanged = displayName.trim() !== user?.displayName;
      const imageChanged = profileImage !== (user?.profileImage || '');
      const bannerChanged = bannerTheme !== (user?.bannerTheme || 'indigo');
      if (nameChanged || imageChanged || bannerChanged) {
        await updateUser({
          displayName: displayName.trim(),
          profileImage,
          bannerTheme,
        });
      }

      if (newPassword && currentPassword) {
        await api.put('/auth/change-password', {
          currentPassword,
          newPassword,
        });
      }

      router.back();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update profile. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      await logout();
      router.replace('/auth/login');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || 'Failed to delete account.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: EP.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: EP.header, borderBottomColor: EP.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: EP.backBtnBg }]} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={EP.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: EP.text }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!!errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color="#ba1a1a" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Hero Banner Preview Card with LinearGradient */}
          <LinearGradient
            colors={getBannerGradientColors(bannerTheme)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerPreviewCard}
          >
            <View style={styles.previewAvatarBox}>
              <AvatarPicker
                imageUri={profileImage}
                initials={displayName || user?.displayName || '?'}
                onChange={setProfileImage}
                size={88}
                disabled={isSaving}
                textColor="#ffffff"
              />
            </View>
            <Text style={styles.previewDisplayName}>{displayName || 'User'}</Text>
            <Text style={styles.previewEmail}>{user?.email || ''}</Text>
          </LinearGradient>

          {/* Banner Theme Presets Selector */}
          <View style={[styles.themeCard, { backgroundColor: EP.cardBg, borderColor: EP.border }]}>
            <Text style={[styles.themeSectionTitle, { color: EP.text }]}>Banner Theme Presets</Text>
            <Text style={[styles.themeSectionSubtitle, { color: EP.textLight }]}>
              Customize your profile header color accent across web and mobile.
            </Text>

            <View style={styles.presetGrid}>
              {BANNER_THEMES.map((theme) => {
                const isSelected = bannerTheme === theme.id;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.presetItem,
                      { borderColor: isSelected ? '#4b41e1' : EP.border },
                      isSelected && styles.presetItemSelected,
                    ]}
                    onPress={() => setBannerTheme(theme.id)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={theme.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.presetSwatch}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                      )}
                    </LinearGradient>
                    <Text style={[styles.presetName, { color: EP.text }]}>{theme.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: EP.text }]}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: EP.label }]}>Display Name</Text>
              <View style={[styles.inputContainer, { backgroundColor: EP.inputBg, borderColor: EP.inputBorder }]}>
                <Ionicons name="person-outline" size={20} color={EP.iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: EP.inputText }]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your display name"
                  placeholderTextColor={EP.disabledText}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: EP.label }]}>Email Address</Text>
              <View style={[styles.inputContainer, { backgroundColor: EP.disabledBg, borderColor: EP.inputBorder }]}>
                <Ionicons name="mail-outline" size={20} color={EP.disabledText} style={styles.inputIcon} />
                <Text style={[styles.input, { color: EP.disabledText, paddingVertical: 14 }]}>
                  {user?.email || ''}
                </Text>
              </View>
              <Text style={[styles.helperText, { color: EP.helperText }]}>Email cannot be changed</Text>
            </View>
          </View>

          {/* Change Password */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: EP.text }]}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: EP.label }]}>Current Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: EP.inputBg, borderColor: EP.inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={20} color={EP.iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: EP.inputText, paddingRight: 48 }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={EP.disabledText}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrentPassword(!showCurrentPassword)} activeOpacity={0.7}>
                  <Ionicons name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={EP.iconColor} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: EP.label }]}>New Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: EP.inputBg, borderColor: EP.inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={20} color={EP.iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: EP.inputText, paddingRight: 48 }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={EP.disabledText}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)} activeOpacity={0.7}>
                  <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={EP.iconColor} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: EP.label }]}>Confirm New Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: EP.inputBg, borderColor: EP.inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={20} color={EP.iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: EP.inputText, paddingRight: 48 }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={EP.disabledText}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={EP.iconColor} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.helperText, { color: EP.helperText }]}>Leave blank to keep current password</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, (!hasChanges || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSavePress}
            disabled={!hasChanges || isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#ba1a1a" style={{ marginRight: 6 }} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Changes Modal */}
      <Modal visible={showSaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: EP.modalBg, borderColor: EP.border }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(75,65,225,0.12)' }]}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#4b41e1" />
            </View>
            <Text style={[styles.modalTitle, { color: EP.text }]}>Save Changes?</Text>
            <Text style={[styles.modalSubtitle, { color: EP.textLight }]}>
              Are you sure you want to save your updated profile details and preferences?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#4b41e1' }]}
                onPress={executeSave}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#242424' : '#f2f4f6' }]}
                onPress={() => setShowSaveModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { color: EP.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: EP.modalBg, borderColor: EP.border }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>
            <Text style={[styles.modalTitle, { color: '#ef4444' }]}>Delete Account?</Text>
            <Text style={[styles.modalSubtitle, { color: EP.textLight }]}>
              This action is permanent and cannot be undone. All your progress, diagnostics, learning history, and credentials will be erased.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ba1a1a' }]}
                onPress={executeDeleteAccount}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Delete Account</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#242424' : '#f2f4f6' }]}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { color: EP.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unsaved Changes Discard Modal */}
      <Modal visible={showDiscardModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: EP.modalBg, borderColor: EP.border }]}>
            <View style={[styles.modalIconBox, { backgroundColor: 'rgba(255, 152, 0, 0.12)' }]}>
              <Ionicons name="warning-outline" size={28} color="#ff9800" />
            </View>
            <Text style={[styles.modalTitle, { color: EP.text }]}>Unsaved Changes</Text>
            <Text style={[styles.modalSubtitle, { color: EP.textLight }]}>
              You have unsaved profile changes. Are you sure you want to leave without saving?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ba1a1a' }]}
                onPress={() => {
                  setShowDiscardModal(false);
                  router.back();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>Discard Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#242424' : '#f2f4f6' }]}
                onPress={() => setShowDiscardModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { color: EP.text }]}>Keep Editing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  /* Banner Preview Card */
  bannerPreviewCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewAvatarBox: {
    marginBottom: 8,
    alignItems: 'center',
  },
  previewDisplayName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  previewEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 2,
  },

  /* Theme Selector */
  themeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
  },
  themeSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  themeSectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  presetItem: {
    width: '31%',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
  },
  presetItemSelected: {
    backgroundColor: 'rgba(75, 65, 225, 0.06)',
  },
  presetSwatch: {
    width: '100%',
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  presetName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#4b41e1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  deleteButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ba1a1a',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalBtnRow: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
