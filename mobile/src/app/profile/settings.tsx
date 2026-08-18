import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import { storage } from '@/utils/storage';
import { offlineCacheService } from '@/services/offlineCache';

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  // Offline Mode State persisted to storage
  const [offlineMode, setOfflineMode] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  useEffect(() => {
    const loadOfflineMode = async () => {
      try {
        const isEnabled = await offlineCacheService.isOfflineCacheEnabled();
        setOfflineMode(isEnabled);
      } catch (e) {
        console.warn('Failed to load offline mode preference', e);
      }
    };
    loadOfflineMode();
  }, []);

  const handleOfflineModeToggle = async (checked: boolean) => {
    setOfflineMode(checked);
    if (checked) {
      setIsCaching(true);
      showToast('Pre-caching lessons, formulas & problem templates...');
      try {
        const result = await offlineCacheService.setOfflineCacheEnabled(true);
        showToast(`Offline Cache Mode enabled. ${result.cachedCount} items pre-cached for offline use.`);
      } catch (e) {
        console.warn('Failed to enable offline cache', e);
        showToast('Failed to pre-cache offline data.');
      } finally {
        setIsCaching(false);
      }
    } else {
      await offlineCacheService.setOfflineCacheEnabled(false);
      showToast('Offline Cache Mode disabled.');
    }
  };

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);

  // Toast State
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleResetSettings = async () => {
    if (darkMode) {
      toggleDarkMode();
    }
    setOfflineMode(false);
    try {
      await offlineCacheService.setOfflineCacheEnabled(false);
      await storage.removeItem('mathmentor_offline_cache');
    } catch (e) {
      console.warn('Failed to clear offline mode storage', e);
    }

    setShowResetModal(false);
    showToast('All settings reset to default.');
  };

  const S = {
    bg: darkMode ? '#0a0a0a' : '#f7f9fb',
    headerBg: darkMode ? '#0a0a0a' : '#ffffff',
    cardBg: darkMode ? '#1a1a1a' : '#ffffff',
    border: darkMode ? '#2e2e2e' : '#e0e3e5',
    text: darkMode ? '#f0f0f0' : '#091426',
    textLight: darkMode ? '#a0a0a0' : '#75777d',
    backBtnBg: darkMode ? '#1a1a1a' : '#f2f4f6',
    itemBorder: darkMode ? '#2e2e2e' : '#f2f4f6',
    toastBg: darkMode ? '#161616' : '#ffffff',
    modalBg: darkMode ? '#161616' : '#ffffff',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: S.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      {/* Floating Toast Notification Banner */}
      {!!toast && (
        <View
          style={[
            styles.toastContainer,
            {
              backgroundColor: S.toastBg,
              borderColor: darkMode ? 'rgba(0,164,114,0.4)' : 'rgba(0,164,114,0.2)',
            },
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#00a472" />
          <Text style={[styles.toastText, { color: S.text }]}>{toast}</Text>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: S.headerBg, borderBottomColor: S.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: S.backBtnBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={S.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: S.text }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: S.textLight }]}>
            Manage app preferences, display, and data storage
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: S.textLight }]}>APPEARANCE</Text>
          <View style={[styles.cardGroup, { backgroundColor: S.cardBg, borderColor: S.border }]}>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: darkMode ? 'rgba(165,180,252,0.15)' : 'rgba(75,65,225,0.1)' }]}>
                  <Ionicons name="moon-outline" size={20} color={darkMode ? '#a5b4fc' : '#4b41e1'} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: S.text }]}>Dark Mode</Text>
                  <Text style={[styles.rowSubtitle, { color: S.textLight }]}>Use dark theme throughout the app</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: darkMode ? '#3a3a3a' : '#e0e3e5', true: '#4b41e1' }}
                thumbColor="#ffffff"
                ios_backgroundColor={darkMode ? '#3a3a3a' : '#e0e3e5'}
              />
            </View>
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: S.textLight }]}>DATA & STORAGE</Text>
          <View style={[styles.cardGroup, { backgroundColor: S.cardBg, borderColor: S.border }]}>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,152,0,0.1)' }]}>
                  <Ionicons name="cloud-offline-outline" size={20} color="#ff9800" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: S.text }]}>Offline Cache Mode</Text>
                  <Text style={[styles.rowSubtitle, { color: S.textLight }]}>Pre-cache offline lessons</Text>
                </View>
              </View>
              <Switch
                value={offlineMode}
                disabled={isCaching}
                onValueChange={handleOfflineModeToggle}
                trackColor={{ false: darkMode ? '#3a3a3a' : '#e0e3e5', true: '#ff9800' }}
                thumbColor="#ffffff"
                ios_backgroundColor={darkMode ? '#3a3a3a' : '#e0e3e5'}
              />
            </View>
          </View>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: S.textLight }]}>ADVANCED</Text>
          <View style={[styles.cardGroup, { backgroundColor: S.cardBg, borderColor: S.border }]}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => setShowResetModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.cardRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,152,0,0.1)' }]}>
                  <Ionicons name="refresh-outline" size={20} color="#ff9800" />
                </View>
                <Text style={[styles.rowTitle, { color: S.text }]}>Reset Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={S.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>


      {/* Reset Confirmation Modal */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: S.modalBg, borderColor: S.border, alignItems: 'center' }]}>
            <View style={styles.resetIconBox}>
              <Ionicons name="refresh-outline" size={26} color="#ff9800" />
            </View>

            <Text style={[styles.modalTitle, { color: S.text, textAlign: 'center', marginBottom: 8 }]}>
              Reset All Settings?
            </Text>
            <Text style={[styles.modalSubtitle, { color: S.textLight, textAlign: 'center', marginBottom: 20 }]}>
              This will reset all user preferences to default. Your learning progress will not be affected.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ff9800' }]}
                onPress={handleResetSettings}
                activeOpacity={0.8}
              >
                <Text style={styles.resetConfirmText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#242424' : '#f2f4f6' }]}
                onPress={() => setShowResetModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelBtnText, { color: S.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  cardRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rowValueText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  fontOptionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  fontOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resetIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,152,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetConfirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
