import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MasteryRing } from '@/components/MasteryRing';

export default function AllTopicsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the data from params
  const algebraScore = parseInt(params.algebraScore as string) || 0;
  const geometryScore = parseInt(params.geometryScore as string) || 0;
  const trigonometryScore = parseInt(params.trigonometryScore as string) || 0;
  const overallScore = parseInt(params.overallScore as string) || 0;

  const topics = [
    {
      name: 'Algebra',
      score: algebraScore,
      questions: 45,
      correct: Math.round(45 * (algebraScore / 100)),
      subtopics: [
        { name: 'Linear Equations', score: 85 },
        { name: 'Quadratic Equations', score: 72 },
        { name: 'Polynomials', score: 68 },
        { name: 'Factoring', score: 78 },
      ],
      color: '#2563eb',
    },
    {
      name: 'Geometry',
      score: geometryScore,
      questions: 38,
      correct: Math.round(38 * (geometryScore / 100)),
      subtopics: [
        { name: 'Triangles', score: 82 },
        { name: 'Circles', score: 65 },
        { name: 'Area & Perimeter', score: 88 },
        { name: 'Volume', score: 70 },
      ],
      color: '#00a472',
    },
    {
      name: 'Trigonometry',
      score: trigonometryScore,
      questions: 32,
      correct: Math.round(32 * (trigonometryScore / 100)),
      subtopics: [
        { name: 'Sine & Cosine', score: 75 },
        { name: 'Tangent', score: 80 },
        { name: 'Trigonometric Identities', score: 62 },
        { name: 'Angles', score: 85 },
      ],
      color: '#f59e0b',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00a472';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Expert Level';
    if (score >= 60) return 'Proficient';
    if (score >= 40) return 'Developing';
    return 'Needs Practice';
  };

  const handleTopicPress = (topic: string, score: number) => {
    router.push({
      pathname: '/diagnostic/topic-detail',
      params: { topic, score: score.toString() }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Topics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Score Card */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.overallTitle}>Overall Mastery</Text>
              <Text style={styles.overallSubtitle}>Across all topics</Text>
            </View>
            <View style={styles.overallBadge}>
              <Text style={styles.overallBadgeText}>{overallScore}%</Text>
            </View>
          </View>
          
          <View style={styles.overallProgressBar}>
            <View 
              style={[
                styles.overallProgress,
                { 
                  width: `${overallScore}%`,
                  backgroundColor: getScoreColor(overallScore)
                }
              ]} 
            />
          </View>
          
          <View style={styles.overallStats}>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>115</Text>
              <Text style={styles.overallStatLabel}>Total Questions</Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>
                {Math.round(115 * (overallScore / 100))}
              </Text>
              <Text style={styles.overallStatLabel}>Correct</Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>3</Text>
              <Text style={styles.overallStatLabel}>Topics</Text>
            </View>
          </View>
        </View>

        {/* Topics List */}
        {topics.map((topic, index) => (
          <TouchableOpacity
            key={index}
            style={styles.topicCard}
            onPress={() => handleTopicPress(topic.name, topic.score)}
            activeOpacity={0.7}
          >
            {/* Topic Header */}
            <View style={styles.topicHeader}>
              <View style={styles.topicHeaderLeft}>
                <View style={[styles.topicIconContainer, { backgroundColor: topic.color + '20' }]}>
                  <Ionicons 
                    name={
                      topic.name === 'Algebra' ? 'calculator' :
                      topic.name === 'Geometry' ? 'shapes' : 'analytics'
                    } 
                    size={28} 
                    color={topic.color}
                  />
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{topic.name}</Text>
                  <Text style={[
                    styles.topicLabel,
                    { color: getScoreColor(topic.score) }
                  ]}>
                    {getScoreLabel(topic.score)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.topicHeaderRight}>
                <Text style={[
                  styles.topicScore,
                  { color: getScoreColor(topic.score) }
                ]}>
                  {topic.score}%
                </Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${topic.score}%`,
                    backgroundColor: getScoreColor(topic.score)
                  }
                ]} 
              />
            </View>

            {/* Stats */}
            <View style={styles.topicStats}>
              <View style={styles.statItem}>
                <Ionicons name="help-circle-outline" size={16} color={Colors.textLight} />
                <Text style={styles.statText}>
                  {topic.correct}/{topic.questions} correct
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="list-outline" size={16} color={Colors.textLight} />
                <Text style={styles.statText}>
                  {topic.subtopics.length} subtopics
                </Text>
              </View>
            </View>

            {/* Subtopics Preview */}
            <View style={styles.subtopicsPreview}>
              <Text style={styles.subtopicsTitle}>Key Subtopics:</Text>
              <View style={styles.subtopicsList}>
                {topic.subtopics.slice(0, 3).map((subtopic, idx) => (
                  <View key={idx} style={styles.subtopicChip}>
                    <Text style={styles.subtopicChipText}>{subtopic.name}</Text>
                    <Text style={[
                      styles.subtopicChipScore,
                      { color: getScoreColor(subtopic.score) }
                    ]}>
                      {subtopic.score}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* View Details Button */}
            <View style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Detailed Breakdown</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.secondary} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Comparison Chart */}
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Performance Comparison</Text>
          
          <View style={styles.comparisonChart}>
            {topics.map((topic, index) => (
              <View key={index} style={styles.comparisonItem}>
                <View style={styles.comparisonBar}>
                  <View 
                    style={[
                      styles.comparisonFill,
                      { 
                        height: `${topic.score}%`,
                        backgroundColor: topic.color
                      }
                    ]} 
                  />
                  <Text style={styles.comparisonValue}>{topic.score}%</Text>
                </View>
                <Text style={styles.comparisonLabel}>{topic.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.comparisonLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00a472' }]} />
              <Text style={styles.legendText}>80%+ Expert</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>60-79% Proficient</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>&lt;60% Needs Work</Text>
            </View>
          </View>
        </View>

        {/* Action Card */}
        <View style={styles.actionCard}>
          <Ionicons name="rocket" size={32} color={Colors.secondary} />
          <Text style={styles.actionTitle}>Ready to Improve?</Text>
          <Text style={styles.actionText}>
            Tap on any topic above to see detailed breakdown and personalized recommendations
          </Text>
        </View>

        <View style={{ height: 24 }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  overallCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  overallSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  overallBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  overallBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  overallProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  overallProgress: {
    height: '100%',
    borderRadius: 6,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overallStatItem: {
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
  topicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  topicLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  topicHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  topicStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  subtopicsPreview: {
    marginBottom: 16,
  },
  subtopicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  subtopicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subtopicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  subtopicChipText: {
    fontSize: 13,
    color: Colors.text,
  },
  subtopicChipScore: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
  },
  comparisonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 24,
  },
  comparisonChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 24,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonBar: {
    width: 60,
    height: '100%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  comparisonFill: {
    width: '100%',
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    zIndex: 1,
  },
  comparisonLabel: {
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  comparisonLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  actionCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
