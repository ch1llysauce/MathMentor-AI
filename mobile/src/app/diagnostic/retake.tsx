import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import api from '@/services/api';
import diagnosticService from '@/services/diagnosticService';
import { TopicScores } from '@/types/diagnostic';

// ── Types ──────────────────────────────────────────────────────────────────
interface DiagQuestion {
  _id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  question: string;
  questionType: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
}

type Screen = 'intro' | 'test' | 'submitting';

// ── Helpers ────────────────────────────────────────────────────────────────
function buildTopicScores(
  questions: DiagQuestion[],
  answers: Record<number, string>
): TopicScores {
  const buckets: Record<string, { correct: number; total: number; subtopics: Record<string, { c: number; t: number }> }> = {};

  questions.forEach((q, i) => {
    const topicKey = q.topic.toLowerCase();
    if (!buckets[topicKey]) buckets[topicKey] = { correct: 0, total: 0, subtopics: {} };

    const stKey = q.subtopic.toLowerCase().replace(/\s+/g, '_');
    if (!buckets[topicKey].subtopics[stKey])
      buckets[topicKey].subtopics[stKey] = { c: 0, t: 0 };

    const isCorrect =
      (answers[i] ?? '').trim().toLowerCase() ===
      q.correctAnswer.trim().toLowerCase();

    buckets[topicKey].total += 1;
    buckets[topicKey].subtopics[stKey].t += 1;
    if (isCorrect) {
      buckets[topicKey].correct += 1;
      buckets[topicKey].subtopics[stKey].c += 1;
    }
  });

  const makeScore = (key: string) => {
    const b = buckets[key] ?? { correct: 0, total: 0, subtopics: {} };
    const subtopicScores: Record<string, number> = {};
    Object.entries(b.subtopics).forEach(([st, v]) => {
      subtopicScores[st] = v.t > 0 ? Math.round((v.c / v.t) * 100) : 0;
    });
    return {
      score: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
      questionsAnswered: b.total,
      correctAnswers: b.correct,
      subtopicScores,
    };
  };

  return {
    algebra: makeScore('algebra'),
    geometry: makeScore('geometry'),
    trigonometry: makeScore('trigonometry'),
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RetakeDiagnosticScreen() {
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>('intro');
  const [questions, setQuestions] = useState<DiagQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIndex] ?? null;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  // ── Fetch questions ──────────────────────────────────────────────────────
  const startTest = async () => {
    try {
      setLoadingQuestions(true);
      const response = await api.get('/questions/diagnostic');
      const qs: DiagQuestion[] = response.data.data.questions;
      if (qs.length === 0) {
        Alert.alert('No Questions', 'No diagnostic questions are available. Please contact support.');
        return;
      }
      setQuestions(qs);
      startTimeRef.current = Date.now();
      setScreen('test');
    } catch (err: any) {
      Alert.alert('Error', 'Could not load diagnostic questions. Please check your connection.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ── Answer flow ──────────────────────────────────────────────────────────
  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const correct =
      selectedAnswer.trim().toLowerCase() ===
      currentQuestion.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowExplanation(true);
    setAnswers(prev => ({ ...prev, [currentIndex]: selectedAnswer }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      await submitDiagnostic();
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const submitDiagnostic = async () => {
    setScreen('submitting');
    try {
      const topicScores = buildTopicScores(questions, answers);
      const totalCorrect = Object.values(answers).filter((ans, i) =>
        ans.trim().toLowerCase() === questions[i]?.correctAnswer.trim().toLowerCase()
      ).length;
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      await diagnosticService.submitDiagnosticResults({
        topicScores,
        totalQuestions: questions.length,
        correctAnswers: totalCorrect,
        timeSpent,
      });

      Alert.alert(
        'Diagnostic Complete! 🎉',
        'Your knowledge map has been updated. Check your results in the Diagnostic tab.',
        [{ text: 'View Results', onPress: () => router.replace('/(tabs)/diagnostic') }]
      );
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save your results. Please try again.');
      setScreen('test');
    }
  };

  // ── Render: Submitting ───────────────────────────────────────────────────
  if (screen === 'submitting') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.submittingText}>Analysing your results…</Text>
        <Text style={styles.submittingSubtext}>Building your personalised learning path</Text>
      </View>
    );
  }

  // ── Render: Test ─────────────────────────────────────────────────────────
  if (screen === 'test' && currentQuestion) {
    const diffColor =
      currentQuestion.difficulty === 'Easy' ? '#00a472' :
      currentQuestion.difficulty === 'Hard' ? '#ef4444' : '#f59e0b';

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() =>
            Alert.alert('Quit Test?', 'Progress will be lost.', [
              { text: 'Continue Test', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: () => router.back() },
            ])
          }>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerProgress}>
              {currentIndex + 1} / {questions.length}
            </Text>
            <Text style={styles.headerTopic}>{currentQuestion.topic}</Text>
          </View>

          <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>
              {currentQuestion.difficulty}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Subtopic chip */}
          <View style={styles.subtopicChip}>
            <Text style={styles.subtopicChipText}>{currentQuestion.subtopic}</Text>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          {/* Multiple choice */}
          {currentQuestion.questionType === 'Multiple Choice' && currentQuestion.choices.length > 0 && (
            <View style={styles.choicesContainer}>
              {currentQuestion.choices.map((choice, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedAnswer === choice;
                const isCorrectChoice = choice.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
                let cardStyle = styles.choiceCard;
                let bubbleStyle = styles.choiceBubble;
                let bubbleTextStyle = styles.choiceBubbleText;
                if (showExplanation) {
                  if (isSelected && isCorrect) { cardStyle = { ...cardStyle, ...styles.choiceCorrect }; bubbleStyle = { ...bubbleStyle, ...styles.bubbleCorrect }; bubbleTextStyle = { ...bubbleTextStyle, color: '#fff' }; }
                  else if (isSelected && !isCorrect) { cardStyle = { ...cardStyle, ...styles.choiceWrong }; bubbleStyle = { ...bubbleStyle, ...styles.bubbleWrong }; bubbleTextStyle = { ...bubbleTextStyle, color: '#fff' }; }
                  else if (!isSelected && isCorrectChoice) { cardStyle = { ...cardStyle, ...styles.choiceCorrect }; }
                } else if (isSelected) {
                  cardStyle = { ...cardStyle, ...styles.choiceSelected };
                  bubbleStyle = { ...bubbleStyle, ...styles.bubbleSelected };
                  bubbleTextStyle = { ...bubbleTextStyle, color: '#fff' };
                }
                return (
                  <TouchableOpacity key={idx} style={cardStyle}
                    onPress={() => handleSelectAnswer(choice)} disabled={showExplanation} activeOpacity={0.7}>
                    <View style={bubbleStyle}><Text style={bubbleTextStyle}>{letter}</Text></View>
                    <Text style={styles.choiceText}>{choice}</Text>
                    {showExplanation && isSelected && isCorrect && <Ionicons name="checkmark-circle" size={22} color="#00a472" />}
                    {showExplanation && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color="#ef4444" />}
                    {showExplanation && !isSelected && isCorrectChoice && <Ionicons name="checkmark-circle" size={22} color="#00a472" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Hint */}
          {!showExplanation && currentQuestion.hints?.length > 0 && (
            <View style={styles.hintSection}>
              {!showHint ? (
                <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint(true)}>
                  <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
                  <Text style={styles.hintButtonText}>Show Hint</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.hintCard}>
                  <Ionicons name="bulb" size={18} color="#f59e0b" />
                  <Text style={styles.hintText}>{currentQuestion.hints[0]}</Text>
                </View>
              )}
            </View>
          )}

          {/* Explanation */}
          {showExplanation && (
            <View style={[styles.explanationCard,
              { borderLeftColor: isCorrect ? '#00a472' : '#ef4444' }]}>
              <Text style={[styles.explanationResult,
                { color: isCorrect ? '#00a472' : '#ef4444' }]}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              {!isCorrect && (
                <Text style={styles.correctAnswerText}>
                  Correct answer: {currentQuestion.correctAnswer}
                </Text>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {!showExplanation ? (
            <TouchableOpacity
              style={[styles.footerButton, !selectedAnswer && styles.footerButtonDisabled]}
              onPress={handleConfirmAnswer} disabled={!selectedAnswer} activeOpacity={0.9}>
              <Text style={styles.footerButtonText}>Confirm Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.footerButton, styles.footerButtonNext]}
              onPress={handleNext} activeOpacity={0.9}>
              <Text style={styles.footerButtonText}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={{ height: 50 }} />
        </View>
      </View>
      
    );
  }

  // ── Render: Intro ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostic Test</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.infoCard}>
          <Ionicons name="analytics" size={52} color={Colors.secondary} />
          <Text style={styles.infoTitle}>Update Your Knowledge Map</Text>
          <Text style={styles.infoText}>
            15 questions across Algebra, Geometry, and Trigonometry. Takes around 15–20 minutes.
            Your personalised learning path will be updated when you finish.
          </Text>
        </View>

        {/* What to expect */}
        <View style={styles.expectSection}>
          <Text style={styles.expectTitle}>What to expect</Text>
          {[
            { icon: 'help-circle', color: '#4b41e1', title: '15 questions', sub: 'Balanced across all three topics' },
            { icon: 'bulb', color: '#f59e0b', title: 'Hints available', sub: 'One hint per question if you need it' },
            { icon: 'stats-chart', color: '#00a472', title: 'Instant results', sub: 'Your knowledge map updates immediately' },
          ].map((item, i) => (
            <View key={i} style={styles.expectRow}>
              <View style={[styles.expectIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.expectItemTitle}>{item.title}</Text>
                <Text style={styles.expectItemSub}>{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for best results</Text>
          <Text style={styles.tipsText}>
            {'• Find a quiet spot with no distractions\n• Have paper handy for calculations\n• Answer honestly — the path is built around your results'}
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startTest}
          disabled={loadingQuestions} activeOpacity={0.9}>
          {loadingQuestions
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.startButtonText}>Start Diagnostic</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#f7f9fb' },
  submittingText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  submittingSubtext: { fontSize: 14, color: Colors.textLight },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  headerCenter: { alignItems: 'center' },
  headerProgress: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  headerTopic: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  diffText: { fontSize: 12, fontWeight: '600' },

  progressTrack: { height: 4, backgroundColor: '#e2e8f0' },
  progressFill: { height: 4, backgroundColor: Colors.secondary, borderRadius: 2 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },

  subtopicChip: {
    alignSelf: 'flex-start', backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 16,
  },
  subtopicChipText: { fontSize: 12, fontWeight: '600', color: Colors.secondary },

  questionCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  questionText: { fontSize: 17, color: Colors.text, lineHeight: 26 },

  choicesContainer: { gap: 10, marginBottom: 16 },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, borderWidth: 2, borderColor: '#e2e8f0',
  },
  choiceSelected: { borderColor: '#4b41e1', backgroundColor: '#f5f4ff' },
  choiceCorrect: { borderColor: '#00a472', backgroundColor: '#f0fdf4' },
  choiceWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  choiceBubble: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#f2f4f6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  bubbleSelected: { backgroundColor: '#4b41e1' },
  bubbleCorrect: { backgroundColor: '#00a472' },
  bubbleWrong: { backgroundColor: '#ef4444' },
  choiceBubbleText: { fontSize: 14, fontWeight: '700', color: Colors.textLight },
  choiceText: { flex: 1, fontSize: 15, color: Colors.text },

  hintSection: { marginBottom: 16 },
  hintButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fef3c7', paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#fcd34d',
  },
  hintButtonText: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  hintCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#fef3c7', borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: '#f59e0b',
  },
  hintText: { flex: 1, fontSize: 14, color: '#78350f', lineHeight: 20 },

  explanationCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderLeftWidth: 4, marginBottom: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  explanationResult: { fontSize: 18, fontWeight: '700' },
  explanationText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  correctAnswerText: { fontSize: 13, color: '#00a472', fontWeight: '600' },

  footer: {
    padding: 20, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  footerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
  },
  footerButtonDisabled: { opacity: 0.45 },
  footerButtonNext: { backgroundColor: '#00a472' },
  footerButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Intro styles
  infoCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center',
    marginBottom: 24, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  infoTitle: { fontSize: 22, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  infoText: { fontSize: 15, color: Colors.textLight, textAlign: 'center', lineHeight: 22 },

  expectSection: { marginBottom: 20 },
  expectTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 14 },
  expectRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  expectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expectItemTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  expectItemSub: { fontSize: 13, color: Colors.textLight, marginTop: 2 },

  tipsCard: {
    backgroundColor: '#fffbeb', borderLeftWidth: 4, borderLeftColor: '#f59e0b',
    borderRadius: 12, padding: 16, marginBottom: 24,
  },
  tipsTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  tipsText: { fontSize: 14, color: Colors.text, lineHeight: 22 },

  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  startButtonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
