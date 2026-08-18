import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { lessonService } from '@/services/lessonService';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';

type TabType = 'lessons' | 'practice';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  subtopic: string;
}

interface PracticeSet {
  id: string;
  title: string;
  problems: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: number;
}

// Per-topic cache keyed by topic name
const _topicCache = new Map<string, Lesson[]>();

const PRACTICE_SETS: PracticeSet[] = [
  { id: 'basic',        title: 'Basic Equations Practice',  problems: 5,  difficulty: 'Easy',   completed: 0 },
  { id: 'intermediate', title: 'Intermediate Problems',      problems: 5,  difficulty: 'Medium', completed: 0 },
  { id: 'advanced',     title: 'Advanced Challenge Set',     problems: 5,  difficulty: 'Hard',   completed: 0 },
  { id: 'mixed',        title: 'Mixed Review',               problems: 15, difficulty: 'Medium', completed: 0 },
];

const TOPIC_COLORS: Record<string, string> = {
  Algebra: '#2563eb',
  Geometry: '#00a472',
  Trigonometry: '#f59e0b',
};

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

export default function TopicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { darkMode, primaryColor } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const T = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e2e8f0',
    text: darkMode ? '#f0f0f0' : Colors.text,
    textLight: darkMode ? '#a0a0a0' : Colors.textLight,
    primary: primaryColor || (darkMode ? '#a5b4fc' : Colors.primary),
    card: darkMode ? '#1a1a1a' : Colors.white,
    surface: darkMode ? '#2e2e2e' : Colors.surfaceContainer,
    tabBg: darkMode ? '#242424' : Colors.surfaceContainerLow,
    tabActive: darkMode ? '#1a1a1a' : Colors.white,
    backIcon: darkMode ? '#2a2a2a' : Colors.surface,
  };
  const topicName = params.topicName as string;
  const mastery = parseInt(params.mastery as string) || 0;
  const subtopicFilterParam = (params.subtopicFilter as string) || '';
  const topicColor = TOPIC_COLORS[topicName] || T.primary;

  const [selectedTab, setSelectedTab] = useState<TabType>('lessons');
  // Always start as loading when there's no cache so the unfiltered "All"
  // view never flashes before the subtopic filter can be applied.
  const [loading, setLoading] = useState(!_topicCache.has(topicName));
  const [lessons, setLessons] = useState<Lesson[]>(_topicCache.get(topicName) ?? []);
  const [practiceSets] = useState<PracticeSet[]>(PRACTICE_SETS);
  const [searchQuery, setSearchQuery] = useState('');
  const didApplyFilter = useRef(false);

  // Compute initial selectedModule eagerly from cache so the filter is applied
  // instantly, without waiting for the async fetch to complete.
  const getInitialModule = (): string | null => {
    if (!subtopicFilterParam) return null;
    const cached = _topicCache.get(topicName);
    if (!cached || cached.length === 0) return null;
    const allModules = Array.from(new Set(cached.map((l: Lesson) => l.subtopic)));
    return allModules.find((mod: string) =>
      mod === subtopicFilterParam ||
      mod.toLowerCase().includes(subtopicFilterParam.toLowerCase()) ||
      subtopicFilterParam.toLowerCase().includes(mod.toLowerCase())
    ) ?? null;
  };

  const [selectedModule, setSelectedModule] = useState<string | null>(getInitialModule);

  // On mount: load data (skip blocking fetch if cache exists) and apply filter once
  useEffect(() => {
    // If we already applied the filter from cache, mark it done
    didApplyFilter.current = getInitialModule() !== null || !subtopicFilterParam;
    loadTopicData(!_topicCache.has(topicName) ? false : true);
  }, [topicName]);

  // On re-focus (e.g. returning from a lesson): silently refresh
  useFocusEffect(
    useCallback(() => {
      if (didApplyFilter.current) loadTopicData(true);
    }, [topicName])
  );

  const loadTopicData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const lessonsResponse = await lessonService.getLessons(topicName);
      const transformedLessons: Lesson[] = lessonsResponse.lessons.map((lesson: any) => ({
        id: lesson._id,
        title: lesson.title,
        duration: `${lesson.estimatedTime} min`,
        completed: lesson.userProgress?.status === 'completed',
        locked: lesson.isLocked,
        subtopic: lesson.subtopic ?? '',
      }));

      setLessons(transformedLessons);
      _topicCache.set(topicName, transformedLessons);

      if (!didApplyFilter.current && subtopicFilterParam) {
        const allModules = Array.from(new Set(transformedLessons.map(l => l.subtopic)));
        const matchingModule = allModules.find(mod =>
          mod === subtopicFilterParam ||
          mod.toLowerCase().includes(subtopicFilterParam.toLowerCase()) ||
          subtopicFilterParam.toLowerCase().includes(mod.toLowerCase())
        );
        if (matchingModule) setSelectedModule(matchingModule);
        else setSelectedTab('practice');
      }
      didApplyFilter.current = true;
    } catch (error) {
      console.error('Error loading topic data:', error);
      if (!silent) { setLessons([]); }
    } finally {
      if (!silent) setLoading(false);
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

  // Derived: unique module names for the filter chips
  const moduleNames = Array.from(new Set(lessons.map(l => l.subtopic))).filter(Boolean);

  // Derived: filtered lesson list
  const filteredLessons = lessons.filter(l => {
    const matchesSearch = searchQuery.trim() === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === null || l.subtopic === selectedModule;
    return matchesSearch && matchesModule;
  });

  // Derived: per-module completion map  { moduleName -> { total, completed } }
  const moduleCompletionMap = moduleNames.reduce<Record<string, { total: number; completed: number }>>((acc, mod) => {
    const modLessons = lessons.filter(l => l.subtopic === mod);
    acc[mod] = {
      total: modLessons.length,
      completed: modLessons.filter(l => l.completed).length,
    };
    return acc;
  }, {});

  // Derived: is the currently selected module fully done?
  const activeModule = selectedModule ?? (moduleNames.length === 1 ? moduleNames[0] : null);
  const activeModuleStats = activeModule ? moduleCompletionMap[activeModule] : null;
  const activeModuleDone = activeModuleStats
    ? activeModuleStats.total > 0 && activeModuleStats.completed === activeModuleStats.total
    : false;

  // Derived: next incomplete module after the active one (or first incomplete if no active)
  const nextIncompleteModule = (() => {
    const startIdx = activeModule ? moduleNames.indexOf(activeModule) + 1 : 0;
    // look from startIdx forward, then wrap around
    const ordered = [...moduleNames.slice(startIdx), ...moduleNames.slice(0, startIdx)];
    return ordered.find(mod => {
      const stats = moduleCompletionMap[mod];
      return stats && stats.completed < stats.total;
    }) ?? null;
  })();

  // Friendly label: strip the "Module N: " prefix for display
  const moduleLabel = (mod: string) => mod.includes(': ') ? mod.split(': ')[1] : mod;

  const handleGoToNextModule = () => {
    if (!nextIncompleteModule) return;
    setSelectedModule(nextIncompleteModule);
    setSearchQuery('');
    // Scroll back to top so the user sees the newly filtered list
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 50);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.primary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: T.textLight }}>
          Loading {topicName}...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={T.header} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.header, borderBottomColor: T.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/practice')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: T.text }]}>{topicName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Topic Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: T.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: T.primary }]}>{mastery}%</Text>
          <Text style={[styles.statLabel, { color: T.textLight }]}>Mastery</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: T.surface }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: T.primary }]}>
            {lessons.length > 0
              ? `${lessons.filter(l => l.completed).length}/${lessons.length}`
              : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: T.textLight }]}>Lessons</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: T.tabBg }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'lessons' && [styles.tabActive, { backgroundColor: T.tabActive }]]}
          onPress={() => setSelectedTab('lessons')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="book" 
            size={20} 
            color={selectedTab === 'lessons' ? T.primary : T.textLight}
          />
          <Text style={[styles.tabText, { color: T.textLight }, selectedTab === 'lessons' && { color: T.primary, fontWeight: '600' }]}>
            Lessons
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'practice' && [styles.tabActive, { backgroundColor: T.tabActive }]]}
          onPress={() => setSelectedTab('practice')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="create" 
            size={20} 
            color={selectedTab === 'practice' ? T.primary : T.textLight}
          />
          <Text style={[styles.tabText, { color: T.textLight }, selectedTab === 'practice' && { color: T.primary, fontWeight: '600' }]}>
            Practice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sticky search bar + module chips — lessons tab only */}
      {selectedTab === 'lessons' && (
        <View style={[styles.stickyFilters, { backgroundColor: T.bg, borderBottomColor: T.border }]}>
          {/* Search bar */}
          <View style={[styles.searchContainer, { backgroundColor: T.card, borderColor: T.border }]}>
            <Ionicons name="search-outline" size={18} color={T.textLight} />
            <TextInput
              style={[styles.searchInput, { color: T.text }]}
              placeholder="Search lessons..."
              placeholderTextColor={T.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={T.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Module filter chips */}
          {moduleNames.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: T.surface, borderColor: T.border },
                  selectedModule === null && { backgroundColor: T.primary, borderColor: T.primary },
                ]}
                onPress={() => setSelectedModule(null)}
              >
                <Text style={[
                  styles.chipText,
                  { color: T.textLight },
                  selectedModule === null && { color: '#ffffff' },
                ]}>All</Text>
              </TouchableOpacity>
              {moduleNames.map(mod => {
                const label = mod.includes(': ') ? mod.split(': ')[1] : mod;
                const active = selectedModule === mod;
                return (
                  <TouchableOpacity
                    key={mod}
                    style={[
                      styles.chip,
                      { backgroundColor: T.surface, borderColor: T.border },
                      active && { backgroundColor: T.primary, borderColor: T.primary },
                    ]}
                    onPress={() => setSelectedModule(active ? null : mod)}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: T.textLight },
                      active && { color: '#ffffff' },
                    ]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'lessons' ? (
          <View style={styles.contentSection}>
            {/* Results count */}
            {(searchQuery.length > 0 || selectedModule !== null) && (
              <Text style={[styles.resultsCount, { color: T.textLight }]}>
                {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
              </Text>
            )}

            {/* Lesson cards */}
            {filteredLessons.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={40} color={T.textLight} />
                <Text style={[styles.emptyStateText, { color: T.textLight }]}>No lessons match your search</Text>
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedModule(null); }}>
                  <Text style={[styles.clearFiltersText, { color: T.primary }]}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredLessons.map((lesson, index) => {
                const cardGradientColors: readonly [string, string] = lesson.completed
                  ? [T.card, blendColors(T.card, '#00a472', darkMode ? 0.22 : 0.08)]
                  : lesson.locked
                    ? [darkMode ? '#161616' : '#f8fafc', darkMode ? '#161616' : '#f8fafc']
                    : [T.card, blendColors(T.card, topicColor, darkMode ? 0.22 : 0.08)];

                const circleGradientColors: readonly [string, string] = lesson.completed
                  ? [blendColors(T.card, '#00a472', darkMode ? 0.35 : 0.18), blendColors(T.card, '#00a472', darkMode ? 0.12 : 0.05)]
                  : lesson.locked
                    ? [T.surface, T.surface]
                    : [blendColors(T.card, topicColor, darkMode ? 0.35 : 0.18), blendColors(T.card, topicColor, darkMode ? 0.12 : 0.05)];

                const borderColor = lesson.completed
                  ? blendColors(T.card, '#00a472', darkMode ? 0.40 : 0.25)
                  : lesson.locked
                    ? T.border
                    : blendColors(T.card, topicColor, darkMode ? 0.40 : 0.25);

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => handleLessonPress(lesson)}
                    activeOpacity={lesson.locked ? 1 : 0.7}
                    disabled={lesson.locked}
                  >
                    <LinearGradient
                      colors={cardGradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.lessonCard,
                        { borderColor },
                        lesson.locked && styles.lessonCardLocked
                      ]}
                    >
                      <LinearGradient
                        colors={circleGradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.lessonNumber,
                          {
                            borderColor: lesson.completed
                              ? blendColors(T.card, '#00a472', darkMode ? 0.50 : 0.35)
                              : lesson.locked
                                ? 'transparent'
                                : blendColors(T.card, topicColor, darkMode ? 0.50 : 0.35),
                            borderWidth: 1,
                          }
                        ]}
                      >
                        {lesson.completed ? (
                          <Ionicons name="checkmark-circle" size={24} color="#00a472" />
                        ) : lesson.locked ? (
                          <Ionicons name="lock-closed" size={20} color={T.textLight} />
                        ) : (
                          <Text style={[styles.lessonNumberText, { color: topicColor }]}>{index + 1}</Text>
                        )}
                      </LinearGradient>

                      <View style={styles.lessonContent}>
                        <Text style={[styles.lessonTitle, { color: lesson.locked ? T.textLight : T.text }]}>
                          {lesson.title}
                        </Text>
                        <View style={styles.lessonMeta}>
                          <Ionicons name="time-outline" size={14} color={T.textLight} />
                          <Text style={[styles.lessonDuration, { color: T.textLight }]}>{lesson.duration}</Text>
                        </View>
                      </View>

                      {!lesson.locked && (
                        <View style={[styles.chevronCircle, { backgroundColor: darkMode ? '#252f40' : '#f2f4f6' }]}>
                          <Ionicons name="chevron-forward" size={16} color={T.textLight} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })
            )}
            {/* Next module recommendation banner — shown when current module is 100% done */}
            {activeModuleDone && nextIncompleteModule && (
              <TouchableOpacity
                style={styles.nextModuleBanner}
                onPress={handleGoToNextModule}
                activeOpacity={0.85}
              >
                <View style={styles.nextModuleBannerLeft}>
                  <View style={styles.nextModuleIconWrap}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  </View>
                  <View style={styles.nextModuleTextWrap}>
                    <Text style={styles.nextModuleBannerTitle}>
                      Module complete!
                    </Text>
                    <Text style={styles.nextModuleBannerSub}>
                      Up next: <Text style={styles.nextModuleBannerName}>{moduleLabel(nextIncompleteModule)}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.nextModuleArrow}>
                  <Ionicons name="arrow-forward" size={18} color="#4b41e1" />
                </View>
              </TouchableOpacity>
            )}

            {/* All modules done — celebrate */}
            {activeModuleDone && !nextIncompleteModule && (
              <View style={styles.allDoneBanner}>
                <Text style={styles.allDoneEmoji}>🏆</Text>
                <Text style={styles.allDoneTitle}>All lessons complete!</Text>
                <Text style={styles.allDoneSub}>You've finished every lesson in {topicName}.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.contentSection}>
            {practiceSets.map((practice) => {
              const completionPercent = (practice.completed / practice.problems) * 100;
              return (
                <TouchableOpacity
                  key={practice.id}
                  style={[styles.practiceCard, { backgroundColor: T.card }]}
                  onPress={() => handlePracticePress(practice)}
                  activeOpacity={0.7}
                >
                  <View style={styles.practiceHeader}>
                    <View style={styles.practiceInfo}>
                      <Text style={[styles.practiceTitle, { color: T.text }]}>{practice.title}</Text>
                      <View style={styles.practiceMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="help-circle-outline" size={14} color={T.textLight} />
                          <Text style={[styles.metaText, { color: T.textLight }]}>{practice.problems} problems</Text>
                        </View>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(practice.difficulty) + '20' }]}>
                          <Text style={[styles.difficultyText, { color: getDifficultyColor(practice.difficulty) }]}>
                            {practice.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={T.textLight} />
                  </View>

                  {practice.completed > 0 && (
                    <View style={[styles.practiceProgress, { borderTopColor: T.surface }]}>
                      <View style={styles.progressInfo}>
                        <Text style={[styles.progressText, { color: T.textLight }]}>
                          {practice.completed}/{practice.problems} completed
                        </Text>
                        <Text style={[styles.progressPercent, { color: T.text }]}>
                          {Math.round(completionPercent)}%
                        </Text>
                      </View>
                      <View style={[styles.progressBarContainer, { backgroundColor: T.surface }]}>
                        <View style={[styles.progressBar, { width: `${completionPercent}%`, backgroundColor: getDifficultyColor(practice.difficulty) }]} />
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
    paddingTop: 10
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  lessonNumber: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 4,
    paddingBottom: 4,
  },
  stickyFilters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '500',
    paddingLeft: 2,
    marginTop: -4,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextModuleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 4,
  },
  nextModuleBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  nextModuleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextModuleTextWrap: {
    flex: 1,
  },
  nextModuleBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  nextModuleBannerSub: {
    fontSize: 13,
    color: '#166534',
  },
  nextModuleBannerName: {
    fontWeight: '700',
    color: '#4b41e1',
  },
  nextModuleArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2dfff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  allDoneBanner: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  allDoneEmoji: {
    fontSize: 40,
  },
  allDoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  allDoneSub: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
});
