import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';
import { generateProblems } from '@/services/clientProblemGenerator';
import { PracticeProblem } from '@/types/lesson';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import MessageRenderer from '@/components/MessageRenderer';
import MathToolbar from '@/components/MathToolbar';
import ScientificCalculator from '@/components/ScientificCalculator';
import { findMatchingChoice } from '@/utils/choiceUtils';
import api from '@/services/api';
import { PRACTICE_ENDPOINTS } from '@/constants/api';
import CustomAlertModal from '@/components/common/CustomAlertModal';

export default function ProblemsScreen() {
const { lessonId, difficulty, category, count, title, topic, isDaily } = useLocalSearchParams<{
    lessonId?: string;
    difficulty?: string;
    category?: string;
    count?: string;
    title?: string;
    topic?: string;
    isDaily?: string;
  }>();
  const router = useRouter();
  const { darkMode, primaryColor } = useTheme();
  const todayKey = new Date().toISOString().slice(0, 10);

  const PR = {
    bg: darkMode ? '#0a0a0a' : Colors.background,
    header: darkMode ? '#0a0a0a' : Colors.white,
    border: darkMode ? '#2e2e2e' : Colors.borderLight,
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    card: darkMode ? '#1a1a1a' : Colors.white,
    surface: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    chipBg: primaryColor ? `${primaryColor}20` : (darkMode ? '#312e81' : Colors.secondary + '20'),
    chipText: primaryColor || (darkMode ? '#a5b4fc' : Colors.secondary),
    primary: primaryColor || (darkMode ? '#818cf8' : '#4b41e1'),
    selectedBg: primaryColor ? `${primaryColor}15` : (darkMode ? '#1e1b4b' : '#f5f4ff'),
    footer: darkMode ? '#0a0a0a' : Colors.white,
    backIconBg: darkMode ? '#2a2a2a' : Colors.surface,
    backIconColor: darkMode ? '#f0f0f0' : '#091426',
    optionCard: darkMode ? '#1a1a1a' : Colors.white,
    optionBorder: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    optionText: darkMode ? '#f0f0f0' : Colors.text,
    inputBg: darkMode ? '#1a1a1a' : Colors.white,
    inputBorder: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    explanationBg: darkMode ? '#1a1a1a' : Colors.white,
    hintBg: darkMode ? '#2d2a00' : '#fef3c7',
    hintBorder: '#fcd34d',
    hintText: darkMode ? '#fcd34d' : '#92400e',
    hintBody: darkMode ? '#fbbf24' : '#78350f',
    // Correct / incorrect feedback
    correctBg: darkMode ? '#052e16' : '#d1fae5',
    correctText: darkMode ? '#4ade80' : '#00a472',
    correctBorder: darkMode ? '#166534' : '#00a472',
    incorrectBg: darkMode ? '#2d0a0a' : '#fee2e2',
    incorrectText: darkMode ? '#f87171' : '#ef4444',
    incorrectBorder: darkMode ? '#7f1d1d' : '#ef4444',
    correctAnswerHintBg: darkMode ? '#052e16' : '#f0fdf4',
    correctAnswerHintText: darkMode ? '#4ade80' : '#00a472',
    // Free-response input states
    inputCorrectBg: darkMode ? '#052e16' : '#f0fdf4',
    inputCorrectBorder: darkMode ? '#166534' : '#00a472',
    inputWrongBg: darkMode ? '#2d0a0a' : '#fef2f2',
    inputWrongBorder: darkMode ? '#7f1d1d' : '#ef4444',
  };

  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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

  // Scoring — use a ref so the count is always synchronously current
  // when handleNextProblem reads it immediately after handleSubmitAnswer.
  const correctCountRef = useRef(0);
  const [correctCount, setCorrectCount] = useState(0); // drives the results UI
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    correctCountRef.current = 0;
    setCorrectCount(0);
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);

      // Lesson-specific: must come from DB
      if (lessonId) {
        const data = await lessonService.getPracticeProblems({
          topic: topic,
          lessonId: lessonId,
          difficulty: difficulty,
          limit: count ? parseInt(count) : 10,
        });
        setProblems(data.problems);
        return;
      }

      // General practice: generate directly client-side — no network needed
      const topicKey  = (topic  || 'algebra').toLowerCase();
      const catKey    = (category || 'mixed').toLowerCase();
      const numProbs  = count ? parseInt(count) : (catKey === 'mixed' ? 15 : 5);

      const generated = generateProblems(topicKey, catKey, numProbs);
      setProblems(generated as unknown as PracticeProblem[]);
    } catch (error: any) {
      console.error('Error loading problems:', error?.message || error);
      showAlert('Error', `Could not load problems: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[currentIndex];
  const isAbsoluteValue = currentProblem
    ? ((currentProblem.problem?.text ?? '').includes('|') ||
       (currentProblem.subtopic ?? '').toLowerCase().includes('absolute') ||
       (currentProblem.topic ?? '').toLowerCase().includes('absolute') ||
       (currentProblem.problem?.text ?? '').toLowerCase().includes('absolute value') ||
       (currentProblem.correctAnswer ?? '').includes('or'))
    : false;

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer?.trim() || !currentProblem) return;

    try {
      setSubmitting(true);

      // All generated problems are checked client-side — no DB call needed.
      // Generated IDs follow the pattern: "algebra-basic-timestamp-index-random"
      // DB problems have MongoDB ObjectId format (24 hex chars).
      const isGenerated = currentProblem._id.includes('-');
      const pType = currentProblem.type as string;
      const isFreeResponse =
        pType === 'free-response' ||
        pType === 'short-answer' ||
        pType === 'numeric' ||
        !currentProblem.options ||
        currentProblem.options.length === 0;

      if (isGenerated || isFreeResponse) {
        let correct = false;

        if (currentProblem.type === 'multiple-choice' || currentProblem.type === 'true-false') {
          // For MC and T/F: compare selected text against correctAnswer
          correct = selectedAnswer.trim() === (currentProblem.correctAnswer ?? '').trim();
        } else {
          // Free-response: forgiving numeric/text match
          const normalize = (s: string) =>
            s.trim()
              .toLowerCase()
              // Strip LaTeX wrappers that might appear in correctAnswer
              .replace(/\$([^$]+)\$/g, '$1')
              // Treat π symbol and the word "pi" as identical
              .replace(/π/g, 'pi')
              // Remove spaces
              .replace(/\s+/g, '')
              // Strip "x = " prefix
              .replace(/x\s*=\s*/g, '')
              // Strip common units and symbols that don't affect numeric value
              .replace(/[°²³]/g, '')
              .replace(/cm|m²|m³|cm²|cm³/g, '')
              .replace(/≈/g, '')
              .replace(/\*/g, '');

          const extractNums = (s: string) => s.match(/-?\d+\.?\d*/g) ?? [];
          const userNorm    = normalize(selectedAnswer);
          const correctRaw  = currentProblem.correctAnswer ?? '';
          const correctNorm = normalize(correctRaw);

          // 1. Direct exact or normalized match
          correct = selectedAnswer.trim().toLowerCase() === correctRaw.trim().toLowerCase() || userNorm === correctNorm;

          // 2. If not matched, try splitting multi-value answers by "or" or "and"
          if (!correct) {
            const correctParts = correctRaw
              .split(/\s+or\s+|\s+and\s+/i)
              .map(normalize);
            const userNums = extractNums(userNorm).map(n => parseFloat(n)).filter(n => !isNaN(n));

            correct = correctParts.some((part) => {
              const partNorm = normalize(part);
              if (userNorm === partNorm) return true;

              const partNums = extractNums(partNorm).map(n => parseFloat(n)).filter(n => !isNaN(n));

              if (userNums.length > 0 && partNums.length > 0) {
                return userNums.some((uNum) =>
                  partNums.some((pNum) => Math.abs(uNum - pNum) < 0.02 || uNum.toFixed(2) === pNum.toFixed(2))
                );
              }
              return false;
            });
          }
        }

        if (correct) {
          correctCountRef.current += 1;
          setCorrectCount(correctCountRef.current);
        }
        setIsCorrect(correct);
        setShowExplanation(true);

        // Async submit for DB-backed problems to keep user progress synced
        if (!isGenerated) {
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          lessonService.submitAnswer(currentProblem._id, selectedAnswer, timeSpent, hintsUsed).catch(() => {});
        }
        return;
      }

      // Only truly DB-backed problems (MongoDB ObjectId) reach here
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const response = await lessonService.submitAnswer(
        currentProblem._id,
        selectedAnswer,
        timeSpent,
        hintsUsed
      );
      if (response.isCorrect) {
        correctCountRef.current += 1;
        setCorrectCount(correctCountRef.current);
      }
      setIsCorrect(response.isCorrect);
      setShowExplanation(true);
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      showAlert('Error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextProblem = async () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetProblem();
    } else {
      // Last problem — read from ref which is always synchronously up to date
      const finalScore = correctCountRef.current;
      const finalTotal = problems.length;

      if (isDaily === 'true') {
        try {
          await api.post(PRACTICE_ENDPOINTS.DAILY_COMPLETE, {
            topic: topic || 'unknown',
            score: finalScore,
            total: finalTotal,
          });
        } catch {
          // Non-critical — don't block the results screen
        }
      }
      setShowResults(true);
    }
  };

  const resetProblem = () => {
    setSelectedAnswer(null);
    setShowHint(false);
    setHintsUsed(0);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return '#00a472';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return Colors.textLight;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: PR.bg }]}>
        <ActivityIndicator size="large" color="#4b41e1" />
        <Text style={[styles.loadingText, { color: PR.textLight }]}>Loading problems...</Text>
      </View>
    );
  }

  if (problems.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: PR.bg }]}>
        <Ionicons name="alert-circle-outline" size={64} color={PR.textLight} />
        <Text style={[styles.errorText, { color: PR.text }]}>No problems available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Results screen shown after the last problem ───────────────────────────
  if (showResults) {
    const finalScore = correctCountRef.current;
    const finalTotal = problems.length;
    const pct = Math.round((finalScore / finalTotal) * 100);
    const scoreColor = pct >= 80 ? '#00a472' : pct >= 50 ? '#f59e0b' : '#ef4444';
    const message =
      pct >= 80 ? 'Excellent work!' :
      pct >= 50 ? 'Good effort!' :
      'Keep practicing!';

    return (
      <View style={[styles.container, { backgroundColor: PR.bg }]}>
        <View style={[styles.header, { backgroundColor: PR.header, borderBottomColor: PR.border }]}>
          <TouchableOpacity style={[styles.backIcon, { backgroundColor: PR.backIconBg }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={PR.backIconColor} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerSubtitle, { color: PR.textLight }]}>{title || 'Practice Complete'}</Text>
            <Text style={[styles.headerTitle, { color: PR.text }]}>Results</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
          {/* Score circle */}
          <View style={[styles.resultsCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.resultsFraction, { color: scoreColor }]}>
              {finalScore}/{finalTotal}
            </Text>
            <Text style={[styles.resultsPct, { color: PR.textLight }]}>{pct}%</Text>
          </View>

          <Text style={[styles.resultsMessage, { color: PR.text }]}>{message}</Text>

          {isDaily === 'true' && (
            <View style={[styles.resultsDailyBadge, { backgroundColor: scoreColor + '20', borderColor: scoreColor }]}>
              <Ionicons name="trophy" size={18} color={scoreColor} />
              <Text style={[styles.resultsDailyText, { color: scoreColor }]}>
                Daily Challenge — {finalScore}/{finalTotal} correct
              </Text>
            </View>
          )}

          {/* Per-problem breakdown */}
          <View style={[styles.resultsBreakdown, { backgroundColor: PR.card }]}>
            <Text style={[styles.resultsBreakdownTitle, { color: PR.text }]}>Breakdown</Text>
            <View style={styles.resultsRow}>
              <Text style={[styles.resultsRowLabel, { color: PR.textLight }]}>Correct answers</Text>
              <Text style={[styles.resultsRowValue, { color: '#00a472' }]}>{finalScore}</Text>
            </View>
            <View style={styles.resultsRow}>
              <Text style={[styles.resultsRowLabel, { color: PR.textLight }]}>Incorrect answers</Text>
              <Text style={[styles.resultsRowValue, { color: '#ef4444' }]}>{finalTotal - finalScore}</Text>
            </View>
            <View style={[styles.resultsRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.resultsRowLabel, { color: PR.textLight }]}>Total problems</Text>
              <Text style={[styles.resultsRowValue, { color: PR.text }]}>{finalTotal}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resultsDoneButton, { backgroundColor: scoreColor }]}
            onPress={() => router.back()}
          >
            <Text style={styles.resultsDoneButtonText}>
              {isDaily === 'true' ? 'Back to Practice' : 'Done'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: PR.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PR.header, borderBottomColor: PR.border }]}>
        <TouchableOpacity style={[styles.backIcon, { backgroundColor: PR.backIconBg }]} onPress={() => setShowQuitModal(true)}>
          <Ionicons name="arrow-back" size={24} color={PR.backIconColor} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, { color: PR.textLight }]}>{title || 'Practice Problems'}</Text>
          <Text style={[styles.headerTitle, { color: PR.text }]}>
            Problem {currentIndex + 1} of {problems.length}
          </Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentProblem.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(currentProblem.difficulty) }]}>
            {currentProblem.difficulty}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: PR.header }]}>
        <View style={[styles.progressBar, { backgroundColor: PR.surface }]}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / problems.length) * 100}%`, backgroundColor: PR.primary }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Calculator button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 12,
              backgroundColor: PR.card,
              borderWidth: 1,
              borderColor: PR.border,
            }}
            onPress={() => setShowCalculator(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calculator-outline" size={16} color={PR.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: PR.primary }}>Calculator</Text>
          </TouchableOpacity>
        </View>

        {/* Problem Card */}
        <View style={[styles.problemCard, { backgroundColor: PR.card }]}>
          <View style={styles.problemHeader}>
            <Ionicons name="help-circle" size={24} color={PR.primary} />
            <Text style={[styles.problemLabel, { color: PR.text }]}>Question</Text>
          </View>
          <MessageRenderer content={currentProblem.problem.text} textColor={PR.text} fontSize={18} />
        </View>

        {/* Multiple Choice Options */}
        {currentProblem.type === 'multiple-choice' && currentProblem.options && (
          <View style={styles.optionsContainer}>
            <Text style={[styles.optionsLabel, { color: PR.textLight }]}>Select your answer:</Text>
            {currentProblem.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === option.text;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    { backgroundColor: PR.optionCard, borderColor: PR.optionBorder },
                    isSelected && !showExplanation && { borderColor: PR.primary, backgroundColor: PR.selectedBg },
                    showExplanation && isSelected && isCorrect  && { borderColor: PR.correctBorder,   backgroundColor: PR.correctBg   },
                    showExplanation && isSelected && !isCorrect && { borderColor: PR.incorrectBorder, backgroundColor: PR.incorrectBg },
                    showExplanation && !isSelected && option.isCorrect && { borderColor: PR.correctBorder, backgroundColor: PR.correctBg },
                  ]}
                  onPress={() => !showExplanation && setSelectedAnswer(option.text)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionBubble,
                    { backgroundColor: PR.surface },
                    isSelected && !showExplanation && { backgroundColor: PR.primary },
                    showExplanation && isSelected && isCorrect && styles.optionBubbleCorrect,
                    showExplanation && isSelected && !isCorrect && styles.optionBubbleWrong,
                  ]}>
                    <Text style={[styles.optionBubbleText, { color: PR.textLight },
                      (isSelected && !showExplanation) && styles.optionBubbleTextActive,
                      (showExplanation && isSelected && isCorrect) && styles.optionBubbleTextActive,
                      (showExplanation && isSelected && !isCorrect) && styles.optionBubbleTextActive,
                    ]}>
                      {optionLabel}
                    </Text>
                  </View>
                  <MessageRenderer content={option.text} textColor={PR.optionText} fontSize={16} />
                  {showExplanation && isSelected && isCorrect && <Ionicons name="checkmark-circle" size={24} color={PR.correctText} />}
                  {showExplanation && isSelected && !isCorrect && <Ionicons name="close-circle" size={24} color={PR.incorrectText} />}
                  {showExplanation && !isSelected && option.isCorrect && <Ionicons name="checkmark-circle" size={24} color={PR.correctText} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Free Response */}
        {currentProblem.type === 'free-response' && (
          <View style={styles.freeResponseContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              <Text style={[styles.freeResponseLabel, { color: PR.textLight }]}>Type your answer:</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: PR.primary, backgroundColor: PR.chipBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                {isAbsoluteValue ? 'Use 2 decimal places max • Providing either solution is accepted' : 'Use 2 decimal places if needed'}
              </Text>
            </View>
            <TextInput
              style={[styles.freeResponseInput, { backgroundColor: PR.inputBg, borderColor: PR.inputBorder, color: PR.text },
                showExplanation && isCorrect  && { backgroundColor: PR.inputCorrectBg, borderColor: PR.inputCorrectBorder },
                showExplanation && !isCorrect && { backgroundColor: PR.inputWrongBg,  borderColor: PR.inputWrongBorder  },
              ]}
              placeholder="e.g. 7  or  -3.5  or  1e5"
              placeholderTextColor={PR.textLight}
              value={selectedAnswer ?? ''}
              onChangeText={(text) => {
                if (!showExplanation) {
                  const filtered = text.replace(/[^0-9eE\.\-\+\/\*\^\,\s\%\(\)π√θ°²³×÷±≈≠≤≥∞αβλμσΔΣΩ]/g, '');
                  setSelectedAnswer(filtered);
                }
              }}
              editable={!showExplanation}
              autoCapitalize="none"
              keyboardType="decimal-pad"
            />
            {!showExplanation && (
              <MathToolbar
                darkMode={darkMode}
                onInsert={(sym) => !showExplanation && setSelectedAnswer((prev) => (prev ?? '') + sym)}
              />
            )}
            {showExplanation && !isCorrect && (
              <View style={[styles.correctAnswerHint, { backgroundColor: PR.correctAnswerHintBg }]}>
                <Ionicons name="checkmark-circle" size={16} color={PR.correctText} />
                <Text style={[styles.correctAnswerText, { color: PR.correctAnswerHintText }]}>
                  Correct answer: {(currentProblem.correctAnswer ?? '').replace(/\$([^$]+)\$/g, '$1')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* True / False */}
        {currentProblem.type === 'true-false' && (
          <View style={styles.tfContainer}>
            {['True', 'False'].map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === currentProblem.correctAnswer;
              let bg = PR.card;
              let border = PR.surface;
              let textColor = PR.text;
              if (showExplanation) {
                if (isSelected && isCorrect)     { bg = PR.correctBg;   border = PR.correctBorder;   textColor = PR.correctText;   }
                if (isSelected && !isCorrect)    { bg = PR.incorrectBg; border = PR.incorrectBorder; textColor = PR.incorrectText; }
                if (!isSelected && isCorrectOpt) { bg = PR.correctBg;   border = PR.correctBorder;   textColor = PR.correctText;   }
              } else if (isSelected) {
                bg = PR.selectedBg; border = PR.primary; textColor = PR.primary;
              }
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.tfButton, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => !showExplanation && setSelectedAnswer(opt)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tfButtonText, { color: textColor }]}>{opt}</Text>
                  {showExplanation && isSelected && isCorrect  && <Ionicons name="checkmark-circle" size={22} color={PR.correctText} />}
                  {showExplanation && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color={PR.incorrectText} />}
                  {showExplanation && !isSelected && isCorrectOpt && <Ionicons name="checkmark-circle" size={22} color={PR.correctText} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Hints */}
        {currentProblem.hints && currentProblem.hints.length > 0 && !showExplanation && (
          <View style={styles.hintsSection}>
            {!showHint ? (
              <TouchableOpacity style={[styles.hintButton, { backgroundColor: PR.hintBg, borderColor: PR.hintBorder }]}
                onPress={() => { setShowHint(true); setHintsUsed(hintsUsed + 1); }}>
                <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                <Text style={[styles.hintButtonText, { color: PR.hintText }]}>Show Hint</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.hintCard, { backgroundColor: PR.hintBg, borderLeftColor: '#f59e0b' }]}>
                <View style={styles.hintHeader}>
                  <Ionicons name="bulb" size={20} color="#f59e0b" />
                  <Text style={[styles.hintLabel, { color: PR.hintText }]}>Hint</Text>
                </View>
                <MessageRenderer content={currentProblem.hints[hintsUsed - 1] || currentProblem.hints[0]} textColor={PR.hintBody} fontSize={14} />
              </View>
            )}
          </View>
        )}

        {/* Explanation */}
        {showExplanation && (
          <View style={[styles.explanationCard, { backgroundColor: PR.explanationBg }]}>
            <View style={[styles.explanationHeader, { backgroundColor: isCorrect ? PR.correctBg : PR.incorrectBg }]}>
              <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={32} color={isCorrect ? PR.correctText : PR.incorrectText} />
              <Text style={[styles.explanationTitle, { color: isCorrect ? PR.correctText : PR.incorrectText }]}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
            </View>
            <View style={styles.explanationContent}>
              <Text style={[styles.explanationLabel, { color: PR.text }]}>Explanation:</Text>
              <MessageRenderer content={currentProblem.explanation} textColor={PR.text} fontSize={15} />
              {currentProblem.solution && (
                <View style={[styles.solutionSection, { borderTopColor: PR.surface }]}>
                  <Text style={[styles.solutionLabel, { color: PR.text }]}>Solution Steps:</Text>
                  {currentProblem.solution.steps.map((step, index) => (
                    <View key={index} style={styles.solutionStep}>
                      <View style={[styles.stepNumber, { backgroundColor: PR.primary }]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <MessageRenderer content={step} textColor={PR.text} fontSize={14} />
                      </View>
                    </View>
                  ))}
                  <View style={[styles.finalAnswer, { borderTopColor: PR.surface }]}>
                    <Text style={[styles.finalAnswerLabel, { color: PR.text }]}>Final Answer:</Text>
                    <MessageRenderer content={currentProblem.solution.finalAnswer} textColor={PR.primary} fontSize={16} />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: PR.footer, borderTopColor: PR.border }]}>
        {!showExplanation ? (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: PR.primary }, !selectedAnswer?.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={!selectedAnswer?.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: PR.primary }]} onPress={handleNextProblem}>
            <Text style={styles.nextButtonText}>
              {currentIndex < problems.length - 1 ? 'Next Problem' : 'Finish'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 30 }} />

      {/* Scientific Calculator */}
      <ScientificCalculator
        visible={showCalculator}
        onClose={() => setShowCalculator(false)}
        onUseResult={(val) => {
          const match = findMatchingChoice(currentProblem?.options, val);
          setSelectedAnswer(match);
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
              Leave Practice Session?
            </Text>
            <Text style={[styles.quitMessage, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
              Are you sure you want to leave? Your current progress in this practice set will not be saved.
            </Text>
            <View style={styles.quitButtonRow}>
              <TouchableOpacity
                style={[styles.quitCancelBtn, { backgroundColor: darkMode ? '#2e2e2e' : '#f3f4f6' }]}
                onPress={() => setShowQuitModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quitCancelBtnText, { color: darkMode ? '#e5e7eb' : '#374151' }]}>
                  Keep Practicing
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
                <Text style={styles.quitLeaveBtnText}>Leave Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4b41e1',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  problemCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  problemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  problemText: {
    fontSize: 18,
    color: Colors.text,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.surfaceContainer,
  },
  optionCardSelected: {
    borderColor: '#4b41e1',
  },
  optionCardCorrect: {
    borderWidth: 2,
  },
  optionCardWrong: {
    borderWidth: 2,
  },
  optionBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionBubbleSelected: {
    backgroundColor: '#4b41e1',
  },
  optionBubbleCorrect: {
    backgroundColor: '#00a472',
  },
  optionBubbleWrong: {
    backgroundColor: '#ef4444',
  },
  optionBubbleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight,
  },
  optionBubbleTextActive: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  tfContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 22,
    borderRadius: 16,
    borderWidth: 2,
  },
  tfButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  freeResponseContainer: {
    marginBottom: 24,
  },
  freeResponseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  freeResponseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  calcButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calcButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  freeResponseInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.surfaceContainer,
    padding: 16,
    minHeight: 80,
    fontSize: 16,
    color: Colors.text,
  },
  freeResponseCorrect: {
    borderWidth: 2,
  },
  freeResponseWrong: {
    borderWidth: 2,
  },
  correctAnswerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
  },
  correctAnswerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  freeResponseNote: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
    fontStyle: 'italic',
  },
  hintsSection: {
    marginBottom: 24,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  hintCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  hintText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  explanationContent: {
    padding: 20,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  solutionSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  solutionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  solutionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  finalAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  finalAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  finalAnswerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4b41e1',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4b41e1',
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4b41e1',
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#4b41e1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // ── Results screen ──────────────────────────────────────────────────────────
  resultsCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  resultsFraction: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  resultsPct: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  resultsMessage: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsDailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  resultsDailyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultsBreakdown: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  resultsBreakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  resultsRowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsRowValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultsDoneButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  resultsDoneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtopicChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  subtopicChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
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
