import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import diagnosticService from '@/services/diagnosticService';

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

export default function PracticeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TopicFilter>('all');
  const [loading, setLoading] = useState(true);
  const [userMastery, setUserMastery] = useState<any>(null);

  const topics: Topic[] = [
    {
      id: '1',
      name: 'Algebra',
      icon: 'calculator',
      color: '#2563eb',
      lessons: 24,
      problems: 156,
      mastery: userMastery?.algebraScore || 75,
      subtopics: ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Factoring'],
    },
    {
      id: '2',
      name: 'Geometry',
      icon: 'shapes',
      color: '#00a472',
      lessons: 18,
      problems: 124,
      mastery: userMastery?.geometryScore || 68,
      subtopics: ['Triangles', 'Circles', 'Area & Perimeter', 'Volume'],
    },
    {
      id: '3',
      name: 'Trigonometry',
      icon: 'analytics',
      color: '#f59e0b',
      lessons: 16,
      problems: 98,
      mastery: userMastery?.trigonometryScore || 82,
      subtopics: ['Sine & Cosine', 'Tangent', 'Identities', 'Angles'],
    },
  ];

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const response = await diagnosticService.getLatestDiagnostic();
      setUserMastery(response.data.diagnostic);
    } catch (error) {
      console.log('No diagnostic data available');
    } finally {
      setLoading(false);
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Practice</Text>
            <Text style={styles.subtitle}>Choose a topic to master</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics or subtopics..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
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
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'all' && styles.filterChipTextActive
            ]}>
              All Topics
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'weak' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('weak')}
          >
            <Ionicons 
              name="arrow-down" 
              size={14} 
              color={selectedFilter === 'weak' ? Colors.white : Colors.textLight}
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'weak' && styles.filterChipTextActive
            ]}>
              Need Practice
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'strong' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('strong')}
          >
            <Ionicons 
              name="arrow-up" 
              size={14} 
              color={selectedFilter === 'strong' ? Colors.white : Colors.textLight}
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'strong' && styles.filterChipTextActive
            ]}>
              Strong Areas
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Topics List */}
        <View style={styles.topicsList}>
          {filteredTopics.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No topics found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
            </View>
          ) : (
            filteredTopics.map((topic) => {
              const masteryInfo = getMasteryLabel(topic.mastery);
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => handleTopicPress(topic)}
                  activeOpacity={0.7}
                >
                  {/* Topic Header */}
                  <View style={styles.topicHeader}>
                    <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                      <Ionicons name={topic.icon as any} size={28} color={topic.color} />
                    </View>
                    
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicName}>{topic.name}</Text>
                      <View style={styles.topicMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="book-outline" size={14} color={Colors.textLight} />
                          <Text style={styles.metaText}>{topic.lessons} lessons</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="create-outline" size={14} color={Colors.textLight} />
                          <Text style={styles.metaText}>{topic.problems} problems</Text>
                        </View>
                      </View>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Mastery Level</Text>
                      <View style={styles.masteryBadge}>
                        <Text style={[styles.masteryText, { color: masteryInfo.color }]}>
                          {masteryInfo.label}
                        </Text>
                        <Text style={styles.masteryPercent}>{topic.mastery}%</Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
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
                  <View style={styles.subtopicsSection}>
                    <Text style={styles.subtopicsLabel}>Key Subtopics:</Text>
                    <View style={styles.subtopicsContainer}>
                      {topic.subtopics.slice(0, 3).map((subtopic, index) => (
                        <View key={index} style={styles.subtopicTag}>
                          <Text style={styles.subtopicText}>{subtopic}</Text>
                        </View>
                      ))}
                      {topic.subtopics.length > 3 && (
                        <View style={styles.subtopicTag}>
                          <Text style={styles.subtopicText}>+{topic.subtopics.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Daily Challenge</Text>
              <Text style={styles.actionSubtitle}>Complete today's problem set</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="refresh" size={24} color="#2563eb" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Review Mistakes</Text>
              <Text style={styles.actionSubtitle}>Practice problems you got wrong</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
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
    backgroundColor: Colors.white,
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
    width: 56,
    height: 56,
    borderRadius: 16,
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
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
