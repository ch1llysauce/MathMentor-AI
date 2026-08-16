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
} from 'react-icons/io5';
import { learningApi, practiceApi } from '../../services/api';

const TOPIC_META = {
  Algebra:      { color: '#2563eb', bg: 'rgba(37,99,235,0.12)',  Icon: IoCalculatorOutline },
  Geometry:     { color: '#00a472', bg: 'rgba(0,164,114,0.12)',  Icon: IoShapesOutline },
  Trigonometry: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', Icon: IoAnalyticsOutline },
};

const DAILY_TOPICS = ['Algebra', 'Geometry', 'Trigonometry'];

export default function PracticeIndex() {
  const navigate = useNavigate();

  const [topics, setTopics]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [dailyDone, setDailyDone] = useState(false);
  const [dailyScore, setDailyScore] = useState(null);

  const dailyTopic = DAILY_TOPICS[(new Date().getDate() + new Date().getMonth() * 3) % DAILY_TOPICS.length];

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [diagRes, lessonsRes] = await Promise.allSettled([
          learningApi.getLatestDiagnostic(),
          learningApi.getLessons(),
        ]);

        let diagData = null;
        if (diagRes.status === 'fulfilled') {
          const d = diagRes.value?.data;
          diagData = d?.data?.diagnostic ?? d?.diagnostic;
        }

        const lessonsData = lessonsRes.status === 'fulfilled'
          ? (lessonsRes.value?.data?.data?.lessons ?? lessonsRes.value?.data?.lessons ?? [])
          : [];

        const topicMap = {};
        lessonsData.forEach((l) => {
          const t = l.topic;
          if (!topicMap[t]) topicMap[t] = { subtopics: new Set(), lessons: 0, completedLessons: 0 };
          topicMap[t].subtopics.add(l.subtopic);
          topicMap[t].lessons += 1;
          if (l.userProgress?.status === 'completed') topicMap[t].completedLessons += 1;
        });

        const topicList = Object.entries(topicMap).map(([name, data]) => {
          let mastery = 0;
          if (diagData) {
            const k = name.toLowerCase();
            if (k === 'algebra')           mastery = diagData.algebraScore ?? 0;
            else if (k === 'geometry')     mastery = diagData.geometryScore ?? 0;
            else if (k === 'trigonometry') mastery = diagData.trigonometryScore ?? 0;
          }
          return {
            name,
            mastery,
            lessons: data.lessons,
            completedLessons: data.completedLessons,
            subtopics: [...data.subtopics],
          };
        });

        setTopics(topicList.length ? topicList : [
          { name: 'Algebra',      mastery: diagData?.algebraScore ?? 0,      lessons: 0, completedLessons: 0, subtopics: [] },
          { name: 'Geometry',     mastery: diagData?.geometryScore ?? 0,     lessons: 0, completedLessons: 0, subtopics: [] },
          { name: 'Trigonometry', mastery: diagData?.trigonometryScore ?? 0, lessons: 0, completedLessons: 0, subtopics: [] },
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
    m >= 80 ? { label: 'Expert',     color: 'text-emerald-600' } :
    m >= 60 ? { label: 'Proficient', color: 'text-yellow-600'  } :
              { label: 'Learning',   color: 'text-red-500'      };

  const filteredTopics = topics.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subtopics.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'weak')   return matchSearch && t.mastery < 70;
    if (filter === 'strong') return matchSearch && t.mastery >= 80;
    return matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Practice</h1>
      <p className="text-gray-500 text-sm mb-5">Choose a topic to master</p>

      {/* Search */}
      <div className="relative mb-4">
        <IoSearchOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics or subtopics…"
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IoCloseOutline size={16} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { id: 'all',    label: 'All Topics' },
          { id: 'weak',   label: 'Need Practice', Icon: IoArrowDownOutline },
          { id: 'strong', label: 'Strong Areas',  Icon: IoArrowUpOutline },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
              filter === id
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
            }`}
          >
            {Icon && <Icon size={13} />}
            {label}
          </button>
        ))}
      </div>

      {/* Topic cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <IoSearchOutline size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No topics found</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {filteredTopics.map((topic) => {
            const meta = TOPIC_META[topic.name] ?? { color: '#4b41e1', bg: 'rgba(75,65,225,0.12)', Icon: IoBookOutline };
            const TopicIcon = meta.Icon;
            const ml = masteryLabel(topic.mastery);
            const barColor = topic.mastery >= 80 ? '#00a472' : topic.mastery >= 60 ? '#f59e0b' : '#ef4444';

            return (
              <button
                key={topic.name}
                onClick={() => navigate(`/practice/topic/${encodeURIComponent(topic.name)}`, { state: { mastery: topic.mastery } })}
                className="w-full bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-left hover:border-purple-200 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg }}>
                    <TopicIcon size={28} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900">{topic.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <IoBookOutline size={12} />
                        {topic.lessons > 0
                          ? `${topic.completedLessons}/${topic.lessons} lessons`
                          : '0 lessons'}
                      </span>
                    </div>
                  </div>
                  <IoChevronForwardOutline size={18} className="text-gray-300 shrink-0" />
                </div>

                {/* Mastery progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Mastery Level</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${ml.color}`}>{ml.label}</span>
                      <span className="font-bold text-gray-900">{topic.mastery}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${topic.mastery}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>

                {/* Subtopic tags */}
                {topic.subtopics.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Key Subtopics:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.subtopics.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                      {topic.subtopics.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">+{topic.subtopics.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Daily challenge */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</p>
        <button
          onClick={dailyDone ? undefined : () => navigate(`/practice/problems`, { state: { topic: dailyTopic, category: 'mixed', count: 10, title: `Daily Challenge — ${dailyTopic}`, isDaily: true } })}
          disabled={dailyDone}
          className={`w-full bg-white border rounded-2xl p-4 text-left flex items-center gap-4 shadow-sm transition-all ${
            dailyDone ? 'border-emerald-400 cursor-default' : 'border-gray-100 hover:border-yellow-300 hover:shadow-md'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dailyDone ? 'bg-emerald-100' : 'bg-yellow-100'}`}>
            {dailyDone
              ? <IoCheckmarkCircle size={24} className="text-emerald-500" />
              : <IoTrophyOutline size={24} className="text-yellow-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-gray-900">Daily Challenge</p>
              {dailyDone && dailyScore && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {dailyScore.score}/{dailyScore.total}
                </span>
              )}
              {dailyDone && !dailyScore && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Done ✓</span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {dailyDone
                ? (dailyScore ? `Score: ${dailyScore.score}/${dailyScore.total} · Come back tomorrow!` : 'Come back tomorrow for a new challenge!')
                : `Today: ${dailyTopic} — 10 mixed problems`}
            </p>
          </div>
          {dailyDone
            ? <IoLockClosedOutline size={18} className="text-emerald-500 shrink-0" />
            : <IoChevronForwardOutline size={18} className="text-gray-300 shrink-0" />
          }
        </button>
      </div>
    </div>
  );
}
