import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import diagnosticService from '@/services/diagnosticService';
import { useTheme } from '@/context/ThemeContext';
import MessageRenderer from '@/components/MessageRenderer';
import MasteryRing from '@/components/MasteryRing';

export default function DiagnosticDetailScreen() {
  const router = useRouter();
  const { id, number } = useLocalSearchParams<{ id: string; number?: string }>();
  const { darkMode, primaryColor } = useTheme();

  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [diagNumber, setDiagNumber] = useState<number | null>(number ? parseInt(number, 10) : null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadDiagnosticDetail(id);
    }
  }, [id]);

  const loadDiagnosticDetail = async (diagId: string) => {
    try {
      setLoading(true);
      const res: any = await diagnosticService.getDiagnosticById(diagId);
      const doc = res.data?.diagnostic ?? res.diagnostic ?? res.data ?? null;
      setDiagnostic(doc);

      try {
        const histRes: any = await diagnosticService.getDiagnosticHistory();
        const docs = histRes.data?.diagnostics ?? histRes.diagnostics ?? [];
        if (docs.length > 0) {
          const targetId = doc?._id || doc?.id || diagId;
          const idx = docs.findIndex((d: any) => (d._id || d.id) === targetId);
          if (idx !== -1) {
            setDiagNumber(docs.length - idx);
          } else if (!number) {
            setDiagNumber(docs.length);
          }
        } else if (!number) {
          setDiagNumber(1);
        }
      } catch (e) {
        console.log('Error fetching history count for diagnostic number:', e);
      }
    } catch (error) {
      console.error('Error fetching diagnostic detail:', error);
      setDiagnostic(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 100) return primaryColor || '#4b41e1';
    if (score >= 70) return '#00a472';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return '#00a472';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const colors = {
    bg: darkMode ? '#091426' : '#f7f9fb',
    card: darkMode ? '#1a2333' : '#ffffff',
    text: darkMode ? '#ffffff' : '#091426',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#2d3748' : '#e2e8f0',
    primary: primaryColor || (darkMode ? '#a5b4fc' : '#4b41e1'),
    correctBg: darkMode ? '#052e16' : '#d1fae5',
    correctText: darkMode ? '#4ade80' : '#00a472',
    correctBorder: darkMode ? '#166534' : '#00a472',
    incorrectBg: darkMode ? '#2d0a0a' : '#fee2e2',
    incorrectText: darkMode ? '#f87171' : '#ef4444',
    incorrectBorder: darkMode ? '#7f1d1d' : '#ef4444',
    chipBg: primaryColor ? `${primaryColor}20` : (darkMode ? 'rgba(75, 65, 225, 0.2)' : 'rgba(75, 65, 225, 0.1)'),
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading diagnostic details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diagnostic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Diagnostic Details</Text>
        </View>
        <View style={styles.emptyBox}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Could not load diagnostic details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const overallScore = Math.round(diagnostic.overallScore ?? 0);
  const totalQuestions = diagnostic.totalQuestions ?? 0;
  const correctAnswers = diagnostic.correctAnswers ?? 0;
  const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);
  const timeSpent = diagnostic.timeSpent ?? 0;
  const dateStr = diagnostic.completedAt
    ? new Date(diagnostic.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown Date';

  const responses = diagnostic.questionResponses || [];

  const subjects = [
    { name: 'Algebra', score: diagnostic.topicScores?.algebra?.score ?? diagnostic.algebraScore ?? 0, color: '#3b82f6' },
    { name: 'Geometry', score: diagnostic.topicScores?.geometry?.score ?? diagnostic.geometryScore ?? 0, color: '#8b5cf6' },
    { name: 'Trigonometry', score: diagnostic.topicScores?.trigonometry?.score ?? diagnostic.trigonometryScore ?? 0, color: '#ef4444' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Diagnostic Summary</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>{dateStr}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ringRow}>
            <MasteryRing
              percentage={overallScore}
              topic="Overall"
              subtitle={overallScore >= 80 ? 'Mastered' : overallScore >= 50 ? 'Proficient' : 'Needs Practice'}
              color={getScoreColor(overallScore)}
              size={90}
              strokeWidth={8}
            />
            <View style={styles.summaryMeta}>
              {diagNumber ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons name="ribbon-outline" size={19} color={colors.primary} />
                  <Text style={{ fontSize: 17, fontWeight: '800', color: colors.primary, letterSpacing: -0.2 }}>
                    Diagnostic #{diagNumber}
                  </Text>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Time Spent: </Text>
                <Text style={[styles.metaVal, { color: colors.text }]}>{formatTime(timeSpent)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Completed: </Text>
                <Text style={[styles.metaVal, { color: colors.text }]}>{dateStr}</Text>
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.statVal, { color: colors.primary }]}>{totalQuestions}</Text>
              <Text style={[styles.statLbl, { color: colors.textMuted }]}>Total</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.correctBg, borderColor: colors.correctBorder }]}>
              <Text style={[styles.statVal, { color: colors.correctText }]}>{correctAnswers}</Text>
              <Text style={[styles.statLbl, { color: colors.correctText }]}>Correct</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.incorrectBg, borderColor: colors.incorrectBorder }]}>
              <Text style={[styles.statVal, { color: colors.incorrectText }]}>{incorrectAnswers}</Text>
              <Text style={[styles.statLbl, { color: colors.incorrectText }]}>Incorrect</Text>
            </View>
          </View>
        </View>

        {/* Topic Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Topic Mastery</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {subjects.map((sub, idx) => (
            <View key={sub.name} style={[styles.topicRow, idx < subjects.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.topicMeta}>
                <Text style={[styles.topicName, { color: colors.text }]}>{sub.name}</Text>
                <Text style={[styles.topicScore, { color: sub.color }]}>{sub.score}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${sub.score}%`, backgroundColor: sub.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Questions Review Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Questions Review</Text>
          {responses.length > 0 && (
            <Text style={[styles.sectionBadge, { color: colors.textMuted }]}>{responses.length} Questions</Text>
          )}
        </View>

        {responses.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 18, alignItems: 'center' }]}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.noReviewText, { color: colors.textMuted }]}>
              Detailed question review is available for diagnostic tests taken after this update.
            </Text>
          </View>
        ) : (
          responses.map((q: any, index: number) => {
            const isExpanded = expandedQuestion === index;
            const diffColor = getDifficultyColor(q.difficulty);

            return (
              <View
                key={index}
                style={[
                  styles.qCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: q.isCorrect ? colors.correctBorder : colors.incorrectBorder,
                  },
                ]}
              >
                {/* Q Card Header */}
                <TouchableOpacity
                  style={styles.qHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedQuestion(isExpanded ? null : index)}
                >
                  <View style={styles.qHeaderLeft}>
                    <View style={[styles.qBadge, { backgroundColor: q.isCorrect ? colors.correctBg : colors.incorrectBg }]}>
                      <Ionicons
                        name={q.isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={q.isCorrect ? colors.correctText : colors.incorrectText}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={[styles.qNum, { color: colors.text }]}>Question #{index + 1}</Text>
                        {q.topic && (
                          <Text style={[styles.qChip, { backgroundColor: colors.chipBg, color: colors.primary }]}>
                            {q.topic}
                          </Text>
                        )}
                        {q.difficulty && (
                          <Text style={[styles.qChip, { backgroundColor: diffColor + '18', color: diffColor }]}>
                            {q.difficulty}
                          </Text>
                        )}
                      </View>
                      {q.subtopic ? (
                        <Text style={[styles.subtopicText, { color: colors.textMuted }]}>{q.subtopic}</Text>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {/* Q Card Content */}
                {isExpanded && (
                  <View style={styles.qBody}>
                    <View style={styles.qTextContainer}>
                      <MessageRenderer content={q.questionText || ''} textColor={colors.text} fontSize={15} />
                    </View>

                    {/* Choices */}
                    {q.choices && q.choices.length > 0 && (
                      <View style={styles.choicesList}>
                        {q.choices.map((choice: string, cIdx: number) => {
                          const isUserChoice = choice.trim().toLowerCase() === (q.userAnswer || '').trim().toLowerCase();
                          const isCorrectChoice = choice.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();

                          let choiceBg = colors.card;
                          let choiceBorder = colors.border;
                          let choiceColor = colors.text;

                          if (isCorrectChoice) {
                            choiceBg = colors.correctBg;
                            choiceBorder = colors.correctBorder;
                            choiceColor = colors.correctText;
                          } else if (isUserChoice && !q.isCorrect) {
                            choiceBg = colors.incorrectBg;
                            choiceBorder = colors.incorrectBorder;
                            choiceColor = colors.incorrectText;
                          }

                          return (
                            <View
                              key={cIdx}
                              style={[
                                styles.choiceItem,
                                { backgroundColor: choiceBg, borderColor: choiceBorder },
                              ]}
                            >
                              <View style={styles.choiceLeft}>
                                <Text style={[styles.choiceLabel, { color: choiceColor }]}>
                                  {String.fromCharCode(65 + cIdx)}.
                                </Text>
                                <View style={{ flex: 1 }}>
                                  <MessageRenderer content={choice} textColor={choiceColor} fontSize={14} />
                                </View>
                              </View>
                              {isCorrectChoice && (
                                <Ionicons name="checkmark-circle" size={18} color={colors.correctText} />
                              )}
                              {isUserChoice && !q.isCorrect && (
                                <Ionicons name="close-circle" size={18} color={colors.incorrectText} />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Explanation */}
                    {q.explanation ? (
                      <View style={[styles.explCard, { backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}25` }]}>
                        <View style={styles.explHeader}>
                          <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                          <Text style={[styles.explTitle, { color: colors.primary }]}>Explanation</Text>
                        </View>
                        <MessageRenderer content={q.explanation} textColor={colors.text} fontSize={14} />
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryMeta: {
    flex: 1,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topicRow: {
    padding: 14,
    gap: 8,
  },
  topicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicName: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  barTrack: {
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  noReviewText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  qCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  qHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  qBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNum: {
    fontSize: 14,
    fontWeight: '700',
  },
  qChip: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  subtopicText: {
    fontSize: 12,
    marginTop: 2,
  },
  qBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    gap: 12,
    paddingTop: 12,
  },
  qTextContainer: {
    marginBottom: 4,
  },
  choicesList: {
    gap: 8,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  choiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  explCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  explHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
