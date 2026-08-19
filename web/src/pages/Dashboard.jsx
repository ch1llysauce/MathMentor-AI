import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IoAnalyticsOutline,
  IoSchoolOutline,
  IoCheckmarkDoneOutline,
  IoTimerOutline,
  IoArrowForwardOutline,
  IoFlameOutline,
  IoCalculatorOutline,
  IoShapesOutline,
  IoCompassOutline,
  IoBarChartOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { progressApi, learningApi } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TOPIC_META = {
  Algebra: { Icon: IoCalculatorOutline, color: '#2563eb', description: 'Build your foundation with equations, expressions, and algebraic reasoning.' },
  Geometry: { Icon: IoShapesOutline, color: '#8b5cf6', description: 'Explore angles, shapes, areas, and spatial relationships.' },
  Trigonometry: { Icon: IoCompassOutline, color: '#f59e0b', description: 'Master ratios, triangles, and the unit circle with confidence.' },
};

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white dark:bg-[#1a2333] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} mb-3`}>
        <Icon size={22} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1 italic">{sub}</p>}
    </div>
  );
}

function TopicBreakdownItem({ topicName, meta, subtopicCount, mastery, navigate, primaryColor }) {
  const [hovered, setHovered] = useState(false);
  const Icon = meta.Icon;

  return (
    <div
      onClick={() => navigate(`/practice/topic/${encodeURIComponent(topicName)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? `${primaryColor}60` : undefined,
        backgroundColor: hovered ? `${primaryColor}0D` : undefined,
      }}
      className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: meta.color }}
          >
            <Icon size={18} />
          </div>
          <div>
            <h3
              className="text-sm font-semibold text-gray-900 dark:text-white transition-colors"
              style={{ color: hovered ? primaryColor : undefined }}
            >
              {topicName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtopicCount > 0 ? `${subtopicCount} subtopics` : '0 subtopics'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
          {mastery}% Mastery
        </span>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200/80 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(mastery, 100)}%`,
            backgroundColor: meta.color,
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { primaryColor } = useTheme();
  const navigate = useNavigate();
  const firstName = (user?.displayName ?? user?.name ?? 'Student').split(' ')[0];

  const [summary, setSummary] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [recProgress, setRecProgress] = useState({ progressPercentage: 0, completedLessons: 0, totalLessons: 0 });
  const [diagnosticDone, setDiagnosticDone] = useState(!!user?.diagnosticCompleted);
  const [cardReady, setCardReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ accuracy: 0, accuracyCorrect: 0, accuracyTotal: 0, avgSpeed: 0, currentStreak: 0 });

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Parallel: summary + diagnostic
      const [summaryRes, diagRes] = await Promise.allSettled([
        progressApi.getSummary(),
        learningApi.getLatestDiagnostic(),
      ]);

      if (summaryRes.status === 'fulfilled') {
        const d = summaryRes.value.data?.data ?? summaryRes.value.data;
        setSummary(d);
        const streak = d?.user?.currentStreak ?? 0;
        setStats((prev) => ({ ...prev, currentStreak: streak }));
      }

      if (diagRes.status === 'fulfilled') {
        const diag = diagRes.value.data?.data?.diagnostic ?? diagRes.value.data?.diagnostic ?? diagRes.value.data;
        if (diag?._id) {
          setDiagnostic(diag);
          setDiagnosticDone(true);
          const correct = diag.correctAnswers ?? 0;
          const total = diag.totalQuestions ?? 0;
          const time = diag.timeSpent ?? 0;
          setStats((prev) => ({
            ...prev,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
            accuracyCorrect: correct,
            accuracyTotal: total,
            avgSpeed: total > 0 ? Math.round(time / total) : 0,
          }));
        }
      }
    } catch { /* ignore */ }

    // Next recommendation — confirms diagnostic exists
    try {
      const recRes = await progressApi.getNextRecommendation();
      const rec = recRes.data?.data ?? recRes.data;
      setDiagnosticDone(true);
      if (rec?.nextStep) {
        setNextStep({
          topic: rec.nextStep.topic,
          subtopic: rec.nextStep.subtopic,
          currentScore: rec.nextStep.currentScore ?? 0,
          reason: rec.nextStep.reason ?? '',
          difficulty: rec.nextStep.difficulty ?? 'Easy',
          completedLessons: rec.nextStep.completedLessons ?? 0,
          totalLessonsInSubtopic: rec.nextStep.totalLessonsInSubtopic ?? 0,
        });
      }
      setRecProgress({
        progressPercentage: rec?.progressPercentage ?? 0,
        completedLessons: rec?.completedLessons ?? 0,
        totalLessons: rec?.totalLessons ?? 0,
      });
    } catch (err) {
      if (err?.response?.status !== 404) console.error(err);
    } finally {
      setCardReady(true);
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-gray-500">Loading your progress…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full pb-24 sm:pb-28">
      {/* Welcome */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Welcome back, {firstName}.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ready to solve some problems today?</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6 w-full">
        <button
          onClick={() => navigate('/tutor')}
          className="flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <IoSchoolOutline size={18} /> Resume Tutoring
        </button>
        <Link
          to="/diagnosis"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-3 px-4 rounded-xl transition-colors hover:opacity-90 border"
          style={{
            backgroundColor: `${primaryColor}18`,
            color: primaryColor,
            borderColor: `${primaryColor}40`,
          }}
        >
          <IoAnalyticsOutline size={18} />
          {diagnosticDone ? 'Diagnostic' : 'Take Diagnostic'}
        </Link>
      </div>

      {/* Featured card + Stats — side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Featured card */}
          {!cardReady ? (
            <FeaturedSkeleton />
          ) : nextStep ? (
            <FeaturedCard
              badge="NEXT IN YOUR PATH"
              title={nextStep.subtopic}
              description={nextStep.reason || TOPIC_META[nextStep.topic]?.description || `Continue building your ${nextStep.topic} skills.`}
              progressLabel={nextStep.totalLessonsInSubtopic ? `${nextStep.completedLessons ?? 0}/${nextStep.totalLessonsInSubtopic} lessons` : `${nextStep.subtopic} Progress`}
              progressPct={nextStep.currentScore}
              btnLabel="Start Lesson"
              onPress={() => navigate(`/practice/topic/${encodeURIComponent(nextStep.topic)}`, {
                state: { mastery: nextStep.currentScore, subtopicFilter: nextStep.subtopic }
              })}
              IconComponent={TOPIC_META[nextStep.topic]?.Icon ?? IoCalculatorOutline}
            />
          ) : diagnosticDone ? (
            <FeaturedCard
              badge={recProgress.progressPercentage > 0 ? 'GREAT JOB' : 'READY TO START'}
              title={recProgress.progressPercentage > 0 ? "You're crushing it!" : "Let's get to work!"}
              description={
                recProgress.totalLessons > 0
                  ? `You've completed ${recProgress.completedLessons} of ${recProgress.totalLessons} lessons. Keep exploring to sharpen your skills.`
                  : 'All recommended topics are complete. Keep practicing to maintain your mastery.'
              }
              progressLabel="Overall Progress"
              progressPct={recProgress.progressPercentage}
              btnLabel="Browse Topics"
              onPress={() => navigate('/practice')}
              IconComponent={IoFlameOutline}
            />
          ) : (
            <FeaturedCard
              badge="GET STARTED"
              title="Take the Diagnostic"
              description="Complete a short assessment so MathMentor can build your personalised learning path."
              progressLabel="Your Path"
              progressPct={0}
              btnLabel="Start Now"
              onPress={() => navigate('/diagnosis')}
              IconComponent={IoAnalyticsOutline}
            />
          )}

          {/* Topic Breakdown & Mastery Progress */}
          <div className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                  <IoBarChartOutline size={18} style={{ color: primaryColor }} /> Topic Breakdown & Mastery
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your progress across main domain areas</p>
              </div>
              <Link
                to="/practice"
                className="text-xs font-medium hover:underline flex items-center gap-1"
                style={{ color: primaryColor }}
              >
                View All <IoArrowForwardOutline size={12} />
              </Link>
            </div>

            <div className="space-y-3.5">
              {['Algebra', 'Geometry', 'Trigonometry'].map((topicName) => {
                const meta = TOPIC_META[topicName] || { Icon: IoCalculatorOutline, color: '#8b5cf6' };
                const diagKey = topicName.toLowerCase();
                const diagScore = diagnostic?.[`${diagKey}Score`] ?? diagnostic?.topicScores?.[diagKey]?.score ?? 0;
                const stats = summary?.topicStats?.find(
                  (t) => t.topic?.toLowerCase() === topicName.toLowerCase()
                );
                const statsScore = stats?.averageMastery ?? stats?.accuracy ?? 0;
                const mastery = Math.round(Math.max(diagScore, statsScore));
                const subtopicCount = stats?.subtopics?.length ?? (diagnostic?.topicScores?.[diagKey]?.subtopicScores ? Object.keys(diagnostic.topicScores[diagKey].subtopicScores).length : 0);

                return (
                  <TopicBreakdownItem
                    key={topicName}
                    topicName={topicName}
                    meta={meta}
                    subtopicCount={subtopicCount}
                    mastery={mastery}
                    navigate={navigate}
                    primaryColor={primaryColor}
                  />
                );
              })}
            </div>
          </div>

          {/* Streak */}
          {stats.currentStreak > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-4 flex items-center gap-3">
              <IoFlameOutline size={24} className="text-orange-500 shrink-0" />
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-300">{stats.currentStreak}-day streak</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Keep it going — practice something today.</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats — stacked in the sidebar on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-fit">
          <StatCard
            label="Accuracy"
            value={stats.accuracyTotal > 0 ? `${stats.accuracy}%` : '—'}
            sub={stats.accuracyTotal > 0 ? `${stats.accuracyCorrect}/${stats.accuracyTotal} · Diagnostic Results` : undefined}
            icon={IoCheckmarkDoneOutline}
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            label="Avg. Speed"
            value={stats.avgSpeed > 0 ? `${stats.avgSpeed}s` : '—'}
            icon={IoTimerOutline}
            iconBg="bg-red-50 dark:bg-red-950/40"
            iconColor="text-red-500 dark:text-red-400"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className="bg-purple-600 rounded-3xl p-6 min-h-64 space-y-4 animate-pulse">
      <div className="w-28 h-5 bg-white/20 rounded-full" />
      <div className="w-2/3 h-8 bg-white/20 rounded-lg" />
      <div className="w-full h-4 bg-white/10 rounded" />
      <div className="w-4/5 h-4 bg-white/10 rounded" />
    </div>
  );
}

function FeaturedCard({ badge, title, description, progressLabel, progressPct, btnLabel, onPress, IconComponent }) {
  const { themeGradient } = useTheme();
  return (
    <div
      className="rounded-3xl p-6 relative overflow-hidden shadow-lg transition-all"
      style={{ background: themeGradient }}
    >
      {/* Background icon */}
      <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
        <IconComponent size={80} color="#ffffff" />
      </div>

      <span className="inline-block bg-white/20 text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full mb-4">
        {badge}
      </span>

      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/80 text-sm leading-relaxed mb-6">{description}</p>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-white/80 text-xs mb-1.5">
            <span>{progressLabel}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
        <button
          onClick={onPress}
          className="shrink-0 bg-white text-gray-900 text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
