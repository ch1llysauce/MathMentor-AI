import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';
import { dashboardService } from '@/services/dashboardService';
import { useTheme } from '@/context/ThemeContext';

const lightColors = {
  background: '#f7f9fb',
  card: '#ffffff',
  text: '#091426',
  textLight: '#45474c',
  textDark: '#091426',
  primary: '#4b41e1',
  primaryBg: 'rgba(75, 65, 225, 0.1)',
  success: '#00a472',
  successBg: 'rgba(0, 164, 114, 0.1)',
  purpleBg: 'rgba(216, 227, 251, 1)',
  greenBg: 'rgba(78, 222, 163, 0.2)',
  border: '#e0e3e5',
  borderLight: '#f2f4f6',
  outline: '#75777d',
  logoutBg: '#ffffff',
  logoutBorder: '#ffdad6',
  logoutText: '#ba1a1a',
  versionText: '#75777d',
  headerBg: '#ffffff',
  headerTitle: '#091426',
  statIconPurple: '#4b41e1',
  statIconGreen: '#00a472',
  statIconDark: '#091426',
  toggleBg: '#e0e3e5',
  toggleActiveBg: '#4b41e1',
  toggleThumb: '#ffffff',
  avatarBg: '#4b41e1',
  avatarBorder: '#e2dfff',
  avatarBadge: '#ffffff',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalContent: '#ffffff',
  focusChipBg: '#e2dfff',
  goalChipBg: '#e2dfff',
  goalChipBorder: '#4b41e1',
  goalChipInactiveBg: '#f2f4f6',
  goalChipInactiveBorder: '#e0e3e5',
  difficultyBg: '#e2dfff',
  difficultyText: '#4b41e1',
  modalButtonBg: '#4b41e1',
  modalButtonText: '#ffffff',
  statBoxBg: '#ffffff',
  statValue: '#091426',
  statLabel: '#45474c',
  menuItemText: '#091426',
  chevronColor: '#75777d',
  menuIconBg: 'rgba(75, 65, 225, 0.1)',
  menuIconPurpleBg: 'rgba(216, 227, 251, 1)',
  menuIconGreenBg: 'rgba(0, 164, 114, 0.1)',
  menuIconDarkBg: 'rgba(216, 227, 251, 1)',
};

const darkColors = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  text: '#f0f0f0',
  textLight: '#a0a0a0',
  textDark: '#f0f0f0',
  primary: '#a5b4fc',
  primaryBg: 'rgba(165, 180, 252, 0.15)',
  success: '#34d399',
  successBg: 'rgba(52, 211, 153, 0.15)',
  purpleBg: 'rgba(165, 180, 252, 0.2)',
  greenBg: 'rgba(52, 211, 153, 0.15)',
  border: '#2e2e2e',
  borderLight: '#1a1a1a',
  outline: '#555555',
  logoutBg: '#1a1a1a',
  logoutBorder: '#7f1d1d',
  logoutText: '#f87171',
  versionText: '#666666',
  headerBg: '#0a0a0a',
  headerTitle: '#f0f0f0',
  statIconPurple: '#a5b4fc',
  statIconGreen: '#34d399',
  statIconDark: '#f0f0f0',
  toggleBg: '#3a3a3a',
  toggleActiveBg: '#a5b4fc',
  toggleThumb: '#f0f0f0',
  avatarBg: '#4b41e1',
  avatarBorder: '#312e81',
  avatarBadge: '#1a1a1a',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  modalContent: '#1a1a1a',
  focusChipBg: '#312e81',
  goalChipBg: '#312e81',
  goalChipBorder: '#a5b4fc',
  goalChipInactiveBg: '#242424',
  goalChipInactiveBorder: '#3a3a3a',
  difficultyBg: '#312e81',
  difficultyText: '#a5b4fc',
  modalButtonBg: '#4b41e1',
  modalButtonText: '#ffffff',
  statBoxBg: '#1a1a1a',
  statValue: '#f0f0f0',
  statLabel: '#a0a0a0',
  menuItemText: '#f0f0f0',
  chevronColor: '#888888',
  menuIconBg: 'rgba(165, 180, 252, 0.15)',
  menuIconPurpleBg: 'rgba(165, 180, 252, 0.2)',
  menuIconGreenBg: 'rgba(52, 211, 153, 0.15)',
  menuIconDarkBg: 'rgba(165, 180, 252, 0.2)',
};

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const C = darkMode ? darkColors : lightColors;

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setIsReady(true);
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit-profile');
  };

  const handlePrivacySecurity = () => {
    router.push('/profile/privacy');
  };

  const handleFaq = () => {
    router.push('/profile/faq');
  };

  const handleAbout = () => {
    router.push('/profile/about');
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  if (loading || !isReady || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: C.background }]}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.headerBg, borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.headerTitle }]}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: C.card }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: C.avatarBg, borderColor: C.avatarBorder }]}>
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={[styles.avatarBadge, { backgroundColor: C.avatarBadge }]}>
              <Ionicons name="checkmark-circle" size={24} color={C.success} />
            </View>
          </View>

          <Text style={[styles.displayName, { color: C.textDark }]}>{user.displayName}</Text>
          <Text style={[styles.email, { color: C.textLight }]}>{user.email}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textDark }]}>Account</Text>
          <View style={[styles.menuList, { backgroundColor: C.card }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: darkMode ? 0 : 1, borderBottomColor: C.borderLight }]} onPress={handleEditProfile}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: C.primaryBg }]}>
                  <Ionicons name="person-outline" size={20} color={C.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: C.menuItemText }]}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacySecurity}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: C.purpleBg }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={C.textDark} />
                </View>
                <Text style={[styles.menuItemText, { color: C.menuItemText }]}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.chevronColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textDark }]}>Preferences</Text>
          <View style={[styles.menuList, { backgroundColor: C.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDarkModeToggle}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: C.primaryBg }]}>
                  <Ionicons name={darkMode ? 'moon' : 'sunny'} size={20} color={C.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: C.menuItemText }]}>{darkMode ? 'Dark Mode' : 'Light Mode'}</Text>
              </View>
              <View style={[styles.toggle, { backgroundColor: C.toggleBg }, darkMode && styles.toggleActive]}>
                <View style={[styles.toggleThumb, { backgroundColor: C.toggleThumb, marginLeft: darkMode ? 20 : 0 }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textDark }]}>Support</Text>
          <View style={[styles.menuList, { backgroundColor: C.card }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: darkMode ? 0 : 1, borderBottomColor: C.borderLight }]} onPress={handleFaq}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: C.primaryBg }]}>
                  <Ionicons name="help-circle-outline" size={20} color={C.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: C.menuItemText }]}>FAQs</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: C.purpleBg }]}>
                  <Ionicons name="information-circle-outline" size={20} color={C.textDark} />
                </View>
                <Text style={[styles.menuItemText, { color: C.menuItemText }]}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.chevronColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: C.logoutBg, borderColor: C.logoutBorder }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={C.logoutText} />
          <Text style={[styles.logoutText, { color: C.logoutText }]}>Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.versionText, { color: C.versionText }]}>Version 1.0.0</Text>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: 2,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 16,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  focusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingStatsContainer: {
    paddingVertical: 40,
  },
  statsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
  },
  menuList: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 100
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
  },
  goalChipInactive: {
    borderColor: '#e0e3e5',
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalChipTextInactive: {
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyOptionSelected: {
    borderColor: '#4b41e1',
  },
  difficultyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  difficultyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  difficultyOptionDesc: {
    fontSize: 12,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleActive: {
    backgroundColor: '#4b41e1',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});