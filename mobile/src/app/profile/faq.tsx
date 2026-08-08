import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

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
  const { darkMode } = useTheme();
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const C = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    header: darkMode ? '#0a0a0a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    card: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#45474c',
    primary: darkMode ? '#a5b4fc' : '#4b41e1',
    primaryBg: darkMode ? 'rgba(165,180,252,0.15)' : 'rgba(75,65,225,0.08)',
    divider: darkMode ? '#2e2e2e' : '#f2f4f6',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    answerBg: darkMode ? '#111111' : '#f7f9fb',
  };

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.header, borderBottomColor: C.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: C.backBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>FAQs</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: C.textLight }]}>
          Find answers to the most common questions about MathMentor AI.
        </Text>

        {FAQS.map((section) => (
          <View key={section.category} style={styles.section}>
            <Text style={[styles.categoryLabel, { color: C.primary }]}>{section.category}</Text>
            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = openIndex === key;
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
        ))}

        {/* Contact footer */}
        <View style={[styles.contactCard, { backgroundColor: C.primaryBg, borderColor: C.primary }]}>
          <Ionicons name="mail-outline" size={20} color={C.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactTitle, { color: C.text }]}>Still need help?</Text>
            <Text style={[styles.contactText, { color: C.textLight }]}>
              Email us at{' '}
              <Text style={{ color: C.primary, fontWeight: '600' }}>support@mathmentor.ai</Text>
              {' '}and we'll get back to you within 24 hours.
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
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
  question: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 22 },
  answerBox: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { fontSize: 14, lineHeight: 22 },
  divider: { height: 1, marginHorizontal: 16 },
  contactCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 16, borderRadius: 16, borderWidth: 1, borderLeftWidth: 4,
    marginTop: 4
  },
  contactTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  contactText: { fontSize: 13, lineHeight: 20 },
});
