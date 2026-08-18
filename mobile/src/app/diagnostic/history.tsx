import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import diagnosticService from '@/services/diagnosticService';
import { useTheme } from '@/context/ThemeContext';

export default function DiagnosticHistoryScreen() {
  const router = useRouter();
  const { darkMode, primaryColor } = useTheme();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res: any = await diagnosticService.getDiagnosticHistory();
      const docs = res.data?.diagnostics ?? res.diagnostics ?? [];
      setHistory(docs);
    } catch (error) {
      console.error('Error fetching diagnostic history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 100) return primaryColor || '#4b41e1';
    if (score >= 70) return '#00a472';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const colors = {
    bg: darkMode ? '#091426' : '#f7f9fb',
    card: darkMode ? '#1a2333' : '#ffffff',
    text: darkMode ? '#ffffff' : '#091426',
    textMuted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#2d3748' : '#e2e8f0',
    iconBg: primaryColor ? `${primaryColor}20` : (darkMode ? 'rgba(75, 65, 225, 0.2)' : 'rgba(75, 65, 225, 0.1)'),
    iconColor: primaryColor || (darkMode ? '#a5b4fc' : '#4b41e1'),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Diagnostic History</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={primaryColor || "#4b41e1"} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading history...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No diagnostic history recorded yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {history.map((item, index) => {
            const itemNum = history.length - index;
            const dateStr = item.completedAt
              ? new Date(item.completedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Unknown date';
            const score = Math.round(item.overallScore ?? 0);

            return (
              <View
                key={item._id || index}
                style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.historyLeft}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="time-outline" size={20} color={colors.iconColor} />
                  </View>
                  <View>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>Diagnostic #{itemNum}</Text>
                    <Text style={[styles.historyDate, { color: colors.textMuted }]}>{dateStr}</Text>
                  </View>
                </View>

                {item.overallScore != null && (
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) + '1A' }]}>
                    <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>{score}%</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
