import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoTrophyOutline,
  IoChevronForwardOutline,
  IoBookOutline,
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoCalculatorOutline,
  IoShapesOutline,
  IoAnalyticsOutline,
  IoLockClosedOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import { learningApi, practiceApi, progressApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TOPIC_META = {
  Algebra:      { color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  Icon: IoCalculatorOutline },
  Geometry:     { color: '#00a472', bg: 'rgba(0,164,114,0.12)',  Icon: IoShapesOutline },
  Trigonometry: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', Icon: IoAnalyticsOutline },
};

const DAILY_TOPICS = ['Algebra', 'Geometry', 'Trigonometry'];

export function PracticeTopicCard({ topic, navigate, masteryLabel }) {
  const { darkMode, primaryColor } = useTheme();
  const [hovered, setHovered] = useState(false);
  const meta = TOPIC_META[topic.name] ?? { color: primaryColor, bg: `${primaryColor}18`, Icon: IoBookOutline };
  const TopicIcon = meta.Icon;
  const ml = masteryLabel(topic.mastery);
  const barColor = topic.mastery >= 80 ? '#00a472' : topic.mastery >= 60 ? '#f59e0b' : '#ef4444';

  const cardBase = darkMode ? '#1a2333' : '#ffffff';

  return (
    <button
      onClick={() => navigate(`/practice/topic/${encodeURIComponent(topic.name)}`, { state: { mastery: topic.mastery } })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${cardBase} 0%, ${meta.color}22 100%)`
          : `linear-gradient(135deg, ${cardBase} 0%, ${meta.color}0E 100%)`,
        borderColor: hovered ? `${meta.color}50` : darkMode ? '#2d3748' : `${meta.color}25`,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 6px 20px ${meta.color}20` : undefined,
      }}
      className="w-full bg-white dark:bg-[#1a2333] border rounded-3xl p-5 sm:p-6 shadow-2xs text-left transition-all flex flex-col group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-2xs border transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${meta.color}2E 0%, ${meta.color}0E 100%)`,
            borderColor: `${meta.color}38`,
          }}
        >
          <TopicIcon size={30} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-lg font-bold text-gray-900 dark:text-white transition-colors"
            style={{ color: hovered ? meta.color : undefined }}
          >
            {topic.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <IoBookOutline size={13} className="text-gray-400" />
              {topic.lessons > 0
                ? `${topic.completedLessons}/${topic.lessons} lessons`
                : '0 lessons'}
            </span>
          </div>
        </div>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
            hovered ? 'text-white shadow-md' : 'bg-gray-100 dark:bg-[#252f40] text-gray-400 dark:text-gray-300'
          }`}
          style={{
            backgroundColor: hovered ? meta.color : undefined,
          }}
        >
          <IoChevronForwardOutline size={18} />
        </div>
      </div>

      {/* Mastery progress */}
      <div className="mb-4 mt-auto w-full">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400 font-medium">Mastery Level</span>
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-xs px-2 py-0.5 rounded-md border ${ml.bg} ${ml.color}`}>{ml.label}</span>
            <span className="font-bold text-gray-900 dark:text-white">{topic.mastery}%</span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 shadow-2xs"
            style={{ width: `${Math.min(topic.mastery, 100)}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Subtopic tags */}
      {topic.subtopics.length > 0 && (
        <div className="w-full pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Key Subtopics:</p>
          <div className="flex flex-wrap gap-1.5">
            {topic.subtopics.slice(0, 3).map((s) => (
              <span key={s} className="text-xs bg-gray-100/80 dark:bg-[#252f40] border border-gray-200/80 dark:border-[#2d3748] text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-xl truncate max-w-[140px] font-medium">{s}</span>
            ))}
            {topic.subtopics.length > 3 && (
              <span className="text-xs bg-gray-100/80 dark:bg-[#252f40] border border-gray-200/80 dark:border-[#2d3748] text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-xl shrink-0 font-medium">+{topic.subtopics.length - 3}</span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

export default function PracticeIndex() {
  const navigate = useNavigate();
  const { darkMode, primaryColor } = useTheme();
  const cardBase = darkMode ? '#1a2333' : '#ffffff';

  const [topics, setTopics]          = useState([]);
  const [loading, setLoading]        = useState(true);
  const [search, setSearch]          = useState('');
  const [filter, setFilter]          = useState('all');
  const [dailyDone, setDailyDone]    = useState(false);
  const [dailyScore, setDailyScore]  = useState(null);
  const [dailyHovered, setDailyHovered] = useState(false);

  const dailyTopic = DAILY_TOPICS[(new Date().getDate() + new Date().getMonth() * 3) % DAILY_TOPICS.length];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [diagRes, lessonsRes, summaryRes] = await Promise.allSettled([
          learningApi.getLatestDiagnostic(),
          learningApi.getLessons(),
          progressApi.getSummary(),
        ]);

        let diagData = null;
        if (diagRes.status === 'fulfilled') {
          const d = diagRes.value?.data;
          diagData = d?.data?.diagnostic ?? d?.diagnostic;
        }

        const lessonsData = lessonsRes.status === 'fulfilled'
          ? (lessonsRes.value?.data?.data?.lessons ?? lessonsRes.value?.data?.lessons ?? [])
          : [];

        let topicStats = [];
        if (summaryRes.status === 'fulfilled') {
          const s = summaryRes.value?.data;
          topicStats = s?.data?.topicStats ?? s?.topicStats ?? [];
        }

        const topicMap = {};
        lessonsData.forEach((l) => {
          const t = l.topic;
          if (!topicMap[t]) topicMap[t] = { subtopics: new Set(), lessons: 0, completedLessons: 0 };
          topicMap[t].subtopics.add(l.subtopic);
          topicMap[t].lessons += 1;
          if (l.userProgress?.status === 'completed') topicMap[t].completedLessons += 1;
        });

        // Compute combined topic mastery (max of diagnostic vs. practice stats)
        const getCombinedMastery = (topicName) => {
          const k = topicName.toLowerCase();
          let diagScore = 0;
          if (diagData) {
            if (k === 'algebra')           diagScore = diagData.algebraScore ?? diagData.topicScores?.algebra?.score ?? 0;
            else if (k === 'geometry')     diagScore = diagData.geometryScore ?? diagData.topicScores?.geometry?.score ?? 0;
            else if (k === 'trigonometry') diagScore = diagData.trigonometryScore ?? diagData.topicScores?.trigonometry?.score ?? 0;
          }
          const statObj = topicStats.find((ts) => ts.topic?.toLowerCase() === k);
          const statScore = statObj?.averageMastery ?? statObj?.accuracy ?? 0;
          return Math.round(Math.max(diagScore, statScore));
        };

        const topicList = Object.entries(topicMap).map(([name, data]) => ({
          name,
          mastery: getCombinedMastery(name),
          lessons: data.lessons,
          completedLessons: data.completedLessons,
          subtopics: [...data.subtopics],
        }));

        setTopics(topicList.length ? topicList : [
          { name: 'Algebra',      mastery: getCombinedMastery('Algebra'),      lessons: 0, completedLessons: 0, subtopics: [] },
          { name: 'Geometry',     mastery: getCombinedMastery('Geometry'),     lessons: 0, completedLessons: 0, subtopics: [] },
          { name: 'Trigonometry', mastery: getCombinedMastery('Trigonometry'), lessons: 0, completedLessons: 0, subtopics: [] },
        ]);
      } catch {
        setTopics([
          { name: 'Algebra',      mastery: 0, lessons: 0, completedLessons: 0, subtopics: [] },
          { name: 'Geometry',     mastery: 0, lessons: 0, completedLessons: 0, subtopics: [] },
          { name: 'Trigonometry', mastery: 0, lessons: 0, completedLessons: 0, subtopics: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    practiceApi.getDailyStatus()
      .then(({ data }) => {
        const d = data?.data ?? data;
        setDailyDone(d?.done ?? false);
        if (d?.done && d.score != null) setDailyScore({ score: d.score, total: d.total });
      })
      .catch(() => {});
  }, []);

  const masteryLabel = (m) =>
    m >= 80 ? { label: 'Expert',     color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60' } :
    m >= 60 ? { label: 'Proficient', color: 'text-amber-700 dark:text-amber-300',     bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'     } :
              { label: 'Learning',   color: 'text-red-700 dark:text-red-300',         bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/60'             };

  const filteredTopics = topics.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subtopics.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'weak')   return matchSearch && t.mastery < 70;
    if (filter === 'strong') return matchSearch && t.mastery >= 80;
    return matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 pb-24 sm:pb-28">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border"
              style={{
                color: primaryColor,
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}30`,
              }}
            >
              <IoSparklesOutline size={12} /> Adaptive Learning
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Practice</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-5">Choose a topic to master through lessons and practice modules</p>

          {/* Search bar */}
          <div className="relative mb-4">
            <IoSearchOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics or subtopics…"
              className="w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-2xl py-3 pl-11 pr-10 text-sm shadow-2xs focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
              style={{ borderColor: search ? primaryColor : undefined }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <IoCloseOutline size={18} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 pb-1">
            {[
              { id: 'all',    label: 'All Topics' },
              { id: 'weak',   label: 'Need Practice', Icon: IoArrowDownOutline },
              { id: 'strong', label: 'Strong Areas',  Icon: IoArrowUpOutline },
            ].map(({ id, label, Icon }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  style={{
                    backgroundColor: active ? primaryColor : undefined,
                    borderColor: active ? primaryColor : undefined,
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'text-white shadow-md'
                      : 'bg-white dark:bg-[#1a2333] border-gray-200 dark:border-[#2d3748] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#252f40]'
                  }`}
                >
                  {Icon && <Icon size={14} className={active ? 'text-white' : 'text-gray-600 dark:text-white'} />}
                  <span className={active ? 'text-white' : 'text-gray-700 dark:text-white'}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topic cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-3xl p-8 shadow-2xs">
          <IoSearchOutline size={44} className="mx-auto mb-3 text-gray-300" />
          <p className="text-base font-semibold text-gray-700 dark:text-white">No topics found</p>
          <p className="text-xs text-gray-400 mt-1">Try searching for a different keyword or resetting your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <PracticeTopicCard key={topic.name} topic={topic} navigate={navigate} masteryLabel={masteryLabel} />
          ))}
        </div>
      )}

      {/* Daily challenge */}
      <div className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-3xl p-5 sm:p-6 shadow-2xs">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</p>
        <button
          onClick={dailyDone ? undefined : () => navigate(`/practice/problems`, { state: { topic: dailyTopic, category: 'mixed', count: 10, title: `Daily Challenge — ${dailyTopic}`, isDaily: true } })}
          disabled={dailyDone}
          onMouseEnter={() => setDailyHovered(true)}
          onMouseLeave={() => setDailyHovered(false)}
          style={{
            background: dailyDone
              ? `linear-gradient(135deg, ${darkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.06)'} 0%, ${cardBase} 100%)`
              : dailyHovered
                ? `linear-gradient(135deg, ${cardBase} 0%, rgba(245,158,11,0.20) 100%)`
                : `linear-gradient(135deg, ${cardBase} 0%, rgba(245,158,11,0.08) 100%)`,
            borderColor: dailyDone ? '#10b98150' : dailyHovered ? '#f59e0b60' : darkMode ? '#2d3748' : '#f59e0b30',
            transform: !dailyDone && dailyHovered ? 'translateY(-2px)' : 'none',
          }}
          className={`w-full bg-white dark:bg-[#1a2333] border rounded-2xl p-4 text-left flex items-center gap-4 shadow-2xs transition-all ${
            dailyDone ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-2xs border"
            style={{
              background: dailyDone
                ? 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.1) 100%)',
              borderColor: dailyDone ? '#10b98140' : '#f59e0b40',
              color: dailyDone ? '#10b981' : '#f59e0b',
            }}
          >
            {dailyDone
              ? <IoCheckmarkCircle size={28} />
              : <IoTrophyOutline size={28} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-gray-900 dark:text-white">Daily Challenge</p>
              {dailyDone && dailyScore && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {dailyScore.score}/{dailyScore.total}
                </span>
              )}
              {dailyDone && !dailyScore && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Done ✓</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {dailyDone
                ? (dailyScore ? `Score: ${dailyScore.score}/${dailyScore.total} · Come back tomorrow!` : 'Come back tomorrow for a new challenge!')
                : `Today: ${dailyTopic} — 10 mixed problems`}
            </p>
          </div>
          {dailyDone
            ? <IoLockClosedOutline size={18} className="text-emerald-500 shrink-0" />
            : <IoChevronForwardOutline size={18} className="text-gray-400 shrink-0" />
          }
        </button>
      </div>
    </div>
  );
}
