import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';
import { Lesson } from '@/types/lesson';

export default function LessonScreen() {
  const { lessonId, topicName, mastery } = useLocalSearchParams<{
    lessonId: string;
    topicName?: string;
    mastery?: string;
  }>();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());
  const [lessonList, setLessonList] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  useFocusEffect(
    useCallback(() => {
      if (lesson) {
        fetchLessonList(lesson.topic);
      }
    }, [lesson])
  );

  const fetchLessonList = async (topic: string) => {
    try {
      const data = await lessonService.getLessons(topic);
      const lessons = data.lessons;
      setLessonList(lessons);
      const idx = lessons.findIndex(l => l._id === lessonId);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    } catch (error) {
      console.error('Error fetching lesson list:', error);
    }
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const data = await lessonService.getLesson(lessonId);
      setLesson({ ...data.lesson, userProgress: data.progress });
      fetchLessonList(data.lesson.topic);
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
      await lessonService.completeLesson(lesson._id, timeSpent);
      
      Alert.alert(
        'Lesson Complete! 🎉',
        'Great job! You\'ve completed this lesson.',
        [
          {
            text: 'Practice Problems',
            onPress: () => router.push(`/practice/problems?lessonId=${lesson._id}&topic=${lesson.topic}&mastery=${mastery}`),
          },
          {
            text: 'Back to Practice',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const handlePreviousLesson = () => {
    if (currentIndex > 0 && lessonList[currentIndex - 1]) {
      const prevLesson = lessonList[currentIndex - 1];
      router.replace(`/practice/lesson?lessonId=${prevLesson._id}`);
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < lessonList.length - 1 && lessonList[currentIndex + 1]) {
      const nextLesson = lessonList[currentIndex + 1];
      router.replace(`/practice/lesson?lessonId=${nextLesson._id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b41e1" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textLight} />
        <Text style={styles.errorText}>Lesson not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCompleted = lesson.userProgress?.status === 'completed';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.replace({
    pathname: '/practice/topic',
    params: { topicName: lesson.topic, mastery },
  })}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>{lesson.topic} • {lesson.subtopic}</Text>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Ionicons name="trending-up" size={16} color="#4b41e1" />
              <Text style={styles.infoBadgeText}>{lesson.difficulty}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Ionicons name="time-outline" size={16} color="#4b41e1" />
              <Text style={styles.infoBadgeText}>{lesson.estimatedTime} min</Text>
            </View>
            {isCompleted && (
              <View style={[styles.infoBadge, styles.completedBadge]}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={[styles.infoBadgeText, { color: '#10b981' }]}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{lesson.description}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.sectionContent}>{lesson.content.introduction}</Text>
        </View>

        {/* Sections */}
        {lesson.content.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>

            {/* Examples */}
            {section.examples && section.examples.length > 0 && (
              <View style={styles.examplesContainer}>
                <Text style={styles.examplesTitle}>Examples:</Text>
                {section.examples.map((example, exIndex) => (
                  <View key={exIndex} style={styles.exampleCard}>
                    <View style={styles.exampleHeader}>
                      <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                      <Text style={styles.exampleLabel}>Example {exIndex + 1}</Text>
                    </View>
                    <Text style={styles.exampleProblem}>{example.problem}</Text>
                    
                    {example.steps && example.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>Solution Steps:</Text>
                        {example.steps.map((step, stepIndex) => (
                          <View key={stepIndex} style={styles.stepRow}>
                            <View style={styles.stepNumber}>
                              <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    <View style={styles.solutionRow}>
                      <Text style={styles.solutionLabel}>Answer:</Text>
                      <Text style={styles.solutionText}>{example.solution}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionContent}>{lesson.content.summary}</Text>
        </View>

        {/* Key Takeaways */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Takeaways</Text>
          {lesson.content.keyTakeaways.map((takeaway, index) => (
            <View key={index} style={styles.takeawayRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.takeawayText}>{takeaway}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

{/* Footer */}
      <View style={styles.footer}>
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.completeButton, completing && styles.completeButtonDisabled]}
            onPress={handleCompleteLesson}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.completeButtonText}>Mark as Complete</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.navButtonsContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousLesson}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={currentIndex === 0 ? Colors.textLight : Colors.primary} />
            <Text style={[styles.navButtonText, currentIndex === 0 && { color: Colors.textLight }]}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.navIndicator}>
            {currentIndex + 1} / {lessonList.length}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, currentIndex >= lessonList.length - 1 && styles.navButtonDisabled]}
            onPress={handleNextLesson}
            disabled={currentIndex >= lessonList.length - 1}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, currentIndex >= lessonList.length - 1 ? { color: Colors.textLight } : { color: Colors.primary }]}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={currentIndex >= lessonList.length - 1 ? Colors.textLight : Colors.primary} />
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
    padding: 24,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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
