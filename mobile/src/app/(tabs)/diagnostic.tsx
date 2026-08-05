import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MasteryRing } from '@/components/MasteryRing';
import { WeakAreaCard } from '@/components/WeakAreaCard';
import { TimelineChart } from '@/components/TimelineChart';
import diagnosticService from '@/services/diagnosticService';
import { DiagnosticResult, WeakTopic } from '@/types/diagnostic';

type TimelinePeriod = 'week' | 'month' | '6months';

export default function DiagnosticScreen() {
  const router = useRouter();
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimelinePeriod>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDiagnosticData();
  }, []);

  useEffect(() => {
    if (diagnostic) {
      loadTimelineData(selectedPeriod);
    }
  }, [selectedPeriod]);

  const loadDiagnosticData = async () => {
    try {
      setLoading(true);
      const response = await diagnosticService.getLatestDiagnostic();
      setDiagnostic(response.data.diagnostic);
      await loadTimelineData(selectedPeriod);
    } catch (error: any) {
      console.error('Error loading diagnostic:', error);
      if (error.response?.status === 404) {
        // No diagnostic completed yet
        setDiagnostic(null);
      } else {
        Alert.alert('Error', 'Failed to load diagnostic data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTimelineData = async (period: TimelinePeriod) => {
    try {
      const timeline = await diagnosticService.getDiagnosticTimeline(period);
      setTimelineData(timeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiagnosticData();
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading diagnostic data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diagnostic) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <MaterialIcons name="analytics" size={80} color={Colors.secondary} />
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptySubtitle}>
            Complete a diagnostic test to unlock personalized learning paths and track your progress
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartDiagnostic}
          >
            <Text style={styles.startButtonText}>START DIAGNOSTIC</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Knowledge Map</Text>
            <Text style={styles.subtitle}>
              Visualizing your path to mathematical excellence
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Overall {diagnostic.overallScore}%
            </Text>
          </View>
        </View>

        {/* Topic Mastery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Topic Mastery</Text>
            <TouchableOpacity onPress={handleViewAllTopics}>
              <Text style={styles.viewDetails}>VIEW DETAILS →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.masteryRings}
          >
            <MasteryRing
              percentage={diagnostic.algebraScore}
              topic="Algebra"
              subtitle={getTopicSubtitle('Algebra', diagnostic.algebraScore)}
              onPress={() => handleTopicPress('Algebra', diagnostic.algebraScore)}
            />
            <MasteryRing
              percentage={diagnostic.geometryScore}
              topic="Geometry"
              subtitle={getTopicSubtitle('Geometry', diagnostic.geometryScore)}
              onPress={() => handleTopicPress('Geometry', diagnostic.geometryScore)}
            />
            <MasteryRing
              percentage={diagnostic.trigonometryScore}
              topic="Trigonometry"
              subtitle={getTopicSubtitle('Trigonometry', diagnostic.trigonometryScore)}
              onPress={() => handleTopicPress('Trigonometry', diagnostic.trigonometryScore)}
            />
          </ScrollView>

          {/* AI Recommendation */}
          <View style={styles.recommendationCard}>
            <MaterialIcons name="psychology" size={24} color={Colors.secondary} />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>AI Recommendation</Text>
              <Text style={styles.recommendationText}>
                {getRecommendation()}
              </Text>
            </View>
          </View>
        </View>

        {/* Weak Areas Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.weakAreasHeader}>
              <MaterialIcons name="warning" size={20} color={Colors.error} />
              <Text style={styles.sectionTitle}>Weak Areas</Text>
            </View>
          </View>

          {diagnostic.weakTopics && diagnostic.weakTopics.length > 0 ? (
            diagnostic.weakTopics.slice(0, 5).map((weak, index) => (
              <WeakAreaCard
                key={index}
                subtopic={weak.subtopic || weak.topic}
                masteryPercentage={weak.score}
                onPress={() =>
                  router.push({
                    pathname: '/practice/topic',
                    params: {
                      topicName: weak.topic,
                      mastery: weak.score.toString(),
                    },
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.noWeakAreas}>
              Great work! No weak areas identified.
            </Text>
          )}

          {/* CTA Card */}
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Ready for a challenge?</Text>
            <Text style={styles.ctaSubtitle}>
              Retake the diagnostic to update your personalized learning path
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleStartDiagnostic}
            >
              <Text style={styles.ctaButtonText}>RETAKE DIAGNOSTIC</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mastery Timeline Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Mastery Timeline</Text>
              <Text style={styles.sectionSubtitle}>
                Tracking your growth over time
              </Text>
            </View>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['week', 'month', '6months'] as TimelinePeriod[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive
                  ]}
                >
                  {period === 'week' ? 'W' : period === 'month' ? 'M' : '6M'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TimelineChart data={timelineData} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  masteryRings: {
    gap: 32,
    paddingHorizontal: 8,
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
  noWeakAreas: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    padding: 24,
  },
  ctaCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    gap: 12,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
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
