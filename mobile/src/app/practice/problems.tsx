import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';
import { generateProblems } from '@/services/clientProblemGenerator';
import { PracticeProblem } from '@/types/lesson';
import { useTheme } from '@/context/ThemeContext';
import MessageRenderer from '@/components/MessageRenderer';

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
  const { darkMode } = useTheme();
  const todayKey = new Date().toISOString().slice(0, 10);

  const PR = {
    bg: darkMode ? '#0a0a0a' : Colors.background,
    header: darkMode ? '#0a0a0a' : Colors.white,
    border: darkMode ? '#2e2e2e' : Colors.borderLight,
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    card: darkMode ? '#1a1a1a' : Colors.white,
    surface: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
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

  useEffect(() => {
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
      Alert.alert('Error', `Could not load problems: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer?.trim() || !currentProblem) return;

    try {
      setSubmitting(true);

      // All generated problems are checked client-side — no DB call needed.
      // Generated IDs follow the pattern: "algebra-basic-timestamp-index-random"
      // DB problems have MongoDB ObjectId format (24 hex chars).
      const isGenerated = currentProblem._id.includes('-');

      if (isGenerated || currentProblem.type === 'free-response') {
        let correct = false;

        if (currentProblem.type === 'multiple-choice' || currentProblem.type === 'true-false') {
          // For MC and T/F: compare selected text against correctAnswer
          correct = selectedAnswer.trim() === (currentProblem.correctAnswer ?? '').trim();
        } else {
          // Free-response: forgiving numeric/text match
          const normalize = (s: string) =>
            s.trim()
              .toLowerCase()
              .replace(/\s+/g, '')
              .replace(/x\s*=\s*/g, '')
              .replace(/[°²³]/g, '')
              .replace(/cm|m²|m³|cm²|cm³/g, '')
              .replace(/≈/g, '');

          const userNorm    = normalize(selectedAnswer);
          const correctNorm = normalize(currentProblem.correctAnswer ?? '');
          const extractNums = (s: string) => s.match(/-?\d+\.?\d*/g)?.join(',') ?? s;

          correct =
            userNorm === correctNorm ||
            extractNums(userNorm) === extractNums(correctNorm);
        }

        setIsCorrect(correct);
        setShowExplanation(true);
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
      setIsCorrect(response.isCorrect);
      setShowExplanation(true);
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextProblem = async () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetProblem();
    } else {
      // Mark daily challenge done if applicable
      if (isDaily === 'true') {
        await AsyncStorage.setItem(`daily_challenge_${todayKey}`, 'done');
      }
      Alert.alert(
        isDaily === 'true' ? 'Daily Challenge Complete! 🏆' : 'Practice Complete! 🎉',
        isDaily === 'true'
          ? "You've completed today's challenge. Come back tomorrow for a new one!"
          : "You've completed all problems in this set.",
        [{ text: 'Back to Practice', onPress: () => router.back() }]
      );
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

  return (
    <View style={[styles.container, { backgroundColor: PR.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PR.header, borderBottomColor: PR.border }]}>
        <TouchableOpacity style={[styles.backIcon, { backgroundColor: PR.backIconBg }]} onPress={() => router.back()}>
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
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / problems.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Problem Card */}
        <View style={[styles.problemCard, { backgroundColor: PR.card }]}>
          <View style={styles.problemHeader}>
            <Ionicons name="help-circle" size={24} color="#4b41e1" />
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
                    isSelected && !showExplanation && styles.optionCardSelected,
                    showExplanation && isSelected && isCorrect && styles.optionCardCorrect,
                    showExplanation && isSelected && !isCorrect && styles.optionCardWrong,
                  ]}
                  onPress={() => !showExplanation && setSelectedAnswer(option.text)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionBubble,
                    { backgroundColor: PR.surface },
                    isSelected && !showExplanation && styles.optionBubbleSelected,
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
                  {showExplanation && isSelected && isCorrect && <Ionicons name="checkmark-circle" size={24} color="#00a472" />}
                  {showExplanation && isSelected && !isCorrect && <Ionicons name="close-circle" size={24} color="#ef4444" />}
                  {showExplanation && !isSelected && option.isCorrect && <Ionicons name="checkmark-circle" size={24} color="#00a472" />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Free Response */}
        {currentProblem.type === 'free-response' && (
          <View style={styles.freeResponseContainer}>
            <Text style={[styles.freeResponseLabel, { color: PR.textLight }]}>Type your answer:</Text>
            <TextInput
              style={[styles.freeResponseInput, { backgroundColor: PR.inputBg, borderColor: PR.inputBorder, color: PR.text },
                showExplanation && isCorrect && styles.freeResponseCorrect,
                showExplanation && !isCorrect && styles.freeResponseWrong,
              ]}
              placeholder="e.g. 7  or  x = 7"
              placeholderTextColor={PR.textLight}
              value={selectedAnswer ?? ''}
              onChangeText={(text) => !showExplanation && setSelectedAnswer(text)}
              editable={!showExplanation}
              autoCapitalize="none"
              keyboardType="default"
            />
            {showExplanation && !isCorrect && (
              <View style={styles.correctAnswerHint}>
                <Ionicons name="checkmark-circle" size={16} color="#00a472" />
                <Text style={styles.correctAnswerText}>Correct answer: {currentProblem.correctAnswer}</Text>
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
                if (isSelected && isCorrect)    { bg = '#f0fdf4'; border = '#00a472'; textColor = '#00a472'; }
                if (isSelected && !isCorrect)   { bg = '#fef2f2'; border = '#ef4444'; textColor = '#ef4444'; }
                if (!isSelected && isCorrectOpt){ bg = '#f0fdf4'; border = '#00a472'; textColor = '#00a472'; }
              } else if (isSelected) {
                bg = '#f5f4ff'; border = '#4b41e1'; textColor = '#4b41e1';
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
                  {showExplanation && isSelected && isCorrect  && <Ionicons name="checkmark-circle" size={22} color="#00a472" />}
                  {showExplanation && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color="#ef4444" />}
                  {showExplanation && !isSelected && isCorrectOpt && <Ionicons name="checkmark-circle" size={22} color="#00a472" />}
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
            <View style={[styles.explanationHeader, { backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2' }]}>
              <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={32} color={isCorrect ? '#00a472' : '#ef4444'} />
              <Text style={[styles.explanationTitle, { color: isCorrect ? '#00a472' : '#ef4444' }]}>
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
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <MessageRenderer content={step} textColor={PR.text} fontSize={14} />
                      </View>
                    </View>
                  ))}
                  <View style={[styles.finalAnswer, { borderTopColor: PR.surface }]}>
                    <Text style={[styles.finalAnswerLabel, { color: PR.text }]}>Final Answer:</Text>
                    <MessageRenderer content={currentProblem.solution.finalAnswer} textColor="#4b41e1" fontSize={16} />
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
            style={[styles.submitButton, !selectedAnswer?.trim() && styles.submitButtonDisabled]}
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
          <TouchableOpacity style={styles.nextButton} onPress={handleNextProblem}>
            <Text style={styles.nextButtonText}>
              {currentIndex < problems.length - 1 ? 'Next Problem' : 'Finish'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 30 }} />
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
    backgroundColor: '#f5f4ff',
  },
  optionCardCorrect: {
    borderColor: '#00a472',
    backgroundColor: '#f0fdf4',
  },
  optionCardWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
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
  freeResponseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 12,
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
    borderColor: '#00a472',
    backgroundColor: '#f0fdf4',
  },
  freeResponseWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  correctAnswerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#00a472',
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
    backgroundColor: '#00a472',
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
});
