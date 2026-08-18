import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ScaledText as Text } from '@/context/ThemeContext';
import { storage } from '@/utils/storage';
import { offlineCacheService } from '@/services/offlineCache';
import { BANNER_THEMES } from '@/constants/bannerThemes';

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, toggleDarkMode, accentTheme, setAccentTheme } = useTheme();

  // Offline Mode State persisted to storage
  const [offlineMode, setOfflineMode] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  // Real-Time Progress Modal State
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cacheStage, setCacheStage] = useState('');
  const [cachePercent, setCachePercent] = useState(0);

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
      setShowCacheModal(true);
      setCachePercent(0);
      setCacheStage('Initializing Offline Pre-cache...');

      try {
        const result = await offlineCacheService.setOfflineCacheEnabled(true, (stage, percent) => {
          setCacheStage(stage);
          setCachePercent(percent);
        });
        showToast(`Offline Cache Mode enabled. ${result.cachedCount} items cached.`);
      } catch (e) {
        console.warn('Failed to enable offline cache', e);
        showToast('Failed to pre-cache offline data.');
      } finally {
        setTimeout(() => {
          setShowCacheModal(false);
          setIsCaching(false);
        }, 600);
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
    await setAccentTheme('indigo');
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: S.textLight }]}>APPEARANCE</Text>
          <View style={[styles.cardGroup, { backgroundColor: S.cardBg, borderColor: S.border }]}>
            {/* Dark Mode */}
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(75,65,225,0.1)' }]}>
                  <Ionicons name="moon-outline" size={20} color="#4b41e1" />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: S.text }]}>Dark Mode</Text>
                  <Text style={[styles.rowSubtitle, { color: S.textLight }]}>Toggle app color theme</Text>
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

            {/* Accent Theme Color Scheme */}
            <View style={[styles.cardRow, { flexDirection: 'column', alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: S.itemBorder, paddingTop: 14, paddingBottom: 14 }]}>
              <View style={styles.cardRowLeft}>
                <View style={[styles.iconBox, { backgroundColor: darkMode ? 'rgba(96,165,250,0.15)' : 'rgba(33,150,243,0.1)' }]}>
                  <Ionicons name="color-palette-outline" size={20} color={darkMode ? '#60a5fa' : '#2196f3'} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: S.text }]}>Accent Color Scheme</Text>
                  <Text style={[styles.rowSubtitle, { color: S.textLight }]}>Set app accent colors based on preset themes</Text>
                </View>
              </View>

              {/* 9 Swatches Grid */}
              <View style={styles.accentGrid}>
                {BANNER_THEMES.map((theme) => {
                  const isSelected = accentTheme === theme.id;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.accentSwatchItem,
                        {
                          backgroundColor: theme.primaryColor,
                          borderColor: isSelected ? S.text : 'transparent',
                          borderWidth: isSelected ? 2.5 : 0,
                        },
                      ]}
                      onPress={async () => {
                        await setAccentTheme(theme.id);
                        showToast(`Accent theme set to ${theme.name}`);
                      }}
                      activeOpacity={0.8}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
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

        {/* System Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: S.textLight }]}>SYSTEM PREFERENCES</Text>
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

      {/* Real-Time Pre-Caching Percentage Progress Modal */}
      <Modal visible={showCacheModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: S.modalBg, borderColor: S.border, alignItems: 'center', paddingVertical: 26, paddingHorizontal: 22 }]}>
            <View style={styles.cacheModalIconBox}>
              <Ionicons name="cloud-download-outline" size={32} color="#ff9800" />
            </View>

            <Text style={[styles.modalTitle, { color: S.text, textAlign: 'center', marginBottom: 4, marginTop: 12 }]}>
              Building Offline Cache
            </Text>

            <Text style={[styles.modalSubtitle, { color: S.textLight, textAlign: 'center', marginBottom: 20, fontSize: 13 }]}>
              Downloading lessons, formulas, stats, and diagnostic masteries for offline access.
            </Text>

            {/* Percentage Display Badge */}
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{cachePercent}%</Text>
            </View>

            {/* Progress Bar Track */}
            <View style={[styles.progressBarTrack, { backgroundColor: darkMode ? '#2e2e2e' : '#e0e3e5' }]}>
              <View style={[styles.progressBarFill, { width: `${cachePercent}%` }]} />
            </View>

            {/* Stage Detail Label */}
            <Text style={[styles.stageText, { color: S.textLight }]} numberOfLines={1}>
              {cacheStage}
            </Text>
          </View>
        </View>
      </Modal>

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

            <Text style={[styles.modalSubtitle, { color: S.textLight, textAlign: 'center', marginBottom: 24 }]}>
              This will restore theme, accent colors, and data storage settings back to factory defaults.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}
                onPress={() => setShowResetModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: S.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ff9800' }]}
                onPress={handleResetSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.resetConfirmText}>Reset All</Text>
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
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  accentSwatchItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  cacheModalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,152,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentBadge: {
    backgroundColor: 'rgba(255,152,0,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 14,
  },
  percentText: {
    color: '#ff9800',
    fontSize: 20,
    fontWeight: '900',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: 4,
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
