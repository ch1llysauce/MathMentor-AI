import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function RetakeDiagnosticScreen() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('balanced');
  
  const difficulties = [
    {
      id: 'easy',
      title: 'Easy Start',
      icon: 'walk',
      description: 'Start with basics and build confidence',
      duration: '10-15 min',
      questions: 20,
    },
    {
      id: 'balanced',
      title: 'Balanced',
      icon: 'trending-up',
      description: 'Mix of basic and advanced questions',
      duration: '15-20 min',
      questions: 30,
      recommended: true,
    },
    {
      id: 'challenging',
      title: 'Challenge Mode',
      icon: 'fitness',
      description: 'Push your limits with harder problems',
      duration: '20-25 min',
      questions: 40,
    },
  ];

  const handleStartTest = () => {
    Alert.alert(
      'Start Diagnostic Test',
      `You selected ${difficulties.find(d => d.id === selectedDifficulty)?.title}. Ready to begin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Now',
          onPress: () => {
            // TODO: Navigate to actual test screen
            Alert.alert('Coming Soon', 'The diagnostic test interface will be implemented in the next phase.');
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Retake Diagnostic</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={48} color={Colors.secondary} />
          </View>
          <Text style={styles.infoTitle}>Update Your Knowledge Map</Text>
          <Text style={styles.infoText}>
            This diagnostic test will assess your current understanding across Algebra, Geometry, and Trigonometry. 
            Your personalized learning path will be updated based on the results.
          </Text>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Test Difficulty</Text>
          
          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.id}
              style={[
                styles.difficultyCard,
                selectedDifficulty === difficulty.id && styles.difficultyCardSelected
              ]}
              onPress={() => setSelectedDifficulty(difficulty.id)}
              activeOpacity={0.7}
            >
              {difficulty.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              )}
              
              <View style={styles.difficultyHeader}>
                <View style={[
                  styles.difficultyIconContainer,
                  selectedDifficulty === difficulty.id && styles.difficultyIconSelected
                ]}>
                  <Ionicons 
                    name={difficulty.icon as any} 
                    size={28} 
                    color={selectedDifficulty === difficulty.id ? Colors.white : Colors.secondary}
                  />
                </View>
                
                <View style={styles.difficultyInfo}>
                  <Text style={[
                    styles.difficultyTitle,
                    selectedDifficulty === difficulty.id && styles.difficultyTitleSelected
                  ]}>
                    {difficulty.title}
                  </Text>
                  <Text style={styles.difficultyDescription}>
                    {difficulty.description}
                  </Text>
                </View>
                
                <View style={[
                  styles.radioButton,
                  selectedDifficulty === difficulty.id && styles.radioButtonSelected
                ]}>
                  {selectedDifficulty === difficulty.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
              
              <View style={styles.difficultyStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={Colors.textLight} />
                  <Text style={styles.statText}>{difficulty.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="help-circle-outline" size={16} color={Colors.textLight} />
                  <Text style={styles.statText}>{difficulty.questions} questions</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* What to Expect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          
          <View style={styles.expectationCard}>
            <View style={styles.expectationItem}>
              <View style={styles.expectationIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#00a472" />
              </View>
              <View style={styles.expectationContent}>
                <Text style={styles.expectationTitle}>Adaptive Questions</Text>
                <Text style={styles.expectationText}>
                  Questions adapt to your skill level
                </Text>
              </View>
            </View>
            
            <View style={styles.expectationItem}>
              <View style={styles.expectationIcon}>
                <Ionicons name="stats-chart" size={24} color="#2563eb" />
              </View>
              <View style={styles.expectationContent}>
                <Text style={styles.expectationTitle}>Detailed Analysis</Text>
                <Text style={styles.expectationText}>
                  Get insights into your strengths and weak areas
                </Text>
              </View>
            </View>
            
            <View style={styles.expectationItem}>
              <View style={styles.expectationIcon}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
              </View>
              <View style={styles.expectationContent}>
                <Text style={styles.expectationTitle}>AI Recommendations</Text>
                <Text style={styles.expectationText}>
                  Personalized study plan based on results
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          <Text style={styles.tipsText}>
            • Find a quiet place with minimal distractions{'\n'}
            • Have paper and pencil ready for calculations{'\n'}
            • Take your time - accuracy is more important than speed{'\n'}
            • Don't worry if some questions seem hard - they're meant to challenge you!
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity 
          style={styles.startButton}
          activeOpacity={0.9}
          onPress={handleStartTest}
        >
          <Text style={styles.startButtonText}>Start Diagnostic Test</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        <View style={{ height: 50 }} />
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
  infoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIcon: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  difficultyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  difficultyCardSelected: {
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  difficultyIconSelected: {
    backgroundColor: Colors.secondary,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  difficultyTitleSelected: {
    color: Colors.primary,
  },
  difficultyDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.secondary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },
  difficultyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  expectationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  expectationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expectationIcon: {
    marginRight: 12,
  },
  expectationContent: {
    flex: 1,
  },
  expectationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  expectationText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
