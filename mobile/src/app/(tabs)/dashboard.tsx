import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';
import { dashboardService, DashboardStats, TopicProgress as TopicProgressData } from '@/services/dashboardService';
import api from '@/services/api';
import { PROGRESS_ENDPOINTS } from '@/constants/api';
import { useTheme } from '@/context/ThemeContext';

interface TopicProgress {
  name: string;
  progress: number;
  problemsSolved: number;
}

interface NextStep {
  topic: string;
  subtopic: string;
  currentScore: number;
  reason: string;
  difficulty: string;
}

// Per-topic icon and description fallbacks
const TOPIC_META: Record<string, { icon: string; description: string }> = {
  Algebra: {
    icon: 'calculator',
    description: 'Build your foundation with equations, expressions, and algebraic reasoning.',
  },
  Geometry: {
    icon: 'shapes',
    description: 'Explore angles, shapes, areas, and spatial relationships.',
  },
  Trigonometry: {
    icon: 'compass',
    description: 'Master ratios, triangles, and the unit circle with confidence.',
  },
};

export default function DashboardScreen() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { darkMode } = useTheme();

  // Dynamic colors based on theme
  const D = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    headerBg: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    primary: darkMode ? '#a5b4fc' : '#4b41e1',
    itemBg: darkMode ? '#242424' : '#f2f4f6',
    itemBorder: darkMode ? 'rgba(100,100,120,0.2)' : 'rgba(197, 198, 205, 0.3)',
    insightsBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    secondaryBtnBg: darkMode ? '#312e81' : '#e2dfff',
    secondaryBtnText: darkMode ? '#a5b4fc' : '#3323cc',
    radialBg: darkMode ? '#2e2e2e' : '#e0e3e5',
  };
  const [isReady, setIsReady] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    topics: TopicProgress[];
  } | null>(null);
  const [nextStep, setNextStep] = useState<NextStep | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [resumeLoading, setResumeLoading] = useState(false);

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

  // Handle Diagnostic button press
  const handleDiagnosticPress = () => {
    if (user?.diagnosticCompleted) {
      // User has results — show their diagnostic tab
      router.push('/(tabs)/diagnostic');
    } else {
      // No diagnostic yet — send them to the test
      router.push('/diagnostic/retake');
    }
  };

  // Handle Resume Tutoring button press
  const handleResumeTutoring = async () => {
    if (!user?.diagnosticCompleted) {
      // No diagnostic done — prompt them to take it first
      router.push('/diagnostic/retake');
      return;
    }

    try {
      setResumeLoading(true);
      const response = await api.get(PROGRESS_ENDPOINTS.NEXT_RECOMMENDATION);
      const recommendation = response.data.data;

      // Navigate to the recommended topic
      const topicName = recommendation.topic || recommendation.nextTopic || 'Algebra';
      const mastery = recommendation.masteryLevel ?? 0;

      router.push({
        pathname: '/practice/topic',
        params: {
          topicName,
          mastery: mastery.toString(),
        },
      });
    } catch (error: any) {
      // If no recommendation available (e.g. no diagnostic), fall back to practice tab
      console.warn('Resume tutoring fallback:', error?.message);
      router.push('/(tabs)/practice');
    } finally {
      setResumeLoading(false);
    }
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
    }

    // Fetch next recommendation if diagnostic is done
    try {
      const recResponse = await api.get(PROGRESS_ENDPOINTS.NEXT_RECOMMENDATION);
      const rec = recResponse.data.data;
      if (rec?.nextStep) {
        setNextStep({
          topic: rec.nextStep.topic,
          subtopic: rec.nextStep.subtopic,
          currentScore: rec.nextStep.currentScore ?? 0,
          reason: rec.nextStep.reason ?? '',
          difficulty: rec.nextStep.difficulty ?? 'Easy',
        });
      }
    } catch {
      // No diagnostic yet or network issue — nextStep stays null
      setNextStep(null);
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
      <View style={[styles.loadingContainer, { backgroundColor: D.bg }]}>
        <Loading />
      </View>
    );
  }

  const firstName = user.displayName.split(' ')[0];
  const stats = dashboardData?.stats || defaultStats;
  const topics = dashboardData?.topics || defaultTopics;

  return (
    <View style={[styles.container, { backgroundColor: D.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={D.bg} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: D.headerBg, borderBottomColor: D.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { borderColor: darkMode ? '#312e81' : '#e2dfff' }]}>
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={20} color="#ffffff" />
            )}
          </View>
          <Text style={[styles.logoText, { color: D.text }]}>MathMentor AI</Text>
        </View>
        <TouchableOpacity style={[styles.insightsButton, { backgroundColor: D.insightsBtnBg }]}>
          <Ionicons name="stats-chart" size={24} color={D.text} />
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
            <Text style={[styles.loadingText, { color: D.textLight }]}>Loading your progress...</Text>
          </View>
        ) : (
          <>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={[styles.welcomeTitle, { color: D.text }]}>Welcome back, {firstName}.</Text>
            <Text style={[styles.welcomeSubtitle, { color: D.textLight }]}>Ready to solve some problems today?</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, resumeLoading && styles.primaryButtonDisabled]}
              onPress={handleResumeTutoring}
              disabled={resumeLoading}
            >
              {resumeLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="school" size={20} color="#ffffff" />
              )}
              <Text style={styles.primaryButtonText}>
                {resumeLoading ? 'Loading...' : 'Resume Tutoring'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: D.secondaryBtnBg }]} onPress={handleDiagnosticPress}>
              <Ionicons name="analytics" size={20} color={D.secondaryBtnText} />
              <Text style={[styles.secondaryButtonText, { color: D.secondaryBtnText }]}>
                {user?.diagnosticCompleted ? 'Diagnostic' : 'Take Diagnostic'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Grid */}
        <View style={styles.mainGrid}>
          {/* Featured Topic Card */}
          {nextStep ? (
            <TouchableOpacity
              style={styles.featuredCard}
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: '/practice/topic',
                  params: {
                    topicName: nextStep.topic,
                    mastery: nextStep.currentScore.toString(),
                  },
                })
              }
            >
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>NEXT IN YOUR PATH</Text>
              </View>
              <Text style={styles.featuredTitle}>{nextStep.subtopic}</Text>
              <Text style={styles.featuredDescription}>
                {nextStep.reason ||
                  TOPIC_META[nextStep.topic]?.description ||
                  `Continue building your ${nextStep.topic} skills.`}
              </Text>

              <View style={styles.featuredFooter}>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      {nextStep.topic} Progress
                    </Text>
                    <Text style={styles.progressPercent}>{nextStep.currentScore}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${nextStep.currentScore}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start Lesson</Text>
                </View>
              </View>

              <View style={styles.featuredIcon}>
                <Ionicons
                  name={(TOPIC_META[nextStep.topic]?.icon ?? 'calculator') as any}
                  size={80}
                  color="rgba(255,255,255,0.1)"
                />
              </View>
            </TouchableOpacity>
          ) : (
            /* No diagnostic yet — prompt the user */
            <TouchableOpacity
              style={styles.featuredCard}
              activeOpacity={0.92}
              onPress={() => router.push('/diagnostic/retake')}
            >
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>GET STARTED</Text>
              </View>
              <Text style={styles.featuredTitle}>Take the Diagnostic</Text>
              <Text style={styles.featuredDescription}>
                Complete a short assessment so MathMentor can build your personalised learning path.
              </Text>

              <View style={styles.featuredFooter}>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Your Path</Text>
                    <Text style={styles.progressPercent}>0%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0%' }]} />
                  </View>
                </View>
                <View style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start Now</Text>
                </View>
              </View>

              <View style={styles.featuredIcon}>
                <Ionicons name="analytics" size={80} color="rgba(255,255,255,0.1)" />
              </View>
            </TouchableOpacity>
          )}

          {/* Learning Pulse Card */}
          <View style={[styles.pulseCard, { backgroundColor: D.card }]}>
            <Text style={[styles.pulseTitle, { color: D.text }]}>Learning Pulse</Text>
            <View style={styles.pulseList}>
              {topics.map((topic, index) => (
                <TouchableOpacity key={index} style={[styles.pulseItem, { backgroundColor: D.itemBg, borderColor: D.itemBorder }]}>
                  <View style={styles.pulseItemLeft}>
                    <View style={[styles.radialProgress, { backgroundColor: D.radialBg }]}>
                      <Text style={[styles.radialText, { color: D.text }]}>{topic.progress}%</Text>
                    </View>
                    <View>
                      <Text style={[styles.pulseTopicName, { color: D.text }]}>{topic.name}</Text>
                      <Text style={[styles.pulseTopicStats, { color: D.textLight }]}>{topic.problemsSolved} Problems Solved</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={D.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: D.card }]}>
              <View style={[styles.statIcon, { backgroundColor: darkMode ? 'rgba(165,180,252,0.15)' : 'rgba(75, 65, 225, 0.1)' }]}>
                <Ionicons name="calendar" size={24} color={darkMode ? '#a5b4fc' : '#4b41e1'} />
              </View>
              <Text style={[styles.statLabel, { color: D.textLight }]}>Study Streak</Text>
              <Text style={[styles.statValue, { color: D.text }]}>{stats.currentStreak} Days</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: D.card }]}>
              <View style={[styles.statIcon, { backgroundColor: darkMode ? 'rgba(52,211,153,0.15)' : 'rgba(78, 222, 163, 0.2)' }]}>
                <Ionicons name="star" size={24} color={darkMode ? '#34d399' : '#00a472'} />
              </View>
              <Text style={[styles.statLabel, { color: D.textLight }]}>XP Earned</Text>
              <Text style={[styles.statValue, { color: D.text }]}>{stats.xpEarned.toLocaleString()}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: D.card }]}>
              <View style={[styles.statIcon, { backgroundColor: darkMode ? 'rgba(165,180,252,0.2)' : 'rgba(216, 227, 251, 1)' }]}>
                <Ionicons name="checkmark-done" size={24} color={darkMode ? '#a5b4fc' : '#091426'} />
              </View>
              <Text style={[styles.statLabel, { color: D.textLight }]}>Accuracy</Text>
              <Text style={[styles.statValue, { color: D.text }]}>{stats.accuracy}%</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: D.card }]}>
              <View style={[styles.statIcon, { backgroundColor: darkMode ? 'rgba(248,113,113,0.15)' : 'rgba(255, 218, 214, 1)' }]}>
                <Ionicons name="timer" size={24} color={darkMode ? '#f87171' : '#ba1a1a'} />
              </View>
              <Text style={[styles.statLabel, { color: D.textLight }]}>Avg. Speed</Text>
              <Text style={[styles.statValue, { color: D.text }]}>{stats.avgSpeed}s</Text>
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  primaryButtonDisabled: {
    opacity: 0.7,
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
  loadingDataContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#45474c',
  },
});
