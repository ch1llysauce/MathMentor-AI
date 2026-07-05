import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I start a diagnostic test?',
      answer: 'Go to the Diagnostic tab and tap on "Start Diagnostic Test". You\'ll be asked to choose a difficulty level, then you can begin the test.',
    },
    {
      question: 'What are mastery levels?',
      answer: 'Mastery levels indicate how well you understand a topic. They range from 0-100%:\n\n• 0-50%: Learning\n• 50-80%: Proficient\n• 80-100%: Expert',
    },
    {
      question: 'How does the learning streak work?',
      answer: 'Your streak increases each day you complete at least one practice session or lesson. Keep your streak alive by studying daily!',
    },
    {
      question: 'Can I change my difficulty level?',
      answer: 'Yes! Go to Profile > Preferences > Difficulty Level to adjust your learning difficulty at any time.',
    },
    {
      question: 'How do I track my progress?',
      answer: 'Your Dashboard shows overall progress, while the Diagnostic tab displays topic-specific mastery levels and improvement over time.',
    },
    {
      question: 'Are lessons available offline?',
      answer: 'Enable offline mode in Settings > Data & Storage to download lessons for offline access.',
    },
  ];

  const contactOptions = [
    {
      icon: 'mail-outline',
      title: 'Email Support',
      description: 'support@mathmentor.ai',
      iconBg: 'rgba(75, 65, 225, 0.1)',
      iconColor: '#4b41e1',
      onPress: () => {
        Linking.openURL('mailto:support@mathmentor.ai?subject=Support Request')
          .catch(() => Alert.alert('Error', 'Unable to open email app'));
      },
    },
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower)
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#091426" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#75777d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#b0b3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
            {searchQuery ? ` (${filteredFaqs.length} result${filteredFaqs.length !== 1 ? 's' : ''})` : ''}
          </Text>
          {filteredFaqs.length > 0 ? (
            <View style={styles.faqList}>
              {filteredFaqs.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons 
                      name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color="#75777d" 
                    />
                  </TouchableOpacity>
                  {expandedFaq === index && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noResultsCard}>
              <Ionicons name="search-outline" size={48} color="#b0b3b8" />
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsText}>
                Try searching with different keywords or browse all FAQs above
              </Text>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactList}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.contactItem} onPress={option.onPress}>
                <View style={[styles.contactIcon, { backgroundColor: option.iconBg }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.iconColor} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#75777d" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback Card */}
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="megaphone" size={32} color="#4b41e1" />
            <Text style={styles.feedbackTitle}>Send Feedback</Text>
          </View>
          <Text style={styles.feedbackDescription}>
            Have suggestions or found a bug? We'd love to hear from you!
          </Text>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => Alert.alert('Feedback', 'Thank you for your feedback! We appreciate your input.')}
          >
            <Text style={styles.feedbackButtonText}>Share Your Thoughts</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e3e5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#091426',
    paddingVertical: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#091426',
    marginBottom: 16,
  },
  faqList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#091426',
    marginRight: 12,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f7f9fb',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#45474c',
    lineHeight: 20,
  },
  contactList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#091426',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#75777d',
  },
  feedbackCard: {
    backgroundColor: '#e2dfff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#091426',
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#45474c',
    marginBottom: 16,
    lineHeight: 20,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4b41e1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  noResultsCard: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#091426',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#75777d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
