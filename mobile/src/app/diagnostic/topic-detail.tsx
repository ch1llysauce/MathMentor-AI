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

export default function TopicDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the topic data from params
  const topic = params.topic as string;
  const score = parseInt(params.score as string) || 0;
  
  // Mock subtopic data
  const subtopics = [
    { name: 'Linear Equations', score: 85, questions: 20, correct: 17 },
    { name: 'Quadratic Equations', score: 72, questions: 15, correct: 11 },
    { name: 'Polynomials', score: 68, questions: 18, correct: 12 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00a472';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
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
        <Text style={styles.headerTitle}>{topic} Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress */}
        <View style={styles.overallCard}>
          <MasteryRing
            percentage={score}
            size={120}
            strokeWidth={10}
            topic={topic}
            subtitle={`${score}% Mastery`}
          />
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>53</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>40</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>13</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
          </View>
        </View>

        {/* Subtopics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subtopics Breakdown</Text>
          
          {subtopics.map((subtopic, index) => (
            <TouchableOpacity
              key={index}
              style={styles.subtopicCard}
              activeOpacity={0.7}
            >
              <View style={styles.subtopicHeader}>
                <Text style={styles.subtopicName}>{subtopic.name}</Text>
                <Text style={[
                  styles.subtopicScore,
                  { color: getScoreColor(subtopic.score) }
                ]}>
                  {subtopic.score}%
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      width: `${subtopic.score}%`,
                      backgroundColor: getScoreColor(subtopic.score)
                    }
                  ]} 
                />
              </View>
              
              <View style={styles.subtopicStats}>
                <Text style={styles.subtopicStatText}>
                  {subtopic.correct}/{subtopic.questions} correct
                </Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="bulb" size={24} color="#f59e0b" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Focus on Polynomials</Text>
              <Text style={styles.recommendationText}>
                Your polynomial skills need improvement. Practice factoring and operations.
              </Text>
            </View>
          </View>
          
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="trophy" size={24} color="#00a472" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Strong in Linear Equations</Text>
              <Text style={styles.recommendationText}>
                Excellent work! Consider tackling more advanced problems.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={() => {
              // TODO: Navigate to practice screen
              console.log('Start practice');
            }}
          >
            <Ionicons name="play" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Practice {topic}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            activeOpacity={0.9}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>View Progress History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
    paddingBottom: 20
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  subtopicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  subtopicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtopicName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  subtopicScore: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  subtopicStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtopicStatText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
