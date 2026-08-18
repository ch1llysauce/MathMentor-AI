import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import { useCalculatorContext } from '@/context/CalculatorContext';
import { getBannerGradientColors } from '@/constants/bannerThemes';

interface MenuCardItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  iconBg?: string;
  iconColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function MenuCardItem({
  icon,
  title,
  description,
  badgeText,
  badgeColor,
  badgeTextColor,
  iconBg,
  iconColor,
  onPress,
  rightElement,
}: MenuCardItemProps) {
  const { darkMode, primaryColor } = useTheme();

  const effectiveIconBg = iconBg || (darkMode ? `${primaryColor}25` : `${primaryColor}15`);
  const effectiveIconColor = iconColor || primaryColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.menuCardItem,
        {
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          borderColor: darkMode ? '#2e2e2e' : '#e0e3e5',
        },
      ]}
    >
      <View style={styles.menuCardLeft}>
        <View style={[styles.menuCardIconBox, { backgroundColor: effectiveIconBg }]}>
          <Ionicons name={icon} size={22} color={effectiveIconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.menuCardTitleRow}>
            <Text style={[styles.menuCardTitle, { color: darkMode ? '#ffffff' : '#091426' }]}>
              {title}
            </Text>
            {badgeText && (
              <View
                style={[
                  styles.menuBadge,
                  {
                    backgroundColor: badgeColor || (darkMode ? `${primaryColor}30` : `${primaryColor}15`),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.menuBadgeText,
                    {
                      color: badgeTextColor || primaryColor,
                    },
                  ]}
                >
                  {badgeText}
                </Text>
              </View>
            )}
          </View>
          {description && (
            <Text
              style={[styles.menuCardDescription, { color: darkMode ? '#94a3b8' : '#75777d' }]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}
        </View>
      </View>

      {rightElement ?? (
        <View style={[styles.chevronCircle, { backgroundColor: darkMode ? '#242e42' : '#f7f9fb' }]}>
          <Ionicons name="chevron-forward" size={16} color={darkMode ? '#94a3b8' : '#75777d'} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { darkMode, toggleDarkMode, primaryColor } = useTheme();
  const { fabDismissed, restoreFab } = useCalculatorContext();

  const [isReady, setIsReady] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setIsReady(true);
    }
  }, [user, loading, router]);

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setShowSignOutModal(false);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleVisitWebsite = () => {
    const websiteUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://math-mentor-ai-nine.vercel.app';
    Linking.openURL(websiteUrl).catch(() => {
      Alert.alert('Error', 'Unable to open website in external browser.');
    });
  };

  if (loading || !isReady || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: darkMode ? '#0a0a0a' : '#f7f9fb' }]}>
        <Loading />
      </View>
    );
  }

  const displayName = user?.displayName || 'Student';
  const initial = displayName[0]?.toUpperCase() || 'S';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Student';

  const is2FAActive = user?.twoFactorEnabled;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: darkMode ? '#0a0a0a' : '#f7f9fb' }]}
    >
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title & Verified Badge */}
        <View style={styles.headerSection}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: darkMode ? '#ffffff' : '#091426' }]}>
              Profile & Preferences
            </Text>
            <Text style={[styles.headerSubtitle, { color: darkMode ? '#94a3b8' : '#75777d' }]}>
              Manage your account settings, security options, and study preferences.
            </Text>
          </View>
          <View
            style={[
              styles.verifiedBadge,
              {
                backgroundColor: darkMode ? 'rgba(0, 164, 114, 0.15)' : 'rgba(0, 164, 114, 0.1)',
                borderColor: darkMode ? 'rgba(0, 164, 114, 0.3)' : 'rgba(0, 164, 114, 0.2)',
              },
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color="#00a472" />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </View>
        </View>

        {/* Hero Identity Banner Card */}
        <LinearGradient
          colors={getBannerGradientColors(user?.bannerTheme)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroAvatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.heroAvatarImage} resizeMode="cover" />
            ) : (
              <View style={styles.heroAvatarInitial}>
                <Text style={styles.heroInitialText}>{initial}</Text>
              </View>
            )}
            <View style={styles.heroCheckBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#00a472" />
            </View>
          </View>
          <Text style={styles.heroDisplayName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{user?.email || ''}</Text>
        </LinearGradient>

        {/* Quick Details Card */}
        <View
          style={[
            styles.quickDetailsCard,
            {
              backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
              borderColor: darkMode ? '#2e2e2e' : '#e0e3e5',
            },
          ]}
        >
          <View
            style={[
              styles.detailRow,
              { borderBottomColor: darkMode ? '#242e42' : '#f2f4f6', borderBottomWidth: 1 },
            ]}
          >
            <Text style={[styles.detailLabel, { color: darkMode ? '#94a3b8' : '#75777d' }]}>
              Member Since
            </Text>
            <Text style={[styles.detailValue, { color: darkMode ? '#ffffff' : '#091426' }]}>
              {memberSince}
            </Text>
          </View>

          <View
            style={[
              styles.detailRow,
              { borderBottomColor: darkMode ? '#242e42' : '#f2f4f6', borderBottomWidth: 1 },
            ]}
          >
            <Text style={[styles.detailLabel, { color: darkMode ? '#94a3b8' : '#75777d' }]}>
              Two-Factor Auth
            </Text>
            <Text style={[styles.detailValue, { color: is2FAActive ? '#00a472' : darkMode ? '#94a3b8' : '#75777d' }]}>
              {is2FAActive ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: darkMode ? '#94a3b8' : '#75777d' }]}>
              App Platform
            </Text>
            <Text style={[styles.detailValue, { color: darkMode ? '#ffffff' : '#091426' }]}>
              Mobile Version 1.0.0
            </Text>
          </View>
        </View>

        {/* Account & Security Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: darkMode ? '#94a3b8' : '#45474c' }]}>
            ACCOUNT & SECURITY
          </Text>
          <View style={styles.sectionCardsList}>
            <MenuCardItem
              icon="person-outline"
              title="Edit Profile & Password"
              description="Update display name, avatar, and security credentials"
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={() => router.push('/profile/edit-profile')}
            />

            <MenuCardItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              description="Manage 2FA verification, active login sessions, and data exports"
              badgeText={is2FAActive ? '2FA Active' : '2FA Recommended'}
              badgeColor={
                is2FAActive
                  ? darkMode
                    ? 'rgba(0, 164, 114, 0.25)'
                    : 'rgba(0, 164, 114, 0.15)'
                  : darkMode
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'rgba(245, 158, 11, 0.15)'
              }
              badgeTextColor={is2FAActive ? '#00a472' : '#f59e0b'}
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={() => router.push('/profile/privacy')}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: darkMode ? '#94a3b8' : '#45474c' }]}>
            PREFERENCES & UTILITIES
          </Text>
          <View style={styles.sectionCardsList}>
            <MenuCardItem
              icon="calculator-outline"
              title="Scientific Calculator"
              description="Open calculator modal or restore floating chathead icon"
              badgeText={fabDismissed ? 'Hidden (Tap to restore)' : 'Active'}
              badgeColor={
                fabDismissed
                  ? darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'
                  : darkMode ? `${primaryColor}25` : `${primaryColor}15`
              }
              badgeTextColor={fabDismissed ? '#ef4444' : primaryColor}
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={restoreFab}
            />

            <MenuCardItem
              icon="settings-outline"
              title="App Settings"
              description="Configure dark mode, offline cache mode, and app preferences"
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={() => router.push('/profile/settings')}
            />
          </View>
        </View>

        {/* Support & Knowledge Base Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: darkMode ? '#94a3b8' : '#45474c' }]}>
            SUPPORT & KNOWLEDGE BASE
          </Text>
          <View style={styles.sectionCardsList}>
            <MenuCardItem
              icon="help-circle-outline"
              title="Help & FAQs"
              description="Instant search, categorized guides, direct email support & feedback"
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={() => router.push('/profile/faq')}
            />

            <MenuCardItem
              icon="information-circle-outline"
              title="About MathMentor AI"
              description="App mission, curriculum details, core features & legal terms of service"
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={() => router.push('/profile/about')}
            />

            <MenuCardItem
              icon="globe-outline"
              title="Visit Home Page"
              description="View the MathMentor AI public landing page & product overview"
              iconBg={darkMode ? `${primaryColor}25` : `${primaryColor}15`}
              iconColor={primaryColor}
              onPress={handleVisitWebsite}
            />
          </View>
        </View>

        {/* Sign Out Account Button */}
        <TouchableOpacity
          onPress={() => setShowSignOutModal(true)}
          style={[
            styles.signOutBtn,
            {
              backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
              borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#ffdad6',
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={darkMode ? '#f87171' : '#ba1a1a'} />
          <Text style={[styles.signOutBtnText, { color: darkMode ? '#f87171' : '#ba1a1a' }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.appVersionText, { color: darkMode ? '#64748b' : '#75777d' }]}>
          Version 1.0.0
        </Text>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!logoutLoading) setShowSignOutModal(false);
        }}
      >
        <View style={styles.signOutOverlay}>
          <View style={[styles.signOutContent, { backgroundColor: darkMode ? '#161616' : '#ffffff' }]}>
            {/* Warning Icon Box */}
            <View
              style={[
                styles.signOutIconBox,
                {
                  backgroundColor: darkMode ? '#3b1212' : '#fef2f2',
                  borderColor: darkMode ? '#7f1d1d' : '#fee2e2',
                },
              ]}
            >
              <Ionicons name="log-out-outline" size={32} color={darkMode ? '#f87171' : '#ef4444'} />
            </View>

            {/* Title & Message */}
            <Text style={[styles.signOutTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
              Sign Out of Account?
            </Text>
            <Text style={[styles.signOutMessage, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
              Are you sure you want to log out? You will need to sign back in to resume your practice sessions and AI tutoring.
            </Text>

            {/* Action Buttons */}
            <View style={styles.signOutButtonRow}>
              <TouchableOpacity
                disabled={logoutLoading}
                onPress={() => setShowSignOutModal(false)}
                style={[styles.signOutCancelBtn, { backgroundColor: darkMode ? '#2d3748' : '#f3f4f6' }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.signOutCancelBtnText, { color: darkMode ? '#ffffff' : '#374151' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={logoutLoading}
                onPress={confirmLogout}
                style={styles.signOutConfirmBtn}
                activeOpacity={0.8}
              >
                {logoutLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={styles.signOutConfirmContent}>
                    <Ionicons name="warning-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.signOutConfirmBtnText}>Sign Out</Text>
                  </View>
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00a472',
  },

  /* Hero Identity Banner */
  heroBanner: {
    backgroundColor: '#4b41e1',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroAvatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  heroAvatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroAvatarInitial: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroInitialText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 1,
  },
  heroDisplayName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },

  /* Quick Details Card */
  quickDetailsCard: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Section Containers */
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCardsList: {
    gap: 10,
  },

  /* MenuCardItem Styles */
  menuCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  menuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 10,
  },
  menuCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  menuCardDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Toggle Switch */
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  /* Sign Out Button */
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  appVersionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },

  /* Sign Out Modal */
  signOutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signOutContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  signOutIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signOutTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  signOutMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  signOutButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  signOutCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  signOutConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutConfirmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});