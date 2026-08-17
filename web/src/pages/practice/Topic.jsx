import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoBookOutline,
  IoCreateOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoLockClosedOutline,
  IoTimeOutline,
  IoCellularOutline,
  IoChevronForwardOutline,
  IoHelpCircleOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { learningApi, practiceApi } from '../../services/api';

const TOPIC_META = {
  Algebra:      { color: '#2563eb', bg: 'rgba(37,99,235,0.12)'  },
  Geometry:     { color: '#00a472', bg: 'rgba(0,164,114,0.12)'  },
  Trigonometry: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const PRACTICE_SETS = [
  { id: 'basic',        title: 'Basic Equations Practice',  problems: 5,  difficulty: 'Easy'   },
  { id: 'intermediate', title: 'Intermediate Problems',      problems: 5,  difficulty: 'Medium' },
  { id: 'advanced',     title: 'Advanced Challenge Set',     problems: 5,  difficulty: 'Hard'   },
  { id: 'mixed',        title: 'Mixed Review',               problems: 15, difficulty: 'Medium' },
];

const diffColor = (d) =>
  d === 'Easy' ? 'text-emerald-600 bg-emerald-50' :
  d === 'Hard' ? 'text-red-500 bg-red-50' :
                 'text-yellow-600 bg-yellow-50';

export default function TopicScreen() {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mastery = location.state?.mastery ?? 0;
  const subtopicFilter = location.state?.subtopicFilter ?? 0;

  const [tab, setTab]           = useState('lessons');
  const [lessons, setLessons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const scrollRef = useRef(null);

  const meta = TOPIC_META[topicName] ?? { color: '#4b41e1', bg: 'rgba(75,65,225,0.12)' };

  useEffect(() => {
    learningApi.getLessons({ topic: topicName })
      .then(({ data }) => setLessons(data?.data?.lessons ?? data?.lessons ?? []))
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [topicName]);

  useEffect(() => {
  if (!subtopicFilter || lessons.length === 0) return;

  const exists = lessons.some(
    (lesson) => lesson.subtopic === subtopicFilter
  );

  if (exists) {
    setSelectedModule(subtopicFilter);
    setSearch('');
  }
}, [subtopicFilter, lessons]);

useEffect(() => {
  if (!subtopicFilter || !lessons.length || loading) return;

  const timer = setTimeout(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 100);

  return () => clearTimeout(timer);
}, [subtopicFilter, lessons, loading]);

  // Unique subtopic modules
  const moduleNames = [...new Set(lessons.map((l) => l.subtopic))].filter(Boolean);

  // Filtered lessons
  const filteredLessons = lessons.filter((l) => {
    const matchSearch = search === '' ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.subtopic?.toLowerCase().includes(search.toLowerCase());
    const matchModule = selectedModule === null || l.subtopic === selectedModule;
    return matchSearch && matchModule;
  });

  // Per-module completion
  const moduleStats = moduleNames.reduce((acc, mod) => {
    const modLessons = lessons.filter((l) => l.subtopic === mod);
    acc[mod] = { total: modLessons.length, completed: modLessons.filter((l) => l.userProgress?.status === 'completed').length };
    return acc;
  }, {});

  const activeModuleStats = selectedModule ? moduleStats[selectedModule] : null;
  const activeModuleDone  = activeModuleStats?.total > 0 && activeModuleStats.completed === activeModuleStats.total;

  // Next incomplete module
  const nextIncompleteModule = (() => {
    const startIdx = selectedModule ? moduleNames.indexOf(selectedModule) + 1 : 0;
    const ordered = [...moduleNames.slice(startIdx), ...moduleNames.slice(0, startIdx)];
    return ordered.find((mod) => moduleStats[mod] && moduleStats[mod].completed < moduleStats[mod].total) ?? null;
  })();

  const moduleLabel = (mod) => mod.includes(': ') ? mod.split(': ')[1] : mod;

  const completedTotal = lessons.filter((l) => l.userProgress?.status === 'completed').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate('/practice')}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
        >
          <IoArrowBackOutline size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{topicName}</h1>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {/* Stats card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4 flex justify-around">
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: meta.color }}>{mastery}%</p>
            <p className="text-xs text-gray-400">Mastery</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: meta.color }}>
              {loading ? '—' : `${completedTotal}/${lessons.length}`}
            </p>
            <p className="text-xs text-gray-400">Lessons</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {[['lessons', IoBookOutline], ['practice', IoCreateOutline]].map(([t, Icon]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>

        {tab === 'lessons' ? (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <IoSearchOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lessons…"
                  className="w-full border border-gray-200 rounded-xl py-2.5 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IoCloseOutline size={15} />
                  </button>
                )}
              </div>

              {/* Module chips */}
              {moduleNames.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                  <button
                    onClick={() => setSelectedModule(null)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedModule === null ? 'text-white border-purple-600' : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                    style={selectedModule === null ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                  >
                    All
                  </button>
                  {moduleNames.map((mod) => {
                    const active = selectedModule === mod;
                    const stats = moduleStats[mod];
                    const done = stats?.total > 0 && stats.completed === stats.total;
                    return (
                      <button
                        key={mod}
                        onClick={() => setSelectedModule(active ? null : mod)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                          active ? 'text-white border-purple-600' : 'bg-gray-100 border-gray-200 text-gray-600'
                        }`}
                        style={active ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                      >
                        {done && <IoCheckmarkCircle size={12} className="text-emerald-400" />}
                        {moduleLabel(mod)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Results count */}
              {(search || selectedModule) && (
                <p className="text-xs text-gray-400 mb-2">
                  {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
                </p>
              )}

              {/* Lesson list */}
              {filteredLessons.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <IoSearchOutline size={32} className="mx-auto mb-2 opacity-50" />
                  No lessons match your search
                  <button
                    onClick={() => { setSearch(''); setSelectedModule(null); }}
                    className="block mx-auto mt-2 text-purple-600 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5" ref={scrollRef}>
                  {filteredLessons.map((lesson, i) => {
                    const done   = lesson.userProgress?.status === 'completed';
                    const locked = lesson.isLocked;
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => !locked && navigate(`/practice/lesson/${lesson._id}`, {
                          state: { topicName, mastery, lessonTitle: lesson.title }
                        })}
                        disabled={locked}
                        className={`w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3 text-left transition-all ${
                          locked ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-200 hover:shadow-md'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: meta.bg }}
                        >
                          {done   ? <IoCheckmarkCircle size={22} className="text-emerald-500" /> :
                           locked ? <IoLockClosedOutline size={18} style={{ color: meta.color }} /> :
                           <span className="text-sm font-bold" style={{ color: meta.color }}>{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <IoTimeOutline size={12} /> {lesson.estimatedTime} min
                            {lesson.difficulty && <><IoCellularOutline size={12} /> {lesson.difficulty}</>}
                          </div>
                        </div>
                        {!locked && <IoChevronForwardOutline size={18} className="text-gray-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Module complete banner */}
              {activeModuleDone && nextIncompleteModule && (
                <button
                  onClick={() => {
                    setSelectedModule(nextIncompleteModule);
                    setSearch('');
                    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <IoCheckmarkCircle size={20} className="text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-emerald-800">Module complete!</p>
                      <p className="text-xs text-emerald-700">
                        Up next: <strong className="text-purple-700">{moduleLabel(nextIncompleteModule)}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <IoArrowForwardOutline size={16} className="text-purple-600" />
                  </div>
                </button>
              )}

              {/* All done banner */}
              {activeModuleDone && !nextIncompleteModule && (
                <div className="mt-4 text-center py-8">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="font-bold text-emerald-700">All lessons complete!</p>
                  <p className="text-sm text-emerald-600">You've finished every lesson in {topicName}.</p>
                </div>
              )}
            </>
          )
        ) : (
          /* Practice tab */
          <div className="space-y-3">
            {PRACTICE_SETS.map((set) => (
              <button
                key={set.id}
                onClick={() => navigate('/practice/problems', {
                  state: { topic: topicName, category: set.id, count: set.problems, title: set.title, difficulty: set.difficulty }
                })}
                className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-left flex items-center gap-4 hover:border-purple-200 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1.5">{set.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <IoHelpCircleOutline size={12} /> {set.problems} problems
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${diffColor(set.difficulty)}`}>
                      {set.difficulty}
                    </span>
                  </div>
                </div>
                <IoChevronForwardOutline size={18} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
