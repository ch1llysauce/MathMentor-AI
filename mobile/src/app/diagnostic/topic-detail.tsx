import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MasteryRing } from '@/components/MasteryRing';
import { TopicScore } from '@/types/diagnostic';
import { useTheme } from '@/context/ThemeContext';

// Map topic name → subtopics defined in the curriculum
const TOPIC_SUBTOPICS: Record<string, string[]> = {
  Algebra:      ['Fractions', 'Linear Equations', 'Factoring'],
  Geometry:     ['Angles', 'Triangles', 'Area', 'Basic Circles'],
  Trigonometry: ['SOH-CAH-TOA', 'Basic Trig Ratios', 'Simple Applications'],
};

function getScoreColor(score: number) {
  if (score >= 80) return '#00a472';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Proficient';
  if (score >= 40) return 'Developing';
  return 'Needs Practice';
}

// Convert subtopic name → the key format used in subtopicScores
// e.g. "Linear Equations" → "linear_equations"  |  "SOH-CAH-TOA" → "soh-cah-toa"
function toSubtopicKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}

export default function TopicDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode } = useTheme();

  const TD = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#fff',
    border: darkMode ? '#2e2e2e' : '#e2e8f0',
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    primary: darkMode ? '#a5b4fc' : Colors.primary,
    card: darkMode ? '#1a1a1a' : '#fff',
    surface: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    recBg: darkMode ? '#2d2a00' : '#fffbeb',
    recBorder: '#f59e0b',
    recText: darkMode ? '#fcd34d' : Colors.text,
    secBtn: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    secBtnText: darkMode ? '#a5b4fc' : Colors.primary,
  };

  const topic     = (params.topic as string) || 'Algebra';
  const score     = parseInt(params.score as string) || 0;

  // topicScoresJson is passed as a JSON string of the TopicScore object
  let topicScore: TopicScore | null = null;
  try {
    if (params.topicScoreJson) {
      topicScore = JSON.parse(params.topicScoreJson as string) as TopicScore;
    }
  } catch { /* no-op */ }

  const subtopicNames = TOPIC_SUBTOPICS[topic] ?? [];

  // Build subtopic rows from real data when available, otherwise show score only
  const subtopics = subtopicNames.map(name => {
    const key = toSubtopicKey(name);
    const stScore = topicScore?.subtopicScores?.[key] ?? null;
    return { name, score: stScore };
  });

  const totalQuestions  = topicScore?.questionsAnswered ?? 0;
  const totalCorrect    = topicScore?.correctAnswers    ?? 0;
  const totalIncorrect  = totalQuestions - totalCorrect;

  const recommendation =
    score < 50
      ? `Your ${topic} skills need work. Focus on the red subtopics first with targeted practice.`
      : score < 80
      ? `Good foundation in ${topic}! Push to master the remaining subtopics.`
      : `Excellent ${topic} mastery! Challenge yourself with harder problems.`;

  const handlePractice = () => {
    router.push({
      pathname: '/practice/topic',
      params: { topicName: topic, mastery: score.toString() },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: TD.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={TD.header} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: TD.header, borderBottomColor: TD.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={TD.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: TD.text }]}>{topic}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Overall card */}
        <View style={[styles.overallCard, { backgroundColor: TD.card }]}>
          <MasteryRing percentage={score} size={120} strokeWidth={10} topic={topic} subtitle={getScoreLabel(score)} />
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: TD.surface }]}>
              <Text style={[styles.statValue, { color: TD.primary }]}>{totalQuestions}</Text>
              <Text style={[styles.statLabel, { color: TD.textLight }]}>Questions</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: TD.surface }]}>
              <Text style={[styles.statValue, { color: '#00a472' }]}>{totalCorrect}</Text>
              <Text style={[styles.statLabel, { color: TD.textLight }]}>Correct</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: TD.surface }]}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{totalIncorrect}</Text>
              <Text style={[styles.statLabel, { color: TD.textLight }]}>Incorrect</Text>
            </View>
          </View>
        </View>

        {/* Subtopics breakdown */}
        <Text style={[styles.sectionTitle, { color: TD.text }]}>Subtopics Breakdown</Text>
        {subtopics.map((st, i) => (
          <View key={i} style={[styles.subtopicCard, { backgroundColor: TD.card }]}>
            <View style={styles.subtopicHeader}>
              <Text style={[styles.subtopicName, { color: TD.text }]}>{st.name}</Text>
              {st.score !== null ? (
                <Text style={[styles.subtopicScore, { color: getScoreColor(st.score) }]}>{st.score}%</Text>
              ) : (
                <Text style={[styles.subtopicNoData, { color: TD.textLight }]}>Not tested</Text>
              )}
            </View>
            {st.score !== null ? (
              <View style={[styles.progressBarContainer, { backgroundColor: TD.surface }]}>
                <View style={[styles.progressBar, { width: `${st.score}%`, backgroundColor: getScoreColor(st.score) }]} />
              </View>
            ) : (
              <View style={[styles.progressBarContainer, { backgroundColor: TD.surface, opacity: 0.3 }]}>
                <View style={[styles.progressBar, { width: '0%', backgroundColor: TD.textLight }]} />
              </View>
            )}
            {st.score !== null && (
              <Text style={[styles.subtopicLabel, { color: TD.textLight }]}>{getScoreLabel(st.score)}</Text>
            )}
          </View>
        ))}

        {/* Recommendation */}
        <Text style={[styles.sectionTitle, { color: TD.text }]}>Recommendation</Text>
        <View style={[styles.recCard, { backgroundColor: TD.recBg, borderLeftColor: TD.recBorder }]}>
          <Ionicons name="bulb" size={22} color="#f59e0b" />
          <Text style={[styles.recText, { color: TD.recText }]}>{recommendation}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: TD.primary }]} onPress={handlePractice} activeOpacity={0.9}>
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Practice {topic}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: TD.secBtn }]} onPress={() => router.back()} activeOpacity={0.9}>
            <Text style={[styles.secondaryButtonText, { color: TD.secBtnText }]}>Back to Knowledge Map</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  overallCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 24,
    alignItems: 'center', gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  statBox: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.surfaceContainer,
    borderRadius: 12, paddingVertical: 12,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  statLabel: { fontSize: 12, color: Colors.textLight },

  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 12 },

  subtopicCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  subtopicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtopicName: { fontSize: 15, fontWeight: '600', color: Colors.text, flex: 1 },
  subtopicScore: { fontSize: 17, fontWeight: '700' },
  subtopicNoData: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic' },
  subtopicLabel: { fontSize: 12, color: Colors.textLight },
  progressBarContainer: {
    height: 7, backgroundColor: Colors.surfaceContainer, borderRadius: 4, overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 4 },

  recCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fffbeb', borderLeftWidth: 4, borderLeftColor: '#f59e0b',
    borderRadius: 12, padding: 16, marginBottom: 24,
  },
  recText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 22 },

  actions: { gap: 12, marginBottom: 8 },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryButton: {
    backgroundColor: Colors.surfaceContainer, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
