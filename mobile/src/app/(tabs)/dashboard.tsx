import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import api from '@/services/api';
import { PROGRESS_ENDPOINTS } from '@/constants/api';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import { dashCache } from '@/utils/tabCache';
import { storage } from '@/utils/storage';

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
  completedLessons?: number;
  totalLessonsInSubtopic?: number;
}

// Per-topic icon, color, and subtopics definition
const TOPIC_META: Record<string, { icon: string; color: string; description: string; subtopics: number }> = {
  Algebra: {
    icon: 'calculator-outline',
    color: '#2563eb',
    description: 'Build your foundation with equations, expressions, and algebraic reasoning.',
    subtopics: 10,
  },
  Geometry: {
    icon: 'shapes-outline',
    color: '#00a472',
    description: 'Explore angles, shapes, areas, and spatial relationships.',
    subtopics: 9,
  },
  Trigonometry: {
    icon: 'compass-outline',
    color: '#f59e0b',
    description: 'Master ratios, triangles, and the unit circle with confidence.',
    subtopics: 9,
  },
};

// Module-level cache so tab switches don't re-show the loading screen
// (Imported from tabCache so logout can clear it centrally)
const _dashCache = dashCache;

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { darkMode, primaryColor, gradientColors } = useTheme();

  // Dynamic colors based on theme
  const D = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    headerBg: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    primary: primaryColor,
    itemBg: darkMode ? '#242424' : '#f2f4f6',
    itemBorder: darkMode ? 'rgba(100,100,120,0.2)' : 'rgba(197, 198, 205, 0.3)',
    insightsBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    secondaryBtnBg: darkMode ? 'rgba(255,255,255,0.15)' : `${primaryColor}1a`,
    secondaryBtnText: darkMode ? '#ffffff' : primaryColor,
    radialBg: darkMode ? '#2e2e2e' : '#e0e3e5',
  };
  const [isReady, setIsReady] = useState(!!_dashCache.data);
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    topics: TopicProgress[];
  } | null>(_dashCache.data);
  const [topicMastery, setTopicMastery] = useState<{ topic: string; mastery: number }[]>(_dashCache.topicMastery);
  const [nextStep, setNextStep] = useState<NextStep | null>(_dashCache.nextStep);
  const [recommendationProgress, setRecommendationProgress] = useState<{
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
  }>(_dashCache.recommendationProgress);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(!_dashCache.data);
  // Tracks whether the user has a diagnostic — starts from the stored flag
  // but gets corrected by the live API response (fixes stale-cache issue).
  const [diagnosticDone, setDiagnosticDone] = useState<boolean>(
    !!user?.diagnosticCompleted
  );
  // Prevents the featured card from rendering until at least one API fetch
  // has confirmed the diagnostic/nextStep state, eliminating the 1-second flash.
  const [cardReady, setCardReady] = useState<boolean>(dashCache.cardReady);

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
    accuracyCorrect: 0,
    accuracyTotal: 0,
    avgSpeed: 0,
  };

  // Handle Diagnostic button press
  const handleDiagnosticPress = () => {
    if (diagnosticDone) {
      // User has results — show their diagnostic tab
      router.push('/(tabs)/diagnostic');
    } else {
      // No diagnostic yet — send them to the test
      router.push('/diagnostic/retake');
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      const [data, topicProgress, diagnosticStats] = await Promise.all([
        dashboardService.getDashboardData(),
        dashboardService.getTopicProgress(),
        dashboardService.getDiagnosticStats(),
      ]);
      const stats = dashboardService.calculateStats(
        data,
        diagnosticStats.accuracy,
        diagnosticStats.avgSpeed,
        diagnosticStats.accuracyCorrect,
        diagnosticStats.accuracyTotal,
      );

      // diagnosticStats returns accuracy > 0 only when a diagnostic exists
      // Use it as authoritative source — fixes stale user.diagnosticCompleted flag
      if (diagnosticStats.accuracyTotal > 0) {
        setDiagnosticDone(true);
      }

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
      _dashCache.data = { stats, topics: mergedTopics };

      // Extract per-topic mastery from the summary (averageMastery per topic)
      const mastery = (['Algebra', 'Geometry', 'Trigonometry'] as const).map(t => {
        const found = data.topicStats.find((s: any) => s.topic === t);
        return { topic: t, mastery: found?.averageMastery ?? 0 };
      });
      setTopicMastery(mastery);
      _dashCache.topicMastery = mastery;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use default data on error
      setDashboardData({
        stats: defaultStats,
        topics: defaultTopics,
      });
    }

    // Fetch next recommendation — a successful response also confirms a diagnostic exists
    try {
      const recResponse = await api.get(PROGRESS_ENDPOINTS.NEXT_RECOMMENDATION);
      const rec = recResponse.data.data;
      if (rec) {
        await storage.setItem('mathmentor_offline_dashboard_recommendation', JSON.stringify(rec));
      }

      // Any valid response from this endpoint means a diagnostic was completed
      setDiagnosticDone(true);

      if (rec?.nextStep) {
        const ns = {
          topic: rec.nextStep.topic,
          subtopic: rec.nextStep.subtopic,
          currentScore: rec.nextStep.currentScore ?? 0,
          reason: rec.nextStep.reason ?? '',
          difficulty: rec.nextStep.difficulty ?? 'Easy',
          completedLessons: rec.nextStep.completedLessons ?? 0,
          totalLessonsInSubtopic: rec.nextStep.totalLessonsInSubtopic ?? 0,
        };
        setNextStep(ns);
        _dashCache.nextStep = ns;
      }
      const recProgress = {
        progressPercentage: rec?.progressPercentage ?? 0,
        completedLessons: rec?.completedLessons ?? 0,
        totalLessons: rec?.totalLessons ?? 0,
      };
      setRecommendationProgress(recProgress);
      _dashCache.recommendationProgress = recProgress;
    } catch (recErr: any) {
      try {
        const cachedRecRaw = await storage.getItem('mathmentor_offline_dashboard_recommendation');
        if (cachedRecRaw) {
          const rec = JSON.parse(cachedRecRaw);
          setDiagnosticDone(true);

          if (rec?.nextStep) {
            const ns = {
              topic: rec.nextStep.topic,
              subtopic: rec.nextStep.subtopic,
              currentScore: rec.nextStep.currentScore ?? 0,
              reason: rec.nextStep.reason ?? '',
              difficulty: rec.nextStep.difficulty ?? 'Easy',
              completedLessons: rec.nextStep.completedLessons ?? 0,
              totalLessonsInSubtopic: rec.nextStep.totalLessonsInSubtopic ?? 0,
            };
            setNextStep(ns);
            _dashCache.nextStep = ns;
          }
          const recProgress = {
            progressPercentage: rec?.progressPercentage ?? 0,
            completedLessons: rec?.completedLessons ?? 0,
            totalLessons: rec?.totalLessons ?? 0,
          };
          setRecommendationProgress(recProgress);
          _dashCache.recommendationProgress = recProgress;
        }
      } catch (cacheErr) {
        console.log('No offline dashboard recommendation cached');
      }
    } finally {
      setCardReady(true);
      dashCache.cardReady = true;
      if (!silent) setLoadingData(false);
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
      if (!_dashCache.data) fetchDashboardData();
    }
  }, [user, loading, router]);

  // Silently refresh when tab is re-focused without showing the loading screen
  useFocusEffect(
    useCallback(() => {
      if (isReady) fetchDashboardData(true);
    }, [isReady])
  );

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
          <TouchableOpacity
            style={[styles.avatar, { borderColor: darkMode ? '#312e81' : '#e2dfff' }]}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
          <Text style={[styles.logoText, { color: D.text }]}>MathMentor AI</Text>
        </View>
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
              style={[
                styles.primaryButton,
                {
                  backgroundColor: primaryColor,
                  shadowColor: primaryColor,
                },
              ]}
              onPress={() => router.push('/(tabs)/tutor')}
              activeOpacity={0.85}
            >
              <Ionicons name="school" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Resume Tutoring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${primaryColor}18`,
                  borderColor: `${primaryColor}40`,
                  borderWidth: 1,
                  shadowOpacity: 0,
                  elevation: 0,
                },
              ]}
              onPress={handleDiagnosticPress}
              activeOpacity={0.85}
            >
              <Ionicons name="analytics" size={20} color={darkMode ? (primaryColor === '#4b41e1' ? '#a5b4fc' : primaryColor) : primaryColor} />
              <Text style={[styles.primaryButtonText, { color: darkMode ? (primaryColor === '#4b41e1' ? '#a5b4fc' : primaryColor) : primaryColor }]}>
                {diagnosticDone ? 'Diagnostic' : 'Take Diagnostic'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Grid */}
        <View style={styles.mainGrid}>
          {/* Featured Topic Card */}
          {!cardReady ? (
            /* Skeleton — shown for the brief moment before the first API response */
            <View style={[styles.featuredCard, styles.featuredCardSkeleton]}>
              <View style={styles.skeletonBadge} />
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDesc} />
              <View style={styles.skeletonDescShort} />
            </View>
          ) : nextStep ? (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: '/practice/topic',
                  params: {
                    topicName: nextStep.topic,
                    mastery: nextStep.currentScore.toString(),
                    subtopicFilter: nextStep.subtopic,
                  },
                })
              }
            >
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredCard}>
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
                      {nextStep.totalLessonsInSubtopic
                        ? `${nextStep.completedLessons ?? 0}/${nextStep.totalLessonsInSubtopic} lessons`
                        : `${nextStep.subtopic} Progress`}
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
              </LinearGradient>
            </TouchableOpacity>
          ) : diagnosticDone ? (
            /* Diagnostic done but no next step — check if user has any progress */
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.push('/(tabs)/practice')}
            >
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredCard}>
              {(() => {
                const hasProgress = topics.some(t => t.problemsSolved > 0);
                const badge = hasProgress ? 'GREAT JOB' : 'READY TO START';
                const title = hasProgress ? "You're crushing it!" : "Let's get to work!";
                const desc = hasProgress
                  ? (recommendationProgress.totalLessons > 0
                      ? `You've completed ${recommendationProgress.completedLessons} of ${recommendationProgress.totalLessons} lessons. Keep exploring practice sets to sharpen your skills.`
                      : 'All recommended topics are complete. Keep practicing to maintain your mastery across all subjects.')
                  : 'Your diagnostic is done and your learning path is ready. Jump into practice to start building mastery.';
                const icon = hasProgress ? 'flame' : 'rocket';
                const btnLabel = hasProgress ? 'Browse Topics' : 'Start Practicing';
                const pct = recommendationProgress.progressPercentage;
                return (
                  <>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>{badge}</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{title}</Text>
                    <Text style={styles.featuredDescription}>{desc}</Text>
                    <View style={styles.featuredFooter}>
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Overall Progress</Text>
                          <Text style={styles.progressPercent}>{pct}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${pct}%` }]} />
                        </View>
                      </View>
                      <View style={styles.startButton}>
                        <Text style={styles.startButtonText}>{btnLabel}</Text>
                      </View>
                    </View>
                    <View style={styles.featuredIcon}>
                      <Ionicons name={icon as any} size={80} color="rgba(255,255,255,0.1)" />
                    </View>
                  </>
                );
              })()}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* No diagnostic yet — prompt the user */
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.push('/diagnostic/retake')}
            >
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredCard}>
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
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Topic Breakdown & Mastery */}
          <View style={[styles.pulseCard, { backgroundColor: D.card }]}>
            <View style={styles.topicHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.topicHeaderTitleGroup}>
                  <Ionicons name="bar-chart-outline" size={20} color={D.primary} />
                  <Text style={[styles.pulseTitle, { color: D.text, marginBottom: 0 }]}>Topic Breakdown & Mastery</Text>
                </View>
                <Text style={[styles.pulseSub, { color: D.textLight }]}>Your progress across main domain areas</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/practice')} activeOpacity={0.7}>
                <View style={styles.viewAllBtn}>
                  <Text style={[styles.viewAllText, { color: D.primary }]}>View All</Text>
                  <Ionicons name="arrow-forward" size={12} color={D.primary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.pulseList}>
              {(['Algebra', 'Geometry', 'Trigonometry'] as const).map((topicName) => {
                const meta = TOPIC_META[topicName] || { icon: 'calculator-outline', color: '#4b41e1', subtopics: 0 };
                const foundMastery = topicMastery.find(t => t.topic.toLowerCase() === topicName.toLowerCase())?.mastery ?? 0;
                const progressTopic = topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
                const mastery = Math.round(Math.max(foundMastery, progressTopic?.progress ?? 0));

                return (
                  <TouchableOpacity
                    key={topicName}
                    style={[styles.pulseItem, { backgroundColor: D.itemBg, borderColor: D.itemBorder }]}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname: '/practice/topic',
                        params: { topicName, mastery: mastery.toString() },
                      })
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.masteryHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={[styles.topicBadgeIcon, { backgroundColor: meta.color }]}>
                            <Ionicons name={meta.icon as any} size={18} color="#ffffff" />
                          </View>
                          <View>
                            <Text style={[styles.pulseTopicName, { color: D.text }]}>{topicName}</Text>
                            <Text style={[styles.pulseTopicStats, { color: D.textLight }]}>{meta.subtopics} subtopics</Text>
                          </View>
                        </View>
                        <View style={[styles.masteryPill, { backgroundColor: D.card }]}>
                          <Text style={[styles.masteryPct, { color: D.text }]}>{mastery}% Mastery</Text>
                        </View>
                      </View>

                      {/* Mastery Progress Bar */}
                      <View style={[styles.masteryBarBg, { backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                        <View
                          style={[
                            styles.masteryBarFill,
                            {
                              width: `${Math.min(mastery, 100)}%`,
                              backgroundColor: meta.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: D.card }]}>
              <View style={[styles.statIcon, { backgroundColor: darkMode ? 'rgba(165,180,252,0.2)' : 'rgba(216, 227, 251, 1)' }]}>
                <Ionicons name="checkmark-done" size={24} color={darkMode ? '#a5b4fc' : '#091426'} />
              </View>
              <Text style={[styles.statLabel, { color: D.textLight }]}>Accuracy</Text>
              {stats.accuracyTotal > 0 ? (
                <>
                  <Text style={[styles.statValue, { color: D.text }]}>
                    {`${stats.accuracy}%`} <Text style={[styles.statScore, { color: D.textLight }]}>{stats.accuracyCorrect}/{stats.accuracyTotal}</Text>
                  </Text>
                  <Text style={[styles.statSource, { color: D.textLight }]}>Diagnostic Results</Text>
                </>
              ) : (
                <Text style={[styles.statValue, { color: D.text }]}>—</Text>
              )}
            </View>

            <View style={[styles.statCard, { backgroundColor: D.card }]}>
              <View style={[styles.statIcon, { backgroundColor: darkMode ? 'rgba(248,113,113,0.15)' : 'rgba(255, 218, 214, 1)' }]}>
                <Ionicons name="timer" size={24} color={darkMode ? '#f87171' : '#ba1a1a'} />
              </View>
              <Text style={[styles.statLabel, { color: D.textLight }]}>Avg. Speed</Text>
              <Text style={[styles.statValue, { color: D.text }]}>{stats.avgSpeed > 0 ? `${stats.avgSpeed}s` : '—'}</Text>
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
  featuredCardSkeleton: {
    justifyContent: 'flex-start',
    gap: 16,
  },
  skeletonBadge: {
    width: 120,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skeletonTitle: {
    width: '70%',
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skeletonDesc: {
    width: '100%',
    height: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonDescShort: {
    width: '60%',
    height: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  topicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  topicHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseSub: {
    fontSize: 12,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topicBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.15)',
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  masteryPct: {
    fontSize: 12,
    fontWeight: '700',
  },
  masteryBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#091426',
  }, 
  statSource: {
    fontSize: 11,
    color: '#45474c',
    marginTop: 2,
    fontStyle: 'italic',
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
