import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';
import { Lesson } from '@/types/lesson';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import MessageRenderer from '@/components/MessageRenderer';

export default function LessonScreen() {
  const params = useLocalSearchParams<{
    lessonId: string;
    topicName?: string;
    mastery?: string;
  }>();
  const router = useRouter();
  const { darkMode } = useTheme();

  // Use local state for the active lessonId so prev/next swaps content
  // in-place without triggering a navigation transition.
  const [activeLessonId, setActiveLessonId] = useState(params.lessonId);
  const topicName = params.topicName;
  const mastery = params.mastery;

  const L = {
    bg: darkMode ? '#0a0a0a' : Colors.background,
    header: darkMode ? '#0a0a0a' : Colors.white,
    border: darkMode ? '#2e2e2e' : Colors.borderLight,
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    primary: darkMode ? '#a5b4fc' : '#4b41e1',
    card: darkMode ? '#1a1a1a' : Colors.white,
    surface: darkMode ? '#2a2a2a' : Colors.surface,
    badgeBg: darkMode ? '#312e81' : '#e2dfff',
    badgeText: darkMode ? '#a5b4fc' : '#4b41e1',
    footer: darkMode ? '#0a0a0a' : Colors.white,
    navBtnBg: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    exampleBg: darkMode ? '#2d2a00' : '#fef3c7',
    exampleBorder: '#f59e0b',
    exampleText: darkMode ? '#fcd34d' : '#92400e',
    exampleBody: darkMode ? '#fbbf24' : '#78350f',
  };
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());
  const [lessonList, setLessonList] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track whether the next fetch is triggered by prev/next navigation
  const isNavigationFetch = useRef(false);

  useEffect(() => {
    if (activeLessonId) {
      fetchLesson(isNavigationFetch.current);
      isNavigationFetch.current = false;
    }
  }, [activeLessonId]);

  useFocusEffect(
    useCallback(() => {
      if (lesson) {
        fetchLessonList(lesson.topic);
      }
    }, [lesson])
  );

  const fetchLessonList = async (topic: string, setIndex = true) => {
    try {
      const data = await lessonService.getLessons(topic);
      const lessons = data.lessons;
      setLessonList(lessons);
      if (setIndex) {
        const idx = lessons.findIndex((l: any) => l._id === activeLessonId);
        if (idx >= 0) setCurrentIndex(idx);
      }
    } catch (error) {
      console.error('Error fetching lesson list:', error);
    }
  };

  const fetchLesson = async (isNavigation = false) => {
    try {
      setLoading(true);
      const data = await lessonService.getLesson(activeLessonId);
      setLesson({ ...data.lesson, userProgress: data.progress });
      // On navigation (prev/next), don't overwrite the eagerly-set currentIndex
      fetchLessonList(data.lesson.topic, !isNavigation);
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;

    try {
      setCompleting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      if (isCompleted) {
        // Mark as incomplete
        await lessonService.markLessonIncomplete(lesson._id);
        // Update local state
        setLesson({
          ...lesson,
          userProgress: {
            status: 'in-progress',
            progress: lesson.userProgress?.progress || 0,
            timeSpent: lesson.userProgress?.timeSpent || 0
          }
        });
      } else {
        // Mark as complete
        await lessonService.completeLesson(lesson._id, timeSpent);
        // Update local state
        setLesson({
          ...lesson,
          userProgress: {
            status: 'completed',
            progress: 100,
            timeSpent: lesson.userProgress?.timeSpent || timeSpent,
            completedAt: new Date().toISOString()
          }
        });
      }
    } catch (error: any) {
      console.error('Error updating lesson status:', error);
      Alert.alert('Error', 'Failed to update lesson status');
    } finally {
      setCompleting(false);
    }
  };

  const handlePreviousLesson = () => {
    if (currentIndex > 0 && lessonList[currentIndex - 1]) {
      setCurrentIndex(currentIndex - 1);
      isNavigationFetch.current = true;
      setActiveLessonId(lessonList[currentIndex - 1]._id);
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < lessonList.length - 1 && lessonList[currentIndex + 1]) {
      setCurrentIndex(currentIndex + 1);
      isNavigationFetch.current = true;
      setActiveLessonId(lessonList[currentIndex + 1]._id);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: L.bg }]}>
        <ActivityIndicator size="large" color={L.primary} />
        <Text style={[styles.loadingText, { color: L.textLight }]}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: L.bg }]}>
        <Ionicons name="alert-circle-outline" size={64} color={L.textLight} />
        <Text style={[styles.errorText, { color: L.text }]}>Lesson not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCompleted = lesson.userProgress?.status === 'completed';

  return (
    <View style={[styles.container, { backgroundColor: L.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: L.header, borderBottomColor: L.border }]}>
        <TouchableOpacity style={[styles.backIcon, { backgroundColor: L.surface }]} onPress={() => router.replace({
          pathname: '/practice/topic',
          params: { topicName: lesson.topic, mastery },
        })}>
          <Ionicons name="arrow-back" size={24} color={L.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubtitle, { color: L.textLight }]}>{lesson.topic} • {lesson.subtopic}</Text>
          <Text style={[styles.headerTitle, { color: L.text }]}>{lesson.title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.chatIcon, { backgroundColor: L.badgeBg }]}
          onPress={() =>
            router.push({
              pathname: '/practice/lesson-chat',
              params: {
                lessonId: lesson._id,
                lessonTitle: lesson.title,
                topic: lesson.topic,
                subtopic: lesson.subtopic,
              },
            })
          }
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={L.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lesson Info */}
        <View style={[styles.infoCard, { backgroundColor: L.card }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoBadge, { backgroundColor: L.badgeBg }]}>
              <Ionicons name="trending-up" size={16} color={L.primary} />
              <Text style={[styles.infoBadgeText, { color: L.badgeText }]}>{lesson.difficulty}</Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: L.badgeBg }]}>
              <Ionicons name="time-outline" size={16} color={L.primary} />
              <Text style={[styles.infoBadgeText, { color: L.badgeText }]}>{lesson.estimatedTime} min</Text>
            </View>
            {isCompleted && (
              <View style={[styles.infoBadge, styles.completedBadge]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={[styles.infoBadgeText, { color: '#10b981' }]}>Completed</Text>
              </View>
            )}
          </View>
          <MessageRenderer content={lesson.description} textColor={L.textLight} fontSize={14} />
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: L.text }]}>Introduction</Text>
          <MessageRenderer content={lesson.content.introduction} textColor={L.text} fontSize={15} />
        </View>

        {/* Sections */}
        {lesson.content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: L.text }]}>{section.title}</Text>
            <MessageRenderer content={section.content} textColor={L.text} fontSize={15} />

            {section.examples && section.examples.length > 0 && (
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, { color: L.text }]}>Examples:</Text>
                {section.examples.map((example, exIndex) => (
                  <View key={exIndex} style={[styles.exampleCard, { backgroundColor: L.exampleBg, borderLeftColor: L.exampleBorder }]}>
                    <View style={styles.exampleHeader}>
                      <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                      <Text style={[styles.exampleLabel, { color: L.exampleText }]}>Example {exIndex + 1}</Text>
                    </View>
                    <MessageRenderer content={example.problem} textColor={L.exampleBody} fontSize={15} />
                    {example.steps && example.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        <Text style={[styles.stepsTitle, { color: L.exampleText }]}>Solution Steps:</Text>
                        {example.steps.map((step, stepIndex) => (
                          <View key={stepIndex} style={styles.stepRow}>
                            <View style={styles.stepNumber}>
                              <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <MessageRenderer content={step} textColor={L.exampleBody} fontSize={14} />
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={[styles.solutionRow, { borderTopColor: darkMode ? '#854d0e' : '#fcd34d' }]}>
                      <Text style={[styles.solutionLabel, { color: L.exampleText }]}>Answer:</Text>
                      <MessageRenderer content={example.solution} textColor={L.exampleBody} fontSize={15} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: L.text }]}>Summary</Text>
          <MessageRenderer content={lesson.content.summary} textColor={L.text} fontSize={15} />
        </View>

        {/* Key Takeaways */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: L.text }]}>Key Takeaways</Text>
          {lesson.content.keyTakeaways.map((takeaway, index) => (
            <View key={index} style={styles.takeawayRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <View style={{ flex: 1 }}>
                <MessageRenderer content={takeaway} textColor={L.text} fontSize={15} />
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: L.footer }]}>
        <TouchableOpacity
          style={[styles.completeButton, completing && styles.completeButtonDisabled, isCompleted && styles.incompleteButton]}
          onPress={handleCompleteLesson}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name={isCompleted ? "close-circle-outline" : "checkmark-circle-outline"} size={24} color="#ffffff" />
              <Text style={styles.completeButtonText}>
                {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <View style={styles.navButtonsContainer}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: L.navBtnBg }, (currentIndex === 0 || lessonList.length === 0) && styles.navButtonDisabled]}
            onPress={handlePreviousLesson}
            disabled={currentIndex === 0 || lessonList.length === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={(currentIndex === 0 || lessonList.length === 0) ? L.textLight : L.primary} />
            <Text style={[styles.navButtonText, { color: (currentIndex === 0 || lessonList.length === 0) ? L.textLight : L.primary }]}>Previous</Text>
          </TouchableOpacity>
          <Text style={[styles.navIndicator, { color: L.textLight }]}>
            {lessonList.length > 0 ? `${currentIndex + 1} / ${lessonList.length}` : '—'}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: L.navBtnBg }, (currentIndex >= lessonList.length - 1 || lessonList.length === 0) && styles.navButtonDisabled]}
            onPress={handleNextLesson}
            disabled={currentIndex >= lessonList.length - 1 || lessonList.length === 0}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, { color: (currentIndex >= lessonList.length - 1 || lessonList.length === 0) ? L.textLight : L.primary }]}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={(currentIndex >= lessonList.length - 1 || lessonList.length === 0) ? L.textLight : L.primary} />
          </TouchableOpacity>
        </View>
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
    paddingBottom: 20,
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
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e2dfff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b41e1',
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  examplesContainer: {
    marginTop: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  exampleCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  exampleProblem: {
    fontSize: 15,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 12,
  },
  stepsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  solutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fcd34d',
  },
  solutionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  solutionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#78350f',
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  takeawayText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingBottom: 50, // Extra padding for tab bar
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    borderTopColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4b41e1',
    paddingVertical: 16,
    borderRadius: 16,
  },
  incompleteButton: {
    backgroundColor: '#64748b', // Gray color for incomplete
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainer,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  navIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
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
