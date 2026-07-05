import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Linking, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import Loading from '@/components/common/Loading';
import { dashboardService } from '@/services/dashboardService';

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0,
    totalQuestions: 0,
    totalCorrect: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setIsReady(true);
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      setStats({
        currentStreak: data.user.currentStreak,
        longestStreak: data.user.longestStreak,
        totalStudyTime: data.user.totalStudyTime,
        totalQuestions: data.overallProgress.totalQuestions,
        totalCorrect: data.overallProgress.totalCorrect,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

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

  const handleSettings = () => {
    router.push('/profile/settings');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit-profile');
  };

  const handleNotifications = () => {
    router.push('/profile/notifications');
  };

  const handlePrivacySecurity = () => {
    router.push('/profile/privacy');
  };

  const handleLearningGoals = () => {
    setShowGoalsModal(true);
  };

  const handleDifficultyLevel = () => {
    setShowDifficultyModal(true);
  };

  const handleHelpCenter = () => {
    router.push('/profile/help');
  };

  const handleContactUs = () => {
    Alert.alert(
      'Contact Us',
      'How would you like to contact us?',
      [
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@mathmentor.ai?subject=Support Request')
              .catch(() => Alert.alert('Error', 'Unable to open email app'));
          },
        },
        {
          text: 'Phone',
          onPress: () => Alert.alert('Phone Support', 'Call us at: +1 (555) 123-4567'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About MathMentor AI',
      'Version 1.0.0\n\n' +
      'MathMentor AI is your personalized mathematics learning companion. ' +
      'We use advanced AI to help you master mathematics at your own pace.\n\n' +
      '\u00A9 2024 MathMentor AI. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  const handleSaveGoals = (goals: string[]) => {
    // TODO: Save to backend
    Alert.alert('Success', 'Learning goals updated!');
    setShowGoalsModal(false);
  };

  const handleSaveDifficulty = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    // TODO: Save to backend
    Alert.alert('Success', `Difficulty level set to ${difficulty}!`);
    setShowDifficultyModal(false);
  };

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading || !isReady || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#091426" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#00a472" />
            </View>
          </View>
          
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          {user.focusAreas && user.focusAreas.length > 0 && (
            <View style={styles.focusAreasContainer}>
              {user.focusAreas.map((area, index) => (
                <View key={index} style={styles.focusChip}>
                  <Ionicons name="bookmark" size={14} color="#4b41e1" />
                  <Text style={styles.focusChipText}>{area}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stats Grid */}
        {loadingStats ? (
          <View style={styles.loadingStatsContainer}>
            <Loading />
          </View>
        ) : (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  <Ionicons name="flame" size={24} color="#4b41e1" />
                </View>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 164, 114, 0.1)' }]}>
                  <Ionicons name="trophy" size={24} color="#00a472" />
                </View>
                <Text style={styles.statValue}>{stats.longestStreak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(216, 227, 251, 1)' }]}>
                  <Ionicons name="time" size={24} color="#091426" />
                </View>
                <Text style={styles.statValue}>{formatStudyTime(stats.totalStudyTime)}</Text>
                <Text style={styles.statLabel}>Study Time</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(78, 222, 163, 0.2)' }]}>
                  <Ionicons name="checkmark-done" size={24} color="#00a472" />
                </View>
                <Text style={styles.statValue}>{stats.totalCorrect}</Text>
                <Text style={styles.statLabel}>Solved</Text>
              </View>
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  <Ionicons name="person-outline" size={20} color="#4b41e1" />
                </View>
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(0, 164, 114, 0.1)' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#00a472" />
                </View>
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacySecurity}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(216, 227, 251, 1)' }]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#091426" />
                </View>
                <Text style={styles.menuItemText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLearningGoals}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  <Ionicons name="school-outline" size={20} color="#4b41e1" />
                </View>
                <Text style={styles.menuItemText}>Learning Goals</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDifficultyLevel}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(0, 164, 114, 0.1)' }]}>
                  <Ionicons name="speedometer-outline" size={20} color="#00a472" />
                </View>
                <Text style={styles.menuItemText}>Difficulty Level</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyBadgeText}>{selectedDifficulty}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={handleHelpCenter}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  <Ionicons name="help-circle-outline" size={20} color="#4b41e1" />
                </View>
                <Text style={styles.menuItemText}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleContactUs}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(0, 164, 114, 0.1)' }]}>
                  <Ionicons name="mail-outline" size={20} color="#00a472" />
                </View>
                <Text style={styles.menuItemText}>Contact Us</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(216, 227, 251, 1)' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#091426" />
                </View>
                <Text style={styles.menuItemText}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#75777d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ba1a1a" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Learning Goals Modal */}
      <Modal
        visible={showGoalsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Learning Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                <Ionicons name="close" size={24} color="#091426" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Select the topics you want to focus on:
            </Text>

            <View style={styles.goalsContainer}>
              {['Algebra', 'Geometry', 'Trigonometry'].map((goal) => (
                <TouchableOpacity key={goal} style={styles.goalChip}>
                  <Ionicons name="checkbox" size={20} color="#4b41e1" />
                  <Text style={styles.goalChipText}>{goal}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleSaveGoals(['Algebra', 'Calculus'])}
            >
              <Text style={styles.modalButtonText}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Difficulty Level Modal */}
      <Modal
        visible={showDifficultyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDifficultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Difficulty Level</Text>
              <TouchableOpacity onPress={() => setShowDifficultyModal(false)}>
                <Ionicons name="close" size={24} color="#091426" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Choose your preferred difficulty level:
            </Text>

            <TouchableOpacity
              style={[
                styles.difficultyOption,
                selectedDifficulty === 'Easy' && styles.difficultyOptionSelected,
              ]}
              onPress={() => handleSaveDifficulty('Easy')}
            >
              <View style={styles.difficultyOptionLeft}>
                <View style={[styles.difficultyIcon, { backgroundColor: 'rgba(0, 164, 114, 0.1)' }]}>
                  <Ionicons name="leaf-outline" size={24} color="#00a472" />
                </View>
                <View>
                  <Text style={styles.difficultyOptionTitle}>Easy</Text>
                  <Text style={styles.difficultyOptionDesc}>Gentle learning pace</Text>
                </View>
              </View>
              {selectedDifficulty === 'Easy' && (
                <Ionicons name="checkmark-circle" size={24} color="#4b41e1" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.difficultyOption,
                selectedDifficulty === 'Medium' && styles.difficultyOptionSelected,
              ]}
              onPress={() => handleSaveDifficulty('Medium')}
            >
              <View style={styles.difficultyOptionLeft}>
                <View style={[styles.difficultyIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                  <Ionicons name="speedometer-outline" size={24} color="#4b41e1" />
                </View>
                <View>
                  <Text style={styles.difficultyOptionTitle}>Medium</Text>
                  <Text style={styles.difficultyOptionDesc}>Balanced challenge</Text>
                </View>
              </View>
              {selectedDifficulty === 'Medium' && (
                <Ionicons name="checkmark-circle" size={24} color="#4b41e1" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.difficultyOption,
                selectedDifficulty === 'Hard' && styles.difficultyOptionSelected,
              ]}
              onPress={() => handleSaveDifficulty('Hard')}
            >
              <View style={styles.difficultyOptionLeft}>
                <View style={[styles.difficultyIcon, { backgroundColor: 'rgba(186, 26, 26, 0.1)' }]}>
                  <Ionicons name="flame-outline" size={24} color="#ba1a1a" />
                </View>
                <View>
                  <Text style={styles.difficultyOptionTitle}>Hard</Text>
                  <Text style={styles.difficultyOptionDesc}>Advanced problems</Text>
                </View>
              </View>
              {selectedDifficulty === 'Hard' && (
                <Ionicons name="checkmark-circle" size={24} color="#4b41e1" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f7f9fb',
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#091426',
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#e2dfff',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 2,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#091426',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#45474c',
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
    backgroundColor: '#e2dfff',
    borderRadius: 999,
  },
  focusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b41e1',
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
    color: '#091426',
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
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
    color: '#091426',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#45474c',
  },
  section: {
    marginBottom: 16,
  },
  menuList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#091426',
  },
  difficultyBadge: {
    backgroundColor: '#e2dfff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b41e1',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffdad6',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ba1a1a',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#75777d',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    marginBottom: 100
  },
  modalContent: {
    backgroundColor: '#ffffff',
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
    color: '#091426',
  },
  modalDescription: {
    fontSize: 14,
    color: '#45474c',
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
    backgroundColor: '#e2dfff',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#4b41e1',
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b41e1',
  },
  modalButton: {
    backgroundColor: '#4b41e1',
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
    backgroundColor: '#f7f9fb',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyOptionSelected: {
    backgroundColor: '#e2dfff',
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
    color: '#091426',
    marginBottom: 2,
  },
  difficultyOptionDesc: {
    fontSize: 12,
    color: '#45474c',
  },
});
