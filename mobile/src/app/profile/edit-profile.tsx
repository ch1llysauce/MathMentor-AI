import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { useTheme } from '@/context/ThemeContext';
import AvatarPicker from '@/components/AvatarPicker';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
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
    deleteBg: darkMode ? '#2a2a2a' : '#d1d1d1ff',
  };
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Detect unsaved changes
  const hasChanges = useMemo(() => {
    const nameChanged = displayName.trim() !== (user?.displayName || '');
    const imageChanged = profileImage !== (user?.profileImage || '');
    const passwordStarted = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
    return nameChanged || imageChanged || passwordStarted;
  }, [displayName, profileImage, currentPassword, newPassword, confirmPassword, user?.displayName, user?.profileImage]);

  // Intercept Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true; // prevent default back
      });
      return () => subscription.remove();
    }, [hasChanges])
  );

  const handleBack = () => {
    if (!hasChanges) {
      router.back();
      return;
    }
    Alert.alert(
      'Unsaved Changes',
      'You have unsaved changes. What would you like to do?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        { text: 'Save', onPress: handleSave },
      ]
    );
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword && !currentPassword) {
      Alert.alert('Error', 'Please enter your current password to set a new one');
      return;
    }

    setIsSaving(true);
    try {
      // Update display name and/or profile image if changed
      const nameChanged = displayName.trim() !== user?.displayName;
      const imageChanged = profileImage !== (user?.profileImage || '');
      if (nameChanged || imageChanged) {
        await updateUser({
          displayName: displayName.trim(),
          profileImage,
        });
      }

      // Change password if requested
      if (newPassword && currentPassword) {
        await api.put('/auth/change-password', {
          currentPassword,
          newPassword,
        });
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: EP.bg }]}>
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
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <AvatarPicker
            imageUri={profileImage}
            initials={displayName || user?.displayName || '?'}
            onChange={setProfileImage}
            size={100}
            disabled={isSaving}
          />
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
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: EP.deleteBg }]}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => Alert.alert('Contact Support', 'Please contact support@mathmentor.ai to delete your account.'),
                }
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#45474c',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e3e5',
    paddingHorizontal: 16,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#091426',
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
    color: '#75777d',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#4b41e1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#d1d1d1ff',
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ba1a1a',
  },
});
