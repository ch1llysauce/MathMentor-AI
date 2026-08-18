import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import diagnosticService from '@/services/diagnosticService';
import { lessonService } from '@/services/lessonService';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import api from '@/services/api';
import { PRACTICE_ENDPOINTS } from '@/constants/api';
import { practiceCache } from '@/utils/tabCache';
import { offlineCacheService } from '@/services/offlineCache';

// Module-level cache so tab re-focuses don't re-fetch from scratch
// (Imported from tabCache so logout can clear it centrally)
const _cachedTopics = practiceCache;

type TopicFilter = 'all' | 'weak' | 'strong';

interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  lessons: number;
  problems: number;
  mastery: number;
  subtopics: string[];
}

const blendColors = (baseHex: string, tintHex: string, amount: number) => {
  const c1 = baseHex.replace('#', '');
  const c2 = tintHex.replace('#', '');
  
  const r1 = parseInt(c1.substring(0, 2), 16) || 0;
  const g1 = parseInt(c1.substring(2, 4), 16) || 0;
  const b1 = parseInt(c1.substring(4, 6), 16) || 0;
  
  const r2 = parseInt(c2.substring(0, 2), 16) || 0;
  const g2 = parseInt(c2.substring(2, 4), 16) || 0;
  const b2 = parseInt(c2.substring(4, 6), 16) || 0;

  const r = Math.round(r1 * (1 - amount) + r2 * amount);
  const g = Math.round(g1 * (1 - amount) + g2 * amount);
  const b = Math.round(b1 * (1 - amount) + b2 * amount);

  return `rgb(${r}, ${g}, ${b})`;
};

export default function PracticeScreen() {
  const router = useRouter();
  const { darkMode, primaryColor } = useTheme();

  const P = {
    bg: darkMode ? '#0a0a0a' : Colors.background,
    card: darkMode ? '#1a1a1a' : Colors.white,
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    primary: primaryColor || (darkMode ? '#a5b4fc' : Colors.primary),
    secondary: primaryColor || (darkMode ? '#a5b4fc' : Colors.secondary),
    border: darkMode ? '#2e2e2e' : Colors.border,
    surface: darkMode ? '#242424' : Colors.surfaceContainer,
    chipBg: darkMode ? '#1a1a1a' : Colors.white,
    chipActiveBg: primaryColor || (darkMode ? '#312e81' : Colors.primary),
    chipActiveText: '#ffffff',
    inputBg: darkMode ? '#1a1a1a' : Colors.white,
    tagBg: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TopicFilter>('all');
  const [loading, setLoading] = useState(!_cachedTopics.topics);
  const [userMastery, setUserMastery] = useState<any>(_cachedTopics.mastery);
  const [topics, setTopics] = useState<Topic[]>(_cachedTopics.topics ?? []);

  // ── Daily Challenge ─────────────────────────────────────────────────────────
  const DAILY_TOPICS = ['algebra', 'geometry', 'trigonometry'];
  const dailyTopicIndex =
    (new Date().getDate() + new Date().getMonth() * 3) % DAILY_TOPICS.length;
  const dailyTopic     = DAILY_TOPICS[dailyTopicIndex];
  const dailyTopicLabel = dailyTopic.charAt(0).toUpperCase() + dailyTopic.slice(1);
  const [dailyDone, setDailyDone] = useState(false);
  const [dailyScore, setDailyScore] = useState<{ score: number; total: number } | null>(null);

  const checkDailyStatus = async () => {
    try {
      const res = await api.get(PRACTICE_ENDPOINTS.DAILY_STATUS);
      const data = res.data?.data;
      setDailyDone(data?.done ?? false);
      if (data?.done && data.score !== null && data.total !== null) {
        setDailyScore({ score: data.score, total: data.total });
      } else {
        setDailyScore(null);
      }
    } catch {
      const cachedDaily = await offlineCacheService.getOfflineDailyStatus();
      if (cachedDaily) {
        setDailyDone(cachedDaily.done ?? false);
        if (cachedDaily.done && cachedDaily.score !== null && cachedDaily.total !== null) {
          setDailyScore({ score: cachedDaily.score, total: cachedDaily.total });
        } else {
          setDailyScore(null);
        }
      } else {
        setDailyDone(false);
        setDailyScore(null);
      }
    }
  };

  const handleDailyChallenge = () => {
    router.push({
      pathname: '/practice/problems',
      params: {
        topic:    dailyTopic,
        category: 'mixed',
        count:    '10',
        title:    `Daily Challenge — ${dailyTopicLabel}`,
        isDaily:  'true',
      },
    });
  };

  useEffect(() => {
    if (!_cachedTopics.topics) loadData();
  }, []);

      // Silently refresh when tab is re-focused (e.g. returning from topic screen)
  useFocusEffect(
    useCallback(() => {
      // Always re-check daily challenge completion on focus (server-side)
      checkDailyStatus();
      if (_cachedTopics.topics) loadData(true);
    }, [])
  );

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Load user diagnostic data for mastery scores
      let diagnosticData = null;
      try {
        const response = await diagnosticService.getLatestDiagnostic();
        diagnosticData = response.data.diagnostic;
        setUserMastery(diagnosticData);
      } catch (error) {
        console.log('No live diagnostic data available, checking offline cache');
        const cachedProgress = await offlineCacheService.getOfflineUserProgress();
        if (cachedProgress) {
          diagnosticData = cachedProgress.diagnostic || cachedProgress;
          setUserMastery(diagnosticData);
        }
      }

      // Load all lessons to build topic list
      try {
        const lessonsResponse = await lessonService.getLessons();
        const lessons = lessonsResponse.lessons;

        // Group lessons by topic and build topic list
        const topicMap = new Map<string, any>();
        
        lessons.forEach((lesson: any) => {
          const topicName = lesson.topic;
          
          if (!topicMap.has(topicName)) {
            topicMap.set(topicName, {
              name: topicName,
              subtopics: new Set<string>(),
              lessons: [],
              problemCount: 0,
            });
          }
          
          const topic = topicMap.get(topicName);
          topic.subtopics.add(lesson.subtopic);
          topic.lessons.push(lesson);
          topic.problemCount += lesson.problemCount || 0;
        });

        // Convert map to array with proper structure
        const topicsArray: Topic[] = Array.from(topicMap.values()).map((topic, index) => {
          // Get mastery score from diagnostic data
          let mastery = 0;
          if (diagnosticData) {
            const topicLower = topic.name.toLowerCase();
            if (topicLower === 'algebra') mastery = diagnosticData.algebraScore || 0;
            else if (topicLower === 'geometry') mastery = diagnosticData.geometryScore || 0;
            else if (topicLower === 'trigonometry') mastery = diagnosticData.trigonometryScore || 0;
          }

          // Assign icon and color
          let icon = 'book';
          let color = '#4b41e1';
          const topicLower = topic.name.toLowerCase();
          if (topicLower === 'algebra') {
            icon = 'calculator';
            color = '#2563eb';
          } else if (topicLower === 'geometry') {
            icon = 'shapes';
            color = '#00a472';
          } else if (topicLower === 'trigonometry') {
            icon = 'analytics';
            color = '#f59e0b';
          }

          return {
            id: (index + 1).toString(),
            name: topic.name,
            icon,
            color,
            lessons: topic.lessons.length,
            problems: topic.problemCount || 0,
            mastery,
            subtopics: Array.from(topic.subtopics),
          };
        });

        setTopics(topicsArray);
        _cachedTopics.topics = topicsArray;
        _cachedTopics.mastery = diagnosticData;
      } catch (error) {
        console.error('Error loading lessons:', error);
        // Fallback to default topics
        setTopics([
          {
            id: '1',
            name: 'Algebra',
            icon: 'calculator',
            color: '#2563eb',
            lessons: 0,
            problems: 0,
            mastery: diagnosticData?.algebraScore || 0,
            subtopics: ['Linear Equations', 'Quadratic Equations'],
          },
          {
            id: '2',
            name: 'Geometry',
            icon: 'shapes',
            color: '#00a472',
            lessons: 0,
            problems: 0,
            mastery: diagnosticData?.geometryScore || 0,
            subtopics: ['Triangles', 'Circles'],
          },
          {
            id: '3',
            name: 'Trigonometry',
            icon: 'analytics',
            color: '#f59e0b',
            lessons: 0,
            problems: 0,
            mastery: diagnosticData?.trigonometryScore || 0,
            subtopics: ['Sine & Cosine', 'Identities'],
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading practice data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subtopics.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'weak') return matchesSearch && topic.mastery < 70;
    if (selectedFilter === 'strong') return matchesSearch && topic.mastery >= 80;
    return matchesSearch;
  });

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 80) return { label: 'Expert', color: '#00a472' };
    if (mastery >= 60) return { label: 'Proficient', color: '#f59e0b' };
    return { label: 'Learning', color: '#ef4444' };
  };

  const handleTopicPress = (topic: Topic) => {
    router.push({
      pathname: '/practice/topic',
      params: { 
        topicId: topic.id,
        topicName: topic.name,
        mastery: topic.mastery.toString(),
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: P.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={P.secondary} />
          <Text style={[styles.loadingText, { color: P.textLight }]}>Loading topics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: P.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: P.text }]}>Practice</Text>
            <Text style={[styles.subtitle, { color: P.textLight }]}>Choose a topic to master</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: P.inputBg }]}>
          <Ionicons name="search" size={20} color={P.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: P.text }]}
            placeholder="Search topics or subtopics..."
            placeholderTextColor={P.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={P.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: P.chipBg, borderColor: P.border }, selectedFilter === 'all' && { backgroundColor: P.chipActiveBg, borderColor: P.chipActiveBg }]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterChipText, { color: P.text }, selectedFilter === 'all' && { color: P.chipActiveText }]}>
              All Topics
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: P.chipBg, borderColor: P.border }, selectedFilter === 'weak' && { backgroundColor: P.chipActiveBg, borderColor: P.chipActiveBg }]}
            onPress={() => setSelectedFilter('weak')}
          >
            <Ionicons 
              name="arrow-down" 
              size={14} 
              color={selectedFilter === 'weak' ? P.chipActiveText : P.textLight}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterChipText, { color: P.text }, selectedFilter === 'weak' && { color: P.chipActiveText }]}>
              Need Practice
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: P.chipBg, borderColor: P.border }, selectedFilter === 'strong' && { backgroundColor: P.chipActiveBg, borderColor: P.chipActiveBg }]}
            onPress={() => setSelectedFilter('strong')}
          >
            <Ionicons 
              name="arrow-up" 
              size={14} 
              color={selectedFilter === 'strong' ? P.chipActiveText : P.textLight}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterChipText, { color: P.text }, selectedFilter === 'strong' && { color: P.chipActiveText }]}>
              Strong Areas
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Topics List */}
        <View style={styles.topicsList}>
          {filteredTopics.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color={P.textLight} />
              <Text style={[styles.emptyText, { color: P.text }]}>No topics found</Text>
              <Text style={[styles.emptySubtext, { color: P.textLight }]}>Try adjusting your search or filter</Text>
            </View>
          ) : (
            filteredTopics.map((topic) => {
              const masteryInfo = getMasteryLabel(topic.mastery);
              const cardGradientColors: [string, string] = [
                P.card,
                blendColors(P.card, topic.color, darkMode ? 0.22 : 0.08)
              ];
              const circleGradientColors: [string, string] = [
                blendColors(P.card, topic.color, darkMode ? 0.35 : 0.18),
                blendColors(P.card, topic.color, darkMode ? 0.12 : 0.05)
              ];

              return (
                <TouchableOpacity
                  key={topic.id}
                  onPress={() => handleTopicPress(topic)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={cardGradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.topicCard, { borderColor: blendColors(P.card, topic.color, darkMode ? 0.40 : 0.25), borderWidth: 1 }]}
                  >
                    {/* Topic Header */}
                    <View style={styles.topicHeader}>
                      <LinearGradient
                        colors={circleGradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.topicIcon, { borderColor: blendColors(P.card, topic.color, darkMode ? 0.45 : 0.30), borderWidth: 1 }]}
                      >
                        <Ionicons name={topic.icon as any} size={30} color={topic.color} />
                      </LinearGradient>
                      
                      <View style={styles.topicInfo}>
                        <Text style={[styles.topicName, { color: P.text }]}>{topic.name}</Text>
                        <View style={styles.topicMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="book-outline" size={14} color={P.textLight} />
                            <Text style={[styles.metaText, { color: P.textLight }]}>{topic.lessons} lessons</Text>
                          </View>
                        </View>
                      </View>
                      
                      <Ionicons name="chevron-forward" size={20} color={P.textLight} />
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { color: P.textLight }]}>Mastery Level</Text>
                        <View style={styles.masteryBadge}>
                          <Text style={[styles.masteryText, { color: masteryInfo.color }]}>
                            {masteryInfo.label}
                          </Text>
                          <Text style={[styles.masteryPercent, { color: P.text }]}>{topic.mastery}%</Text>
                        </View>
                      </View>
                      <View style={[styles.progressBarContainer, { backgroundColor: P.surface }]}>
                        <View 
                          style={[
                            styles.progressBar,
                            { 
                              width: `${topic.mastery}%`,
                              backgroundColor: masteryInfo.color
                            }
                          ]} 
                        />
                      </View>
                    </View>

                    {/* Subtopics */}
                    <View style={[styles.subtopicsSection, { borderTopColor: P.surface }]}>
                      <Text style={[styles.subtopicsLabel, { color: P.text }]}>Key Subtopics:</Text>
                      <View style={styles.subtopicsContainer}>
                        {topic.subtopics.slice(0, 3).map((subtopic, index) => (
                          <View key={index} style={[styles.subtopicTag, { backgroundColor: P.tagBg }]}>
                            <Text style={[styles.subtopicText, { color: P.text }]}>{subtopic}</Text>
                          </View>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <View style={[styles.subtopicTag, { backgroundColor: P.tagBg }]}>
                            <Text style={[styles.subtopicText, { color: P.text }]}>+{topic.subtopics.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.quickActionsTitle, { color: P.text }]}>Quick Actions</Text>

          {(() => {
            const actionColor = dailyDone ? '#00a472' : '#f59e0b';
            const actionCardColors: [string, string] = [
              P.card,
              blendColors(P.card, actionColor, darkMode ? 0.22 : 0.08)
            ];
            const actionCircleColors: [string, string] = [
              blendColors(P.card, actionColor, darkMode ? 0.35 : 0.18),
              blendColors(P.card, actionColor, darkMode ? 0.12 : 0.05)
            ];

            return (
              <TouchableOpacity
                onPress={dailyDone ? undefined : handleDailyChallenge}
                activeOpacity={dailyDone ? 1 : 0.8}
                disabled={dailyDone}
              >
                <LinearGradient
                  colors={actionCardColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.actionCard,
                    { borderColor: blendColors(P.card, actionColor, darkMode ? 0.40 : 0.25), borderWidth: 1 },
                    dailyDone && styles.actionCardDone,
                  ]}
                >
                  <LinearGradient
                    colors={actionCircleColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.actionIcon, { borderColor: blendColors(P.card, actionColor, darkMode ? 0.45 : 0.30), borderWidth: 1 }]}
                  >
                    <Ionicons
                      name={dailyDone ? 'checkmark-circle' : 'trophy'}
                      size={26}
                      color={actionColor}
                    />
                  </LinearGradient>
                  <View style={styles.actionContent}>
                    <View style={styles.actionTitleRow}>
                      <Text style={[styles.actionTitle, { color: P.text }]}>Daily Challenge</Text>
                      {dailyDone && dailyScore && (
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreBadgeText}>
                            {dailyScore.score}/{dailyScore.total}
                          </Text>
                        </View>
                      )}
                      {dailyDone && !dailyScore && (
                        <View style={styles.doneBadge}>
                          <Text style={styles.doneBadgeText}>Done ✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.actionSubtitle, { color: P.textLight }]}>
                      {dailyDone
                        ? dailyScore
                          ? `Score: ${dailyScore.score}/${dailyScore.total} · Come back tomorrow!`
                          : 'Come back tomorrow for a new challenge!'
                        : `Today: ${dailyTopicLabel} — 10 mixed problems`}
                    </Text>
                  </View>
                  {dailyDone ? (
                    <Ionicons name="lock-closed" size={18} color="#00a472" />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={P.textLight} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })()}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    lineHeight: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  topicsList: {
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  topicCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  topicIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  topicMeta: {
    flexDirection: 'row',
    gap: 16,
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
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },
  masteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  masteryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  masteryPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  subtopicsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  subtopicsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  subtopicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subtopicTag: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subtopicText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardDone: {
    borderWidth: 1,
    borderColor: '#00a472',
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  doneBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  doneBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00a472',
  },
  scoreBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00a472',
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00a472',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
