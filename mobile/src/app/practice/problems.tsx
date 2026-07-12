import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';
import { PracticeProblem } from '@/types/lesson';

export default function ProblemsScreen() {
  const { lessonId, difficulty, title } = useLocalSearchParams<{
    lessonId?: string;
    difficulty?: string;
    title?: string;
  }>();
  const router = useRouter();

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
      const data = await lessonService.getPracticeProblems({
        lessonId: lessonId,
        difficulty: difficulty,
        limit: 10,
      });
      setProblems(data.problems);
    } catch (error: any) {
      console.error('Error fetching problems:', error);
      Alert.alert('Error', 'Failed to load practice problems');
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentProblem) return;

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      console.log('📤 Submitting answer:');
      console.log('  Problem ID:', currentProblem._id);
      console.log('  Selected answer:', selectedAnswer);
      console.log('  Time spent:', timeSpent);
      console.log('  Hints used:', hintsUsed);
      
      const response = await lessonService.submitAnswer(
        currentProblem._id,
        selectedAnswer,
        timeSpent,
        hintsUsed
      );

      console.log('📥 Response:', response);
      setIsCorrect(response.isCorrect);
      setShowExplanation(true);
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetProblem();
    } else {
      Alert.alert(
        'Practice Complete! 🎉',
        'You\'ve completed all problems in this set.',
        [
          {
            text: 'Back to Practice',
            onPress: () => router.back(),
          },
        ]
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b41e1" />
        <Text style={styles.loadingText}>Loading problems...</Text>
      </View>
    );
  }

  if (problems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textLight} />
        <Text style={styles.errorText}>No problems available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>{title || 'Practice Problems'}</Text>
          <Text style={styles.headerTitle}>
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
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / problems.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Problem Card */}
        <View style={styles.problemCard}>
          <View style={styles.problemHeader}>
            <Ionicons name="help-circle" size={24} color="#4b41e1" />
            <Text style={styles.problemLabel}>Question</Text>
          </View>
          <Text style={styles.problemText}>{currentProblem.problem.text}</Text>
        </View>

        {/* Options */}
        {currentProblem.type === 'multiple-choice' && currentProblem.options && (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsLabel}>Select your answer:</Text>
            {currentProblem.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === option.text;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    showExplanation && option.isCorrect && styles.optionCardCorrect,
                    showExplanation && isSelected && !option.isCorrect && styles.optionCardWrong,
                  ]}
                  onPress={() => !showExplanation && setSelectedAnswer(option.text)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionBubble,
                    isSelected && styles.optionBubbleSelected,
                    showExplanation && option.isCorrect && styles.optionBubbleCorrect,
                    showExplanation && isSelected && !option.isCorrect && styles.optionBubbleWrong,
                  ]}>
                    <Text style={[
                      styles.optionBubbleText,
                      (isSelected || (showExplanation && option.isCorrect)) && styles.optionBubbleTextActive,
                    ]}>
                      {optionLabel}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                  {showExplanation && isSelected && isCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color="#00a472" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  )}
                  {showExplanation && !isSelected && option.isCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color="#00a472" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Free Response */}
        {currentProblem.type === 'free-response' && (
          <View style={styles.freeResponseContainer}>
            <Text style={styles.freeResponseLabel}>Enter your answer:</Text>
            <View style={styles.freeResponseInput}>
              <Text style={styles.freeResponsePlaceholder}>
                Type your solution here
              </Text>
            </View>
            <Text style={styles.freeResponseNote}>
              Note: Free response problems are evaluated manually
            </Text>
          </View>
        )}

        {/* Hints */}
        {currentProblem.hints && currentProblem.hints.length > 0 && !showExplanation && (
          <View style={styles.hintsSection}>
            {!showHint ? (
              <TouchableOpacity
                style={styles.hintButton}
                onPress={() => {
                  setShowHint(true);
                  setHintsUsed(hintsUsed + 1);
                }}
              >
                <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                <Text style={styles.hintButtonText}>Show Hint</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.hintCard}>
                <View style={styles.hintHeader}>
                  <Ionicons name="bulb" size={20} color="#f59e0b" />
                  <Text style={styles.hintLabel}>Hint</Text>
                </View>
                <Text style={styles.hintText}>
                  {currentProblem.hints[hintsUsed - 1] || currentProblem.hints[0]}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Explanation Modal Content */}
        {showExplanation && (
          <View style={styles.explanationCard}>
            <View style={[
              styles.explanationHeader,
              { backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2' }
            ]}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={isCorrect ? '#00a472' : '#ef4444'}
              />
              <Text style={[
                styles.explanationTitle,
                { color: isCorrect ? '#00a472' : '#ef4444' }
              ]}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
            </View>
            
            <View style={styles.explanationContent}>
              <Text style={styles.explanationLabel}>Explanation:</Text>
              <Text style={styles.explanationText}>{currentProblem.explanation}</Text>
              
              {currentProblem.solution && (
                <View style={styles.solutionSection}>
                  <Text style={styles.solutionLabel}>Solution Steps:</Text>
                  {currentProblem.solution.steps.map((step, index) => (
                    <View key={index} style={styles.solutionStep}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                  <View style={styles.finalAnswer}>
                    <Text style={styles.finalAnswerLabel}>Final Answer:</Text>
                    <Text style={styles.finalAnswerText}>
                      {currentProblem.solution.finalAnswer}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {!showExplanation ? (
          <TouchableOpacity
            style={[styles.submitButton, !selectedAnswer && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={!selectedAnswer || submitting}
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
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextProblem}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex < problems.length - 1 ? 'Next Problem' : 'Finish'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
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
    minHeight: 120,
  },
  freeResponsePlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
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
