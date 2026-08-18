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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import CustomAlertModal from '@/components/common/CustomAlertModal';
import api from '@/services/api';
import diagnosticService from '@/services/diagnosticService';
import { authService } from '@/services/authService';
import { TopicScores } from '@/types/diagnostic';
import { useTheme } from '@/context/ThemeContext';
import MessageRenderer from '@/components/MessageRenderer';
import ScientificCalculator from '@/components/ScientificCalculator';
import { useAuth } from '@/hooks/useAuth';

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

type Screen = 'intro' | 'test' | 'submitting' | 'result';

// ── Helpers ────────────────────────────────────────────────────────────────
// Map subtopic display names → exact camelCase keys matching the DiagnosticResult schema
const SUBTOPIC_DB_KEY: Record<string, string> = {
  // Algebra
  'linear equations': 'linearEquations',
  'fractions':        'fractions',
  'factoring':        'factoring',
  // Geometry
  'angles':           'angles',
  'triangles':        'triangles',
  'area':             'area',
  'basic circles':    'basicCircles',
  // Trigonometry
  'soh-cah-toa':      'sohCahToa',
  'basic trig ratios':'basicTrigRatios',
  'simple applications':'simpleApplications',
};

function buildTopicScores(
  questions: DiagQuestion[],
  answers: Record<number, string>
): TopicScores {
  const buckets: Record<string, { correct: number; total: number; subtopics: Record<string, { c: number; t: number }> }> = {};

  questions.forEach((q, i) => {
    const topicKey = q.topic.toLowerCase();
    if (!buckets[topicKey]) buckets[topicKey] = { correct: 0, total: 0, subtopics: {} };

    // Use the explicit camelCase key; fall back to lowercased name if not found
    const stKeyRaw = q.subtopic.toLowerCase();
    const stKey = SUBTOPIC_DB_KEY[stKeyRaw] ?? stKeyRaw;

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
  const { darkMode, primaryColor } = useTheme();
  const { updateUser } = useAuth();

  const RK = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#fff',
    border: darkMode ? '#2e2e2e' : '#e2e8f0',
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    primary: primaryColor || (darkMode ? '#a5b4fc' : Colors.primary),
    secondary: primaryColor || (darkMode ? '#a5b4fc' : Colors.secondary),
    card: darkMode ? '#1a1a1a' : '#fff',
    surface: darkMode ? '#2e2e2e' : '#f2f4f6',
    chipBg: primaryColor ? `${primaryColor}20` : (darkMode ? '#312e81' : Colors.secondary + '20'),
    chipText: primaryColor || (darkMode ? '#a5b4fc' : Colors.secondary),
    choiceCard: darkMode ? '#1a1a1a' : '#fff',
    choiceBorder: darkMode ? '#2e2e2e' : '#e2e8f0',
    choiceText: darkMode ? '#f0f0f0' : Colors.text,
    hintBg: darkMode ? '#2d2a00' : '#fef3c7',
    hintBorder: '#fcd34d',
    hintText: darkMode ? '#fcd34d' : '#92400e',
    hintBody: darkMode ? '#fbbf24' : '#78350f',
    explBg: darkMode ? '#1a1a1a' : '#fff',
    explText: darkMode ? '#f0f0f0' : Colors.text,
    tipsCard: darkMode ? '#2d2a00' : '#fffbeb',
    tipsBorder: '#f59e0b',
    tipsText: darkMode ? '#fcd34d' : Colors.text,
    footerBg: darkMode ? '#0a0a0a' : '#fff',
    infoCard: darkMode ? '#1a1a1a' : '#fff',
    expectIcon: darkMode ? '#242424' : undefined,
    // Correct / incorrect feedback — mirrors problems.tsx exactly
    correctBg:       darkMode ? '#052e16' : '#d1fae5',
    correctText:     darkMode ? '#4ade80' : '#00a472',
    correctBorder:   darkMode ? '#166534' : '#00a472',
    incorrectBg:     darkMode ? '#2d0a0a' : '#fee2e2',
    incorrectText:   darkMode ? '#f87171' : '#ef4444',
    incorrectBorder: darkMode ? '#7f1d1d' : '#ef4444',
    selectedBg:      primaryColor ? `${primaryColor}15` : (darkMode ? '#1e1b4b' : '#f5f4ff'),
    selectedBorder:  primaryColor || '#4b41e1',
    selectedText:    primaryColor || (darkMode ? '#a5b4fc' : '#4b41e1'),
  };

  const [screen, setScreen] = useState<Screen>('intro');
  const [resultData, setResultData] = useState<any>(null);
  const [questions, setQuestions] = useState<DiagQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };
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
        showAlert('No Questions', 'No diagnostic questions are available. Please contact support.', 'info');
        return;
      }
      setQuestions(qs);
      startTimeRef.current = Date.now();
      setScreen('test');
    } catch (err: any) {
      showAlert('Error', 'Could not load diagnostic questions. Please check your connection.');
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

      const response = await diagnosticService.submitDiagnosticResults({
        topicScores,
        totalQuestions: questions.length,
        correctAnswers: totalCorrect,
        timeSpent,
      });

      const resDiag = (response as any)?.data?.diagnosticResult || (response as any)?.data?.diagnostic || (response as any)?.data || response || {
        overallScore: Math.round((topicScores.algebra.score + topicScores.geometry.score + topicScores.trigonometry.score) / 3),
        algebraScore: topicScores.algebra.score,
        geometryScore: topicScores.geometry.score,
        trigonometryScore: topicScores.trigonometry.score,
      };

      setResultData(resDiag);

      // Refresh the stored user so diagnosticCompleted flips to true immediately
      try {
        const profileRes = await authService.getProfile();
        if (profileRes.success && profileRes.data?.user) {
          await updateUser({ diagnosticCompleted: true });
        }
      } catch {
        // Non-critical — dashboard will re-check on next focus
      }

      setScreen('result');
    } catch (err: any) {
      showAlert('Error', 'Failed to save your results. Please try again.');
      setScreen('test');
    }
  };

  // ── Render: Submitting ───────────────────────────────────────────────────
  if (screen === 'submitting') {
    return (
      <View style={[styles.centered, { backgroundColor: RK.bg }]}>
        <ActivityIndicator size="large" color={RK.secondary} />
        <Text style={[styles.submittingText, { color: RK.primary }]}>Analysing your results…</Text>
        <Text style={[styles.submittingSubtext, { color: RK.textLight }]}>Building your personalised learning path</Text>
      </View>
    );
  }

  // ── Render: Result ───────────────────────────────────────────────────────
  if (screen === 'result' && resultData) {
    const overallScore = Math.round(resultData.overallScore ?? 0);
    const subjects = [
      { name: 'Algebra', score: Math.round(resultData.algebraScore ?? 0) },
      { name: 'Geometry', score: Math.round(resultData.geometryScore ?? 0) },
      { name: 'Trigonometry', score: Math.round(resultData.trigonometryScore ?? 0) },
    ];
    const weakAreas = (resultData.weakTopics && resultData.weakTopics.length > 0)
      ? resultData.weakTopics
      : subjects.filter(s => s.score < 70).map(s => ({ topic: s.name, score: s.score }));

    const getBarColor = (s: number) => (s >= 70 ? '#00a472' : s >= 40 ? '#f59e0b' : '#ef4444');

    return (
      <View style={[styles.container, { backgroundColor: RK.bg }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={RK.header} />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: RK.header, borderBottomColor: RK.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/diagnostic')}>
            <Ionicons name="close" size={24} color={RK.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: RK.text }]}>Diagnostic Results</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
          {/* Top Header Card */}
          <View style={{ alignItems: 'center', marginVertical: 12, gap: 8 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: darkMode ? '#312e81' : '#f5f4ff',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: darkMode ? '#4338ca' : '#e0e7ff'
            }}>
              <Ionicons name="search" size={32} color={RK.primary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: RK.text }}>Diagnostic Complete</Text>
            <Text style={{ fontSize: 16, color: RK.textLight }}>
              Overall: <Text style={{ fontWeight: '800', color: RK.primary }}>{overallScore}%</Text>
            </Text>
          </View>

          {/* Subject Scores Card */}
          <View style={{
            backgroundColor: RK.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: RK.border,
            gap: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: RK.text }}>Subject Scores</Text>
            <View style={{ gap: 14 }}>
              {subjects.map(({ name, score }) => {
                const barColor = getBarColor(score);
                return (
                  <View key={name} style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: RK.text }}>{name}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: RK.textLight }}>{score}%</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: RK.surface, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: barColor, borderRadius: 4 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Areas to Improve Card */}
          {weakAreas.length > 0 && (
            <View style={{
              backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
              gap: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: darkMode ? '#f87171' : '#b91c1c' }}>
                  Areas to Improve
                </Text>
              </View>
              <View style={{ gap: 10 }}>
                {weakAreas.map((area: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: darkMode ? '#fca5a5' : '#991b1b' }}>
                      {area.topic}{area.subtopic ? ` — ${area.subtopic}` : ''}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: darkMode ? '#f87171' : '#dc2626' }}>
                      {area.score}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Back to Diagnosis Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: RK.card,
              borderWidth: 1,
              borderColor: RK.border,
              borderRadius: 16,
              paddingVertical: 16,
              marginTop: 8,
            }}
            onPress={() => router.replace('/(tabs)/diagnostic')}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color={RK.text} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: RK.text }}>Back to Diagnosis</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Render: Test ─────────────────────────────────────────────────────────
  if (screen === 'test' && currentQuestion) {
    const diffColor =
      currentQuestion.difficulty === 'Easy' ? '#00a472' :
      currentQuestion.difficulty === 'Hard' ? '#ef4444' : '#f59e0b';

    return (
      <View style={[styles.container, { backgroundColor: RK.bg }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={RK.header} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: RK.header, borderBottomColor: RK.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowQuitModal(true)}>
            <Ionicons name="close" size={24} color={RK.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerProgress, { color: RK.primary }]}>
              {currentIndex + 1} / {questions.length}
            </Text>
            <Text style={[styles.headerTopic, { color: RK.textLight }]}>{currentQuestion.topic}</Text>
          </View>

          <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{currentQuestion.difficulty}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: RK.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: RK.primary }]} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Subtopic chip & Calculator button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={[styles.subtopicChip, { backgroundColor: RK.chipBg, marginBottom: 0 }]}>
              <Text style={[styles.subtopicChipText, { color: RK.chipText }]}>{currentQuestion.subtopic}</Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 12,
                backgroundColor: RK.card,
                borderWidth: 1,
                borderColor: RK.border,
              }}
              onPress={() => setShowCalculator(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calculator-outline" size={16} color={RK.primary} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: RK.primary }}>Calculator</Text>
            </TouchableOpacity>
          </View>

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: RK.card }]}>
            <MessageRenderer
              content={currentQuestion.question}
              textColor={RK.text}
              fontSize={17}
            />
          </View>

          {/* Multiple choice */}
          {(currentQuestion.questionType === 'Multiple Choice' || currentQuestion.questionType === 'multiple-choice') && Array.isArray(currentQuestion.choices) && currentQuestion.choices.length > 0 && (
            <View style={styles.choicesContainer}>
              {currentQuestion.choices.map((choice, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedAnswer === choice;
                const isCorrectChoice = choice.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
                let cardBg = RK.choiceCard;
                let cardBorder = RK.choiceBorder;
                let bubbleBg = RK.surface;
                let bubbleTextColor = RK.textLight;
                let cardTextColor = RK.choiceText;
                if (showExplanation) {
                  if (isSelected && isCorrect) {
                    cardBg = RK.correctBg;
                    cardBorder = RK.correctBorder;
                    bubbleBg = '#00a472';
                    bubbleTextColor = '#fff';
                    cardTextColor = RK.correctText;
                  } else if (isSelected && !isCorrect) {
                    cardBg = RK.incorrectBg;
                    cardBorder = RK.incorrectBorder;
                    bubbleBg = '#ef4444';
                    bubbleTextColor = '#fff';
                    cardTextColor = RK.incorrectText;
                  } else if (!isSelected && isCorrectChoice) {
                    cardBg = RK.correctBg;
                    cardBorder = RK.correctBorder;
                    cardTextColor = RK.correctText;
                  }
                } else if (isSelected) {
                  cardBg = RK.selectedBg;
                  cardBorder = RK.selectedBorder;
                  bubbleBg = RK.primary;
                  bubbleTextColor = '#fff';
                  cardTextColor = RK.selectedText;
                }
                return (
                  <TouchableOpacity key={idx}
                    style={[styles.choiceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                    onPress={() => handleSelectAnswer(choice)} disabled={showExplanation} activeOpacity={0.7}>
                    <View style={[styles.choiceBubble, { backgroundColor: bubbleBg }]}>
                      <Text style={[styles.choiceBubbleText, { color: bubbleTextColor }]}>{letter}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <MessageRenderer content={choice} textColor={cardTextColor} fontSize={15} />
                    </View>
                    {showExplanation && isSelected && isCorrect && <Ionicons name="checkmark-circle" size={22} color={RK.correctText} />}
                    {showExplanation && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color={RK.incorrectText} />}
                    {showExplanation && !isSelected && isCorrectChoice && <Ionicons name="checkmark-circle" size={22} color={RK.correctText} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Hint */}
          {!showExplanation && currentQuestion.hints?.length > 0 && (
            <View style={styles.hintSection}>
              {!showHint ? (
                <TouchableOpacity style={[styles.hintButton, { backgroundColor: RK.hintBg, borderColor: RK.hintBorder }]} onPress={() => setShowHint(true)}>
                  <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
                  <Text style={[styles.hintButtonText, { color: RK.hintText }]}>Show Hint</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.hintCard, { backgroundColor: RK.hintBg }]}>
                  <Ionicons name="bulb" size={18} color="#f59e0b" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <MessageRenderer content={currentQuestion.hints[0]} textColor={RK.hintBody} fontSize={14} />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Explanation */}
          {showExplanation && (
            <View style={[styles.explanationCard, { backgroundColor: RK.explBg, borderLeftColor: isCorrect ? RK.correctBorder : RK.incorrectBorder }]}>
              <Text style={[styles.explanationResult, { color: isCorrect ? RK.correctText : RK.incorrectText }]}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </Text>
              <MessageRenderer content={currentQuestion.explanation} textColor={RK.explText} fontSize={14} />
              {!isCorrect && (
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                  <Text style={[styles.correctAnswerText, { color: RK.correctText }]}>
                    Correct answer:{' '}
                  </Text>
                  <MessageRenderer content={currentQuestion.correctAnswer} textColor={RK.correctText} fontSize={14} />
                </View>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: RK.footerBg, borderTopColor: RK.border }]}>
          {!showExplanation ? (
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: RK.primary }, !selectedAnswer && styles.footerButtonDisabled]}
              onPress={handleConfirmAnswer} disabled={!selectedAnswer} activeOpacity={0.9}>
              <Text style={styles.footerButtonText}>Confirm Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: RK.primary }]}
              onPress={handleNext} activeOpacity={0.9}>
              <Text style={styles.footerButtonText}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={{ height: 50 }} />
        </View>

        {/* Scientific Calculator Modal */}
        <ScientificCalculator
          visible={showCalculator}
          onClose={() => setShowCalculator(false)}
          onUseResult={(val) => {
            if (currentQuestion.choices && Array.isArray(currentQuestion.choices)) {
              const match = currentQuestion.choices.find(
                c => c.trim().toLowerCase() === val.trim().toLowerCase() || c.includes(val)
              );
              handleSelectAnswer(match ?? val);
            } else {
              handleSelectAnswer(val);
            }
            setShowCalculator(false);
          }}
          darkMode={darkMode}
        />

        {/* Quit Confirmation Modal */}
        <Modal
          visible={showQuitModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQuitModal(false)}
        >
          <View style={styles.quitOverlay}>
            <View style={[styles.quitContent, { backgroundColor: darkMode ? '#1a1a1a' : '#ffffff' }]}>
              <View style={[styles.quitIconBox, { backgroundColor: darkMode ? '#2d2605' : '#fef3c7' }]}>
                <Ionicons name="warning-outline" size={32} color="#f59e0b" />
              </View>
              <Text style={[styles.quitTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
                Leave Diagnostic Test?
              </Text>
              <Text style={[styles.quitMessage, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                Are you sure you want to leave? Your progress in this diagnostic test will not be saved.
              </Text>
              <View style={styles.quitButtonRow}>
                <TouchableOpacity
                  style={[styles.quitCancelBtn, { backgroundColor: darkMode ? '#2e2e2e' : '#f3f4f6' }]}
                  onPress={() => setShowQuitModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quitCancelBtnText, { color: darkMode ? '#e5e7eb' : '#374151' }]}>
                    Continue Test
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quitLeaveBtn}
                  onPress={() => {
                    setShowQuitModal(false);
                    router.back();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quitLeaveBtnText}>Leave Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── Render: Intro ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: RK.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={RK.header} />

      <View style={[styles.header, { backgroundColor: RK.header, borderBottomColor: RK.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={RK.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: RK.text }]}>Diagnostic Test</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={[styles.infoCard, { backgroundColor: RK.infoCard }]}>
          <Ionicons name="analytics" size={52} color={RK.secondary} />
          <Text style={[styles.infoTitle, { color: RK.primary }]}>Update Your Knowledge Map</Text>
          <Text style={[styles.infoText, { color: RK.textLight }]}>
            9 questions across Algebra, Geometry, and Trigonometry. Takes around 5–10 minutes.
            Your personalised learning path will be updated when you finish.
          </Text>
        </View>

        {/* What to expect */}
        <View style={styles.expectSection}>
          <Text style={[styles.expectTitle, { color: RK.text }]}>What to expect</Text>
          {[
            { icon: 'help-circle', color: '#4b41e1', title: '9 questions', sub: 'Balanced across all three topics (3 per topic)' },
            { icon: 'bulb', color: '#f59e0b', title: 'Hints available', sub: 'One hint per question if you need it' },
            { icon: 'stats-chart', color: '#00a472', title: 'Instant results', sub: 'Your knowledge map updates immediately' },
          ].map((item, i) => (
            <View key={i} style={styles.expectRow}>
              <View style={[styles.expectIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.expectItemTitle, { color: RK.text }]}>{item.title}</Text>
                <Text style={[styles.expectItemSub, { color: RK.textLight }]}>{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.tipsCard, { backgroundColor: RK.tipsCard, borderLeftColor: RK.tipsBorder }]}>
          <Text style={[styles.tipsTitle, { color: RK.text }]}>Tips for best results</Text>
          <Text style={[styles.tipsText, { color: RK.tipsText }]}>
            {'• Find a quiet spot with no distractions\n• Have paper handy for calculations\n• Answer honestly — the path is built around your results'}
          </Text>
        </View>

        <TouchableOpacity style={[styles.startButton, { backgroundColor: '#4b41e1' }]} onPress={startTest}
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

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onPrimaryPress={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
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

  quitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quitContent: {
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
  quitIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quitTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  quitMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  quitButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  quitCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quitLeaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitLeaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
