import { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is MathMentor AI?',
        a: 'MathMentor AI is a personalised math tutoring app that uses AI to adapt to your skill level. It covers Algebra, Geometry, and Trigonometry for high school students.',
      },
      {
        q: 'How do I get started?',
        a: 'After creating your account, take the Diagnostic Test from the dashboard. It assesses your current level across all topics and builds a personalised learning path for you.',
      },
      {
        q: 'Is MathMentor AI free to use?',
        a: 'Yes — MathMentor AI is completely free for all users.',
      },
    ],
  },
  {
    category: 'Diagnostic Test',
    items: [
      {
        q: 'What is the Diagnostic Test?',
        a: 'It\'s a short assessment that evaluates your current understanding of Algebra, Geometry, and Trigonometry. The results are used to personalise your learning path.',
      },
      {
        q: 'How long does the Diagnostic Test take?',
        a: 'Typically 10–15 minutes. It covers a range of difficulty levels across the three main topics.',
      },
      {
        q: 'Can I retake the Diagnostic Test?',
        a: 'Yes. Go to the Diagnostic tab and tap "Retake Diagnostic". Your learning path will be updated based on the new results.',
      },
    ],
  },
  {
    category: 'Learning & Practice',
    items: [
      {
        q: 'What topics does MathMentor AI cover?',
        a: 'Algebra (equations, expressions, functions), Geometry (shapes, angles, proofs), and Trigonometry (ratios, identities, triangles) — aligned with high school curricula.',
      },
      {
        q: 'How does the AI tutor work?',
        a: 'The AI tutor answers your math questions, explains concepts step by step, and provides hints when you\'re stuck on practice problems.',
      },
      {
        q: 'What does mastery level mean?',
        a: 'Each topic has a mastery level (0–100%) based on your accuracy and consistency over time. Higher mastery means you\'ve demonstrated a strong grasp of that topic.',
      },
    ],
  },
  {
    category: 'Account & Data',
    items: [
      {
        q: 'How do I change my profile picture or name?',
        a: 'Go to Profile → Edit Profile. You can update your display name and upload a photo from your gallery.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. Go to Profile → Privacy & Security → Export My Data. You\'ll receive a summary of your profile, progress, and diagnostic results.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Profile → Edit Profile → Delete Account, or contact us at support@mathmentor.ai. Deletion is permanent and removes all your data.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'Why does Google Sign-In require a native build?',
        a: 'Google Sign-In uses native Android/iOS SDKs that aren\'t available in Expo Go. Run "npx expo run:android" to build the full native version.',
      },
      {
        q: 'The app seems slow — what can I do?',
        a: 'Try pulling down to refresh on the dashboard, or logging out and back in. If the issue persists, contact support@mathmentor.ai.',
      },
    ],
  },
];

export default function FaqScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { darkMode } = useTheme();
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const C = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    primary: darkMode ? '#818cf8' : '#4b41e1',
    primaryBg: darkMode ? 'rgba(129,140,248,0.15)' : 'rgba(75,65,225,0.08)',
    warning: darkMode ? '#fbbf24' : '#ff9800',
    warningBg: darkMode ? 'rgba(251,191,36,0.15)' : 'rgba(255,152,0,0.08)',
    divider: darkMode ? '#2e2e2e' : '#f2f4f6',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    answerBg: darkMode ? '#111111' : '#f7f9fb',
    inputBg: darkMode ? '#161e2e' : '#ffffff',
    modalBg: darkMode ? '#161616' : '#ffffff',
    textareaBg: darkMode ? '#242e42' : '#f2f4f6',
    feedbackBtnBg: darkMode ? '#6366f1' : '#4b41e1',
  };

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const query = searchQuery.toLowerCase();
    return FAQS.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Feedback Required', 'Please type your feedback before submitting.');
      return;
    }
    Keyboard.dismiss();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setToast('Thank you for your feedback! We appreciate your input.');
      setTimeout(() => setToast(null), 3500);
    }, 800);
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@mathmentor.ai?subject=Support%20Request')
      .catch(() => Alert.alert('Email Support', 'Please write to support@mathmentor.ai'));
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Toast Notification */}
      {toast && (
        <View
          style={[
            styles.toastContainer,
            {
              bottom: Math.max(insets.bottom + 24, 75),
              backgroundColor: C.card,
              borderColor: '#00a472',
            },
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#00a472" />
          <Text style={[styles.toastText, { color: C.text }]}>{toast}</Text>
          <TouchableOpacity
            onPress={() => setToast(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={C.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.header, borderBottomColor: C.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: C.backBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>Help & FAQs</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: C.textLight }]}>
          Find answers to common questions, email support, or share feedback to help us improve.
        </Text>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: C.inputBg, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={18} color={C.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Search help topics or questions..."
            placeholderTextColor={C.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={C.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* FAQ Sections */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((section) => (
            <View key={section.category} style={styles.section}>
              <Text style={[styles.categoryLabel, { color: C.primary }]}>{section.category}</Text>
              <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = openIndex === key || searchQuery.trim().length > 0;
                  const isLast = i === section.items.length - 1;
                  return (
                    <View key={key}>
                      <TouchableOpacity
                        style={styles.questionRow}
                        onPress={() => toggle(key)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.question, { color: C.text }]}>{item.q}</Text>
                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={C.textLight}
                        />
                      </TouchableOpacity>
                      {isOpen && (
                        <View style={[styles.answerBox, { backgroundColor: C.answerBg }]}>
                          <Text style={[styles.answer, { color: C.textLight }]}>{item.a}</Text>
                        </View>
                      )}
                      {!isLast && <View style={[styles.divider, { backgroundColor: C.divider }]} />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.noResultsCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Ionicons name="search-outline" size={40} color={C.textLight} style={{ marginBottom: 8 }} />
            <Text style={[styles.noResultsTitle, { color: C.text }]}>No matching FAQs found</Text>
            <Text style={[styles.noResultsSubtitle, { color: C.textLight }]}>
              Try searching with different keywords or send us feedback below.
            </Text>
          </View>
        )}

        {/* Contact Support Card */}
        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: C.primaryBg, borderColor: C.primary }]}
          onPress={handleEmailSupport}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIconBox, { backgroundColor: darkMode ? 'rgba(129,140,248,0.2)' : 'rgba(75,65,225,0.12)' }]}>
            <Ionicons name="mail-outline" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactTitle, { color: C.text }]}>Still need help?</Text>
            <Text style={[styles.contactText, { color: C.textLight }]}>
              Email us at{' '}
              <Text style={{ color: C.primary, fontWeight: '700' }}>support@mathmentor.ai</Text>
              {' '}and we'll respond within 24 hours.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Share Feedback Card */}
        <View style={[styles.feedbackCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.feedbackHeaderRow}>
            <View style={[styles.cardIconBox, { backgroundColor: C.warningBg }]}>
              <Ionicons name="megaphone-outline" size={22} color={C.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactTitle, { color: C.text }]}>Have Feedback?</Text>
              <Text style={[styles.contactText, { color: C.textLight }]}>
                Help us improve MathMentor AI by sharing feature ideas or reporting issues.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.feedbackBtn, { backgroundColor: C.feedbackBtnBg }]}
            activeOpacity={0.8}
            onPress={() => setShowFeedbackModal(true)}
          >
            <Text style={styles.feedbackBtnText}>Share Feedback</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Share Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!feedbackSubmitted) setShowFeedbackModal(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          />
          <View style={[styles.modalContent, { backgroundColor: C.modalBg, borderColor: C.border }]}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: C.warningBg, marginBottom: 0 }]}>
                <Ionicons name="megaphone-outline" size={22} color={C.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: C.text }]}>Share Your Feedback</Text>
                <Text style={[styles.modalSubtitle, { color: C.textLight }]}>
                  Your thoughts directly influence new features & improvements.
                </Text>
              </View>
            </View>

            <TextInput
              style={[styles.modalTextarea, { backgroundColor: C.textareaBg, color: C.text, borderColor: C.border }]}
              multiline
              numberOfLines={4}
              placeholder="What did you like? What can we improve?"
              placeholderTextColor={C.textLight}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                disabled={feedbackSubmitted}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowFeedbackModal(false);
                }}
                style={[styles.modalCancelBtn, { backgroundColor: C.textareaBg }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { color: C.textLight }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={feedbackSubmitted}
                onPress={handleFeedbackSubmit}
                style={[styles.modalSubmitBtn, { backgroundColor: C.feedbackBtnBg }]}
                activeOpacity={0.8}
              >
                {feedbackSubmitted ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Submit Feedback</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  toastText: { fontSize: 13, fontWeight: '600', flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  scrollContent: { padding: 16 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  section: { marginBottom: 20 },
  categoryLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 8, marginLeft: 4,
  },
  card: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  questionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, gap: 12,
  },
  question: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  answerBox: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { fontSize: 13, lineHeight: 20 },
  divider: { height: 1, marginHorizontal: 16 },
  noResultsCard: {
    padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 20,
  },
  noResultsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  noResultsSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16, borderWidth: 1,
    marginBottom: 14,
  },
  contactTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  contactText: { fontSize: 12, lineHeight: 18 },
  feedbackCard: {
    padding: 16, borderRadius: 16, borderWidth: 1, gap: 14,
    marginBottom: 14,
  },
  feedbackHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  feedbackBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, width: '100%',
  },
  feedbackBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalSubtitle: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  modalTextarea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 110,
  },
  modalButtonRow: {
    flexDirection: 'row', gap: 10, width: '100%',
  },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  modalCancelBtnText: { fontSize: 14, fontWeight: '600' },
  modalSubmitBtn: {
    flex: 1.2, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  modalSubmitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
