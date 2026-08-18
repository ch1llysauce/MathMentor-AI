import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { MasteryRing } from '@/components/MasteryRing';
import { WeakAreaCard } from '@/components/WeakAreaCard';
import { TimelineChart } from '@/components/TimelineChart';
import diagnosticService from '@/services/diagnosticService';
import { DiagnosticResult, WeakTopic } from '@/types/diagnostic';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import { diagCache } from '@/utils/tabCache';
import CustomAlertModal from '@/components/common/CustomAlertModal';

type TimelinePeriod = 'week' | 'month' | '6months';

// Module-level cache so switching tabs doesn't re-show the loading screen
// (Imported from tabCache so logout can clear it centrally)
const _diagCache = diagCache;

export default function DiagnosticScreen() {
  const router = useRouter();
  const { darkMode, primaryColor, gradientColors } = useTheme();

  const DX = {
    bg: darkMode ? '#0a0a0a' : Colors.background,
    card: darkMode ? '#1a1a1a' : Colors.white,
    text: darkMode ? '#f0f0f0' : Colors.primary,
    textBody: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    secondary: primaryColor || (darkMode ? '#a5b4fc' : Colors.secondary),
    surface: darkMode ? '#242424' : Colors.surfaceContainerLow,
    border: darkMode ? '#2e2e2e' : Colors.border,
    badgeBg: primaryColor ? `${primaryColor}20` : (darkMode ? '#312e81' : Colors.secondaryFixed),
    badgeText: primaryColor || (darkMode ? '#a5b4fc' : Colors.onSecondaryFixedVariant),
    recBg: darkMode ? '#1e1e2e' : Colors.surfaceContainerLow,
    recBorder: primaryColor || (darkMode ? '#a5b4fc' : Colors.secondary),
    ctaBg: darkMode ? '#1a1a2e' : Colors.primary,
    ctaBtn: primaryColor || (darkMode ? '#4b41e1' : Colors.secondary),
    periodBg: darkMode ? '#242424' : Colors.surfaceContainerLow,
    periodActiveBg: darkMode ? '#1a1a1a' : Colors.white,
    periodText: darkMode ? '#a0a0a0' : Colors.textLight,
    periodActiveText: primaryColor || (darkMode ? '#f0f0f0' : Colors.primary),
  };
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(_diagCache.diagnostic);
  const [timelineData, setTimelineData] = useState<any[]>(_diagCache.timelineData);
  const [selectedPeriod, setSelectedPeriod] = useState<TimelinePeriod>('week');
  const [loading, setLoading] = useState(!_diagCache.loaded);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  useEffect(() => {
    if (!_diagCache.loaded) loadDiagnosticData();
  }, []);

  // Silently refresh when tab is re-focused
  useFocusEffect(
    useCallback(() => {
      if (_diagCache.loaded) loadDiagnosticData(true);
    }, [])
  );

  useEffect(() => {
    if (diagnostic) {
      loadTimelineData(selectedPeriod);
    }
  }, [selectedPeriod]);

  const loadDiagnosticData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await diagnosticService.getLatestDiagnostic();
      const diag = response.data?.diagnostic || (response as any).data;
      setDiagnostic(diag);
      _diagCache.diagnostic = diag;
      await loadTimelineData(selectedPeriod);
      _diagCache.loaded = true;
    } catch (error: any) {
      console.error('Error loading diagnostic:', error);
      if (!silent) {
        if (error.response?.status === 404) {
          setDiagnostic(null);
        } else {
          showAlert('Error', 'Failed to load diagnostic data');
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadTimelineData = async (period: TimelinePeriod) => {
    try {
      const timeline = await diagnosticService.getDiagnosticTimeline(period);
      setTimelineData(timeline);
      _diagCache.timelineData = timeline;
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiagnosticData(true);
    setRefreshing(false);
  };

  const handleStartDiagnostic = () => {
    router.push('/diagnostic/retake');
  };

  const handleTopicPress = (topic: string, score: number) => {
    if (!diagnostic) return;
    const topicKey = topic.toLowerCase() as 'algebra' | 'geometry' | 'trigonometry';
    const topicScore = diagnostic.topicScores?.[topicKey] ?? null;
    router.push({
      pathname: '/diagnostic/topic-detail',
      params: {
        topic,
        score: score.toString(),
        topicScoreJson: topicScore ? JSON.stringify(topicScore) : '',
      }
    });
  };

  // "VIEW DETAILS →" cycles through the three topic detail screens instead of
  // navigating to a non-existent all-topics route.
  const handleViewAllTopics = () => {
    if (!diagnostic) return;
    // Navigate to the weakest topic detail as the most useful entry point
    const scores = [
      { topic: 'Algebra',      score: diagnostic.algebraScore },
      { topic: 'Geometry',     score: diagnostic.geometryScore },
      { topic: 'Trigonometry', score: diagnostic.trigonometryScore },
    ];
    const weakest = scores.reduce((a, b) => (a.score <= b.score ? a : b));
    handleTopicPress(weakest.topic, weakest.score);
  };

  const getTopicSubtitle = (topic: string, score: number): string => {
    if (score >= 80) return 'Expert Level';
    if (score >= 60) return 'Proficient';
    if (score >= 40) return 'Developing';
    return 'Needs Practice';
  };

  const getRecommendation = (): string => {
    if (!diagnostic) return '';
    
    const { algebraScore, geometryScore, trigonometryScore } = diagnostic;
    const highest = Math.max(algebraScore, geometryScore, trigonometryScore);
    const lowest = Math.min(algebraScore, geometryScore, trigonometryScore);
    
    let weakTopic = '';
    if (algebraScore === lowest) weakTopic = 'Algebra';
    else if (geometryScore === lowest) weakTopic = 'Geometry';
    else weakTopic = 'Trigonometry';
    
    if (highest - lowest > 20) {
      return `Focus on ${weakTopic} to boost your overall mastery. You could improve by ${Math.round((highest - lowest) / 2)}% with targeted practice.`;
    }
    
    return 'Great balanced progress! Keep practicing to maintain your skills across all topics.';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DX.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DX.secondary} />
          <Text style={[styles.loadingText, { color: DX.textLight }]}>Loading diagnostic data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diagnostic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DX.bg }]}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <MaterialIcons name="analytics" size={80} color={DX.secondary} />
          <Text style={[styles.emptyTitle, { color: DX.text }]}>Start Your Journey</Text>
          <Text style={[styles.emptySubtitle, { color: DX.textLight }]}>
            Complete a diagnostic test to unlock personalized learning paths and track your progress
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: primaryColor || '#4b41e1' }]}
            onPress={handleStartDiagnostic}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>START DIAGNOSTIC</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView
        style={{ backgroundColor: DX.bg }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: DX.text }]}>Knowledge Map</Text>
            <Text style={[styles.subtitle, { color: DX.textLight }]}>
              Visualizing your path to mathematical excellence
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: DX.badgeBg }]}>
            <Text style={[styles.badgeText, { color: DX.badgeText }]}>
              Overall {diagnostic.overallScore}%
            </Text>
          </View>
        </View>

        {/* Topic Mastery Section */}
        <View style={[styles.section, { backgroundColor: DX.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: DX.text }]}>Topic Mastery</Text>
            <TouchableOpacity onPress={handleViewAllTopics}>
              <Text style={[styles.viewDetails, { color: DX.secondary }]}>VIEW DETAILS →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.masteryRingsContainer}>
            <MasteryRing
              percentage={diagnostic.algebraScore}
              topic="Algebra"
              subtitle={getTopicSubtitle('Algebra', diagnostic.algebraScore)}
              color="#2563eb"
              size={85}
              strokeWidth={7}
              onPress={() => handleTopicPress('Algebra', diagnostic.algebraScore)}
            />
            <MasteryRing
              percentage={diagnostic.geometryScore}
              topic="Geometry"
              subtitle={getTopicSubtitle('Geometry', diagnostic.geometryScore)}
              color="#00a472"
              size={85}
              strokeWidth={7}
              onPress={() => handleTopicPress('Geometry', diagnostic.geometryScore)}
            />
            <MasteryRing
              percentage={diagnostic.trigonometryScore}
              topic="Trigonometry"
              subtitle={getTopicSubtitle('Trigonometry', diagnostic.trigonometryScore)}
              color="#f59e0b"
              size={85}
              strokeWidth={7}
              onPress={() => handleTopicPress('Trigonometry', diagnostic.trigonometryScore)}
            />
          </View>

          {/* AI Recommendation */}
          <View style={[styles.recommendationCard, { backgroundColor: DX.recBg, borderLeftColor: DX.recBorder }]}>
            <MaterialIcons name="psychology" size={24} color={DX.secondary} />
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: DX.text }]}>AI Recommendation</Text>
              <Text style={[styles.recommendationText, { color: DX.textBody }]}>
                {getRecommendation()}
              </Text>
            </View>
          </View>
        </View>

        {/* Mastery Timeline Section */}
        <View style={[styles.section, { backgroundColor: DX.card }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: DX.text }]}>Mastery Timeline</Text>
              <Text style={[styles.sectionSubtitle, { color: DX.textLight }]}>
                Tracking your growth over time
              </Text>
            </View>
          </View>

          {/* Period Selector */}
          <View style={[styles.periodSelector, { backgroundColor: DX.periodBg }]}>
            {(['week', 'month', '6months'] as TimelinePeriod[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && [styles.periodButtonActive, { backgroundColor: DX.periodActiveBg }]
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    { color: DX.periodText },
                    selectedPeriod === period && [styles.periodButtonTextActive, { color: DX.periodActiveText }]
                  ]}
                >
                  {period === 'week' ? 'W' : period === 'month' ? 'M' : '6M'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TimelineChart data={timelineData} />
        </View>

        {/* Weak Areas Section */}
        <View style={[styles.section, { backgroundColor: DX.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.weakAreasHeader}>
              <Ionicons name="warning-outline" size={20} color={Colors.error} />
              <Text style={[styles.sectionTitle, { color: DX.text }]}>Weak Areas</Text>
            </View>
          </View>

          {diagnostic.weakTopics && diagnostic.weakTopics.length > 0 ? (
            Array.from(
              new Map(diagnostic.weakTopics.map(w => [w.topic, w])).values()
            ).slice(0, 3).map((weak, index) => (
              <WeakAreaCard
                key={index}
                subtopic={weak.topic}
                masteryPercentage={weak.score}
                onPress={() =>
                  router.push({
                    pathname: '/practice/topic',
                    params: {
                      topicName: weak.topic,
                      mastery: weak.score.toString(),
                      subtopicFilter: weak.subtopic ?? '',
                    },
                  })
                }
              />
            ))
          ) : (
            <View style={[
              styles.noWeakAreasCard,
              {
                backgroundColor: darkMode ? 'rgba(0, 164, 114, 0.12)' : '#ecfdf5',
                borderColor: darkMode ? 'rgba(0, 164, 114, 0.3)' : '#a7f3d0'
              }
            ]}>
              <Ionicons name="checkmark-circle-outline" size={36} color="#00a472" style={{ marginBottom: 8 }} />
              <Text style={styles.noWeakAreasTitle}>Great work!</Text>
              <Text style={[styles.noWeakAreasSubtitle, { color: darkMode ? '#34d399' : '#047857' }]}>
                No major weak areas identified right now.
              </Text>
            </View>
          )}

          {/* CTA Card (Ready for a challenge?) */}
          <LinearGradient
            colors={gradientColors || ['#4b41e1', '#3d33d0', '#2b1fb8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <View style={styles.ctaIconBadge}>
              <Ionicons name="school-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.ctaTitle}>Ready for a challenge?</Text>
            <Text style={styles.ctaSubtitle}>
              Retake the diagnostic to update your personalised learning path
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: '#ffffff' }]}
              onPress={handleStartDiagnostic}
              activeOpacity={0.8}
            >
              <Text style={[styles.ctaButtonText, { color: primaryColor || '#111827' }]}>RETAKE DIAGNOSTIC</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* View Diagnostic History Button */}
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: DX.card, borderColor: DX.border }]}
          onPress={() => router.push('/diagnostic/history')}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={20} color={DX.text} />
          <Text style={[styles.historyButtonText, { color: DX.text }]}>View Diagnostic History</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    lineHeight: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSecondaryFixedVariant,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  weakAreasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  masteryRingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 4,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 16,
  },
  recommendationContent: {
    flex: 1,
    gap: 4,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  noWeakAreasCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noWeakAreasTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00a472',
    marginBottom: 4,
  },
  noWeakAreasSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  ctaCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historyButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  historyButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 4,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  periodButtonTextActive: {
    color: Colors.primary,
  },
});
