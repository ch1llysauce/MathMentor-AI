import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import Loading from '@/components/common/Loading';
import { dashboardService, DashboardStats, TopicProgress as TopicProgressData } from '@/services/dashboardService';

interface TopicProgress {
  name: string;
  progress: number;
  problemsSolved: number;
}

export default function DashboardScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    topics: TopicProgress[];
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Default fallback data
  const defaultTopics: TopicProgress[] = [
    { name: 'Algebra', progress: 0, problemsSolved: 0 },
    { name: 'Geometry', progress: 0, problemsSolved: 0 },
    { name: 'Trigonometry', progress: 0, problemsSolved: 0 },
  ];

  const defaultStats: DashboardStats = {
    currentStreak: 0,
    xpEarned: 0,
    accuracy: 0,
    avgSpeed: 0,
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData();
      const topicProgress = await dashboardService.getTopicProgress();
      const stats = dashboardService.calculateStats(data);

      // Merge with default topics to ensure all 3 topics are shown
      const mergedTopics = defaultTopics.map(defaultTopic => {
        const existingTopic = topicProgress.find(t => t.topic === defaultTopic.name);
        return existingTopic 
          ? { name: existingTopic.topic, progress: existingTopic.progress, problemsSolved: existingTopic.problemsSolved }
          : defaultTopic;
      });

      setDashboardData({
        stats,
        topics: mergedTopics,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use default data on error
      setDashboardData({
        stats: defaultStats,
        topics: defaultTopics,
      });
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setIsReady(true);
      fetchDashboardData();
    }
  }, [user, loading, router]);

  if (loading || !isReady || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  const firstName = user.displayName.split(' ')[0];
  const stats = dashboardData?.stats || defaultStats;
  const topics = dashboardData?.topics || defaultTopics;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#ffffff" />
          </View>
          <Text style={styles.logoText}>MathMentor AI</Text>
        </View>
        <TouchableOpacity style={styles.insightsButton}>
          <Ionicons name="stats-chart" size={24} color="#091426" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4b41e1']} />
        }
      >
        {loadingData ? (
          <View style={styles.loadingDataContainer}>
            <Loading />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : (
          <>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome back, {firstName}.</Text>
            <Text style={styles.welcomeSubtitle}>Ready to solve some problems today?</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="school" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Resume Tutoring</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="analytics" size={20} color="#3323cc" />
              <Text style={styles.secondaryButtonText}>Diagnostic</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Grid */}
        <View style={styles.mainGrid}>
          {/* Featured Topic Card */}
          <View style={styles.featuredCard}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>NEXT IN YOUR PATH</Text>
            </View>
            <Text style={styles.featuredTitle}>Linear Equations</Text>
            <Text style={styles.featuredDescription}>
              Master the fundamentals of algebraic balancing and solving for single variables in coordinate planes.
            </Text>
            
            <View style={styles.featuredFooter}>
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Topic Progress</Text>
                  <Text style={styles.progressPercent}>65%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Start Lesson</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.featuredIcon}>
              <Ionicons name="calculator" size={80} color="rgba(255,255,255,0.1)" />
            </View>
          </View>

          {/* Learning Pulse Card */}
          <View style={styles.pulseCard}>
            <Text style={styles.pulseTitle}>Learning Pulse</Text>
            <View style={styles.pulseList}>
              {topics.map((topic, index) => (
                <TouchableOpacity key={index} style={styles.pulseItem}>
                  <View style={styles.pulseItemLeft}>
                    <View style={styles.radialProgress}>
                      <Text style={styles.radialText}>{topic.progress}%</Text>
                    </View>
                    <View>
                      <Text style={styles.pulseTopicName}>{topic.name}</Text>
                      <Text style={styles.pulseTopicStats}>{topic.problemsSolved} Problems Solved</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#4b41e1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(75, 65, 225, 0.1)' }]}>
                <Ionicons name="calendar" size={24} color="#4b41e1" />
              </View>
              <Text style={styles.statLabel}>Study Streak</Text>
              <Text style={styles.statValue}>{stats.currentStreak} Days</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(78, 222, 163, 0.2)' }]}>
                <Ionicons name="star" size={24} color="#00a472" />
              </View>
              <Text style={styles.statLabel}>XP Earned</Text>
              <Text style={styles.statValue}>{stats.xpEarned.toLocaleString()}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(216, 227, 251, 1)' }]}>
                <Ionicons name="checkmark-done" size={24} color="#091426" />
              </View>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{stats.accuracy}%</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 218, 214, 1)' }]}>
                <Ionicons name="timer" size={24} color="#ba1a1a" />
              </View>
              <Text style={styles.statLabel}>Avg. Speed</Text>
              <Text style={styles.statValue}>{stats.avgSpeed}s</Text>
            </View>
          </View>

          {/* Daily Challenge Card */}
          <View style={styles.challengeCard}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeTitle}>Daily Challenge</Text>
              <Text style={styles.challengeDescription}>
                Solve 3 Polynomial Division problems to earn double XP and a "Master of Logic" badge.
              </Text>
              <View style={styles.challengeButtons}>
                <TouchableOpacity style={styles.challengePrimaryButton}>
                  <Text style={styles.challengePrimaryText}>Accept Challenge</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.challengeSecondaryText}>View Rewards</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.challengeBadge}>
              <Ionicons name="trophy" size={40} color="#4b41e1" />
            </View>
          </View>
        </View>
        </>
        )}
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#091426',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2dfff',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#091426',
    letterSpacing: -0.3,
  },
  insightsButton: {
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
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#091426',
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#45474c',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4b41e1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e2dfff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#3323cc',
    fontSize: 15,
    fontWeight: '600',
  },
  mainGrid: {
    gap: 16,
  },
  featuredCard: {
    backgroundColor: '#4b41e1', // Using solid color instead of gradient
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
    justifyContent: 'space-between',
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  progressSection: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercent: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4edea3',
    borderRadius: 4,
  },
  startButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#091426',
    fontSize: 15,
    fontWeight: '700',
  },
  featuredIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  pulseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  pulseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 16,
  },
  pulseList: {
    gap: 12,
  },
  pulseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f2f4f6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 205, 0.3)',
  },
  pulseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  radialProgress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e3e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#091426',
  },
  pulseTopicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#091426',
  },
  pulseTopicStats: {
    fontSize: 12,
    color: '#45474c',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#45474c',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#091426',
  },
  challengeCard: {
    backgroundColor: 'rgba(224, 227, 234, 0.5)',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#091426',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#45474c',
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  challengePrimaryButton: {
    backgroundColor: '#091426',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  challengePrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  challengeSecondaryText: {
    color: '#091426',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingDataContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#45474c',
  },
  challengeBadge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
