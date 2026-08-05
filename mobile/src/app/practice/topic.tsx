import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';

type TabType = 'lessons' | 'practice';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface PracticeSet {
  id: string;
  title: string;
  problems: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: number;
}

export default function TopicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<TabType>('lessons');
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  
  const topicName = params.topicName as string;
  const mastery = parseInt(params.mastery as string) || 0;

  useEffect(() => {
    loadTopicData();
  }, [topicName]);

  // Reload data when screen comes back into focus (e.g., after completing practice)
  useFocusEffect(
    useCallback(() => {
      loadTopicData();
    }, [topicName])
  );

  const loadTopicData = async () => {
    try {
      setLoading(true);
      
      // Load lessons for this topic
      const lessonsResponse = await lessonService.getLessons(topicName);
      const apiLessons = lessonsResponse.lessons;
      
      // Transform API lessons to component format
      const transformedLessons: Lesson[] = apiLessons.map((lesson: any, index: number) => ({
        id: lesson._id,
        title: lesson.title,
        duration: `${lesson.estimatedTime} min`,
        completed: lesson.userProgress?.status === 'completed',
        locked: lesson.isLocked,
      }));
      
      setLessons(transformedLessons);

      // Build static practice sets for the topic — problems are generated on-demand
      // when the user taps a set (via the generator endpoint)
      setPracticeSets([
        {
          id: 'basic',
          title: 'Basic Equations Practice',
          problems: 5,
          difficulty: 'Easy',
          completed: 0,
        },
        {
          id: 'intermediate',
          title: 'Intermediate Problems',
          problems: 5,
          difficulty: 'Medium',
          completed: 0,
        },
        {
          id: 'advanced',
          title: 'Advanced Challenge Set',
          problems: 5,
          difficulty: 'Hard',
          completed: 0,
        },
        {
          id: 'mixed',
          title: 'Mixed Review',
          problems: 15,
          difficulty: 'Medium',
          completed: 0,
        },
      ]);
    } catch (error) {
      console.error('Error loading topic data:', error);
      // Fallback to empty arrays
      setLessons([]);
      setPracticeSets([]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#00a472';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return Colors.textLight;
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.locked) return;
    router.push({
      pathname: '/practice/lesson',
      params: {
        lessonId: lesson.id,
        topicName: topicName,
        mastery: mastery.toString(),
      }
    });
  };

  const handlePracticePress = (practice: PracticeSet) => {
    const categoryMap: Record<string, string> = {
      basic: 'basic',
      intermediate: 'intermediate',
      advanced: 'advanced',
      mixed: 'mixed',
    };
    router.push({
      pathname: '/practice/problems',
      params: {
        category: categoryMap[practice.id] ?? 'mixed',
        difficulty: practice.difficulty,
        title: practice.title,
        topic: topicName,
        count: practice.problems.toString(),
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: Colors.textLight }}>
          Loading {topicName}...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/practice')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topicName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Topic Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mastery}%</Text>
          <Text style={styles.statLabel}>Mastery</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lessons.filter(l => l.completed).length}/{lessons.length}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {practiceSets.reduce((acc, p) => acc + p.completed, 0)}
          </Text>
          <Text style={styles.statLabel}>Problems Solved</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'lessons' && styles.tabActive]}
          onPress={() => setSelectedTab('lessons')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="book" 
            size={20} 
            color={selectedTab === 'lessons' ? Colors.primary : Colors.textLight}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'lessons' && styles.tabTextActive
          ]}>
            Lessons
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'practice' && styles.tabActive]}
          onPress={() => setSelectedTab('practice')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="create" 
            size={20} 
            color={selectedTab === 'practice' ? Colors.primary : Colors.textLight}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'practice' && styles.tabTextActive
          ]}>
            Practice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'lessons' ? (
          <View style={styles.contentSection}>
            {lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonCard,
                  lesson.locked && styles.lessonCardLocked
                ]}
                onPress={() => handleLessonPress(lesson)}
                activeOpacity={lesson.locked ? 1 : 0.7}
                disabled={lesson.locked}
              >
                <View style={styles.lessonNumber}>
                  {lesson.completed ? (
                    <Ionicons name="checkmark-circle" size={24} color="#00a472" />
                  ) : lesson.locked ? (
                    <Ionicons name="lock-closed" size={20} color={Colors.textLight} />
                  ) : (
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  )}
                </View>

                <View style={styles.lessonContent}>
                  <Text style={[
                    styles.lessonTitle,
                    lesson.locked && styles.lessonTitleLocked
                  ]}>
                    {lesson.title}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <Ionicons name="time-outline" size={14} color={Colors.textLight} />
                    <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                  </View>
                </View>

                {!lesson.locked && (
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.contentSection}>
            {practiceSets.map((practice) => {
              const completionPercent = (practice.completed / practice.problems) * 100;
              
              return (
                <TouchableOpacity
                  key={practice.id}
                  style={styles.practiceCard}
                  onPress={() => handlePracticePress(practice)}
                  activeOpacity={0.7}
                >
                  <View style={styles.practiceHeader}>
                    <View style={styles.practiceInfo}>
                      <Text style={styles.practiceTitle}>{practice.title}</Text>
                      <View style={styles.practiceMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="help-circle-outline" size={14} color={Colors.textLight} />
                          <Text style={styles.metaText}>{practice.problems} problems</Text>
                        </View>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(practice.difficulty) + '20' }
                        ]}>
                          <Text style={[
                            styles.difficultyText,
                            { color: getDifficultyColor(practice.difficulty) }
                          ]}>
                            {practice.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                  </View>

                  {/* Progress */}
                  {practice.completed > 0 && (
                    <View style={styles.practiceProgress}>
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressText}>
                          {practice.completed}/{practice.problems} completed
                        </Text>
                        <Text style={styles.progressPercent}>
                          {Math.round(completionPercent)}%
                        </Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View 
                          style={[
                            styles.progressBar,
                            { 
                              width: `${completionPercent}%`,
                              backgroundColor: getDifficultyColor(practice.difficulty)
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 75 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.surfaceContainer,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  contentSection: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: Colors.textLight,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDuration: {
    fontSize: 13,
    color: Colors.textLight,
  },
  practiceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceInfo: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  practiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  practiceProgress: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
