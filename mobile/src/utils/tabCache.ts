/**
 * Centralized module-level cache for tab screens.
 * All cache vars live here so AuthContext can clear them in one call on logout,
 * preventing stale data from a previous account flashing on the next one.
 */

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashCache: {
  data: any | null;
  topicMastery: { topic: string; mastery: number }[];
  nextStep: any | null;
  recommendationProgress: { progressPercentage: number; completedLessons: number; totalLessons: number };
} = {
  data: null,
  topicMastery: [],
  nextStep: null,
  recommendationProgress: { progressPercentage: 0, completedLessons: 0, totalLessons: 0 },
};

// ── Diagnostic ────────────────────────────────────────────────────────────────
export const diagCache: {
  diagnostic: any | null;
  timelineData: any[];
  loaded: boolean;
} = { diagnostic: null, timelineData: [], loaded: false };

// ── Practice ──────────────────────────────────────────────────────────────────
export const practiceCache: {
  topics: any[] | null;
  mastery: any | null;
} = { topics: null, mastery: null };

// ── Clear all caches (call on logout) ─────────────────────────────────────────
export function clearTabCaches() {
  dashCache.data = null;
  dashCache.topicMastery = [];
  dashCache.nextStep = null;
  dashCache.recommendationProgress = { progressPercentage: 0, completedLessons: 0, totalLessons: 0 };

  diagCache.diagnostic = null;
  diagCache.timelineData = [];
  diagCache.loaded = false;

  practiceCache.topics = null;
  practiceCache.mastery = null;
}
