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
  IoChevronBackOutline,
  IoHelpCircleOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { learningApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TOPIC_META = {
  Algebra: { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  Geometry: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Trigonometry: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const PRACTICE_SETS = [
  { id: 'basic', title: 'Basic Equations Practice', problems: 5, difficulty: 'Easy' },
  { id: 'intermediate', title: 'Intermediate Problems', problems: 5, difficulty: 'Medium' },
  { id: 'advanced', title: 'Advanced Challenge Set', problems: 5, difficulty: 'Hard' },
  { id: 'mixed', title: 'Mixed Review', problems: 15, difficulty: 'Medium' },
];

const diffColor = (d) =>
  d === 'Easy' ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60' :
    d === 'Hard' ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60' :
      'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60';

function LessonCard({ lesson, index, locked, done, navigate, topicName, mastery }) {
  const { darkMode, primaryColor } = useTheme();
  const [hovered, setHovered] = useState(false);
  const cardBase = darkMode ? '#1a2333' : '#ffffff';
  const topicColor = TOPIC_META[topicName]?.color || primaryColor || '#2563eb';

  return (
    <button
      onClick={() => !locked && navigate(`/practice/lesson/${lesson._id}`, {
        state: { topicName, mastery, lessonTitle: lesson.title }
      })}
      disabled={locked}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: !locked && hovered
          ? `linear-gradient(135deg, ${cardBase} 0%, ${topicColor}28 100%)`
          : !locked
            ? `linear-gradient(135deg, ${cardBase} 0%, ${topicColor}14 100%)`
            : undefined,
        borderColor: !locked && hovered ? `${topicColor}60` : darkMode ? '#2d3748' : undefined,
        transform: !locked && hovered ? 'translateY(-2px)' : 'none',
        boxShadow: !locked && hovered ? `0 4px 14px ${topicColor}25` : undefined,
      }}
      className={`w-full bg-white dark:bg-[#1a2333] border rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 text-left transition-all ${
        locked
          ? 'border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/50'
          : 'border-gray-100 dark:border-gray-700 cursor-pointer'
      }`}
    >
      {/* Lesson Icon */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform border ${
          done
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200/60'
            : locked
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent'
              : ''
        }`}
        style={{
          background: !done && !locked
            ? `linear-gradient(135deg, ${topicColor}30 0%, ${topicColor}10 100%)`
            : undefined,
          color: !done && !locked ? topicColor : undefined,
          borderColor: !done && !locked ? `${topicColor}45` : undefined,
        }}
      >
        {done ? (
          <IoCheckmarkCircle size={24} className="text-emerald-500" />
        ) : locked ? (
          <IoLockClosedOutline size={20} />
        ) : (
          <span className="text-sm font-extrabold">{index + 1}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${locked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <IoTimeOutline size={13} className="text-gray-400" /> {lesson.estimatedTime} min
          </span>
          {lesson.difficulty && (
            <span className="flex items-center gap-1 font-medium">
              <IoCellularOutline size={13} className="text-gray-400" /> {lesson.difficulty}
            </span>
          )}
        </div>
      </div>

      {!locked && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            hovered ? 'text-white' : 'bg-gray-100 dark:bg-[#252f40] text-gray-400 dark:text-gray-300'
          }`}
          style={{
            backgroundColor: hovered ? primaryColor : undefined,
          }}
        >
          <IoChevronForwardOutline size={16} />
        </div>
      )}
    </button>
  );
}

function PracticeSetCard({ set, navigate, topicName, meta }) {
  const { primaryColor } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => navigate('/practice/problems', {
        state: { topic: topicName, category: set.id, count: set.problems, title: set.title, difficulty: set.difficulty }
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? `${primaryColor}60` : undefined,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.05)' : undefined,
      }}
      className="w-full bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-2xs text-left flex items-center gap-4 transition-all cursor-pointer group"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
        style={{ backgroundColor: meta.bg, color: meta.color }}
      >
        <IoCreateOutline size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-bold text-gray-900 dark:text-white transition-colors mb-1.5"
          style={{ color: hovered ? primaryColor : undefined }}
        >
          {set.title}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1 font-medium">
            <IoHelpCircleOutline size={14} className="text-gray-400" /> {set.problems} problems
          </span>
          <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${diffColor(set.difficulty)}`}>
            {set.difficulty}
          </span>
        </div>
      </div>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          hovered ? 'text-white' : 'bg-gray-100 dark:bg-[#252f40] text-gray-400 dark:text-gray-300'
        }`}
        style={{
          backgroundColor: hovered ? primaryColor : undefined,
        }}
      >
        <IoChevronForwardOutline size={18} />
      </div>
    </button>
  );
}

export default function TopicScreen() {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor } = useTheme();

  const mastery = location.state?.mastery ?? 0;
  const subtopicFilter = location.state?.subtopicFilter ?? 0;

  const [tab, setTab] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const scrollRef = useRef(null);
  const subtopicScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const meta = TOPIC_META[topicName] ?? { color: primaryColor, bg: `${primaryColor}18` };

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

  const checkSubtopicScroll = () => {
    const el = subtopicScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    checkSubtopicScroll();
    const timer = setTimeout(checkSubtopicScroll, 200);
    window.addEventListener('resize', checkSubtopicScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkSubtopicScroll);
    };
  }, [moduleNames, loading]);

  const scrollSubtopics = (direction) => {
    const el = subtopicScrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleWheelScroll = (e) => {
    const el = subtopicScrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      checkSubtopicScroll();
    }
  };

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
  const activeModuleDone = activeModuleStats?.total > 0 && activeModuleStats.completed === activeModuleStats.total;

  // Next incomplete module
  const nextIncompleteModule = (() => {
    const startIdx = selectedModule ? moduleNames.indexOf(selectedModule) + 1 : 0;
    const ordered = [...moduleNames.slice(startIdx), ...moduleNames.slice(0, startIdx)];
    return ordered.find((mod) => moduleStats[mod] && moduleStats[mod].completed < moduleStats[mod].total) ?? null;
  })();

  const moduleLabel = (mod) => mod.includes(': ') ? mod.split(': ')[1] : mod;

  const completedTotal = lessons.filter((l) => l.userProgress?.status === 'completed').length;

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50 dark:bg-[#0f172a]/50">
      {/* Top Header Nav */}
      <div className="bg-white dark:bg-[#1a2333] border-b border-gray-100 dark:border-gray-800 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-2xs">
        <button
          onClick={() => navigate('/practice')}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
        >
          <IoArrowBackOutline size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{topicName}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mastery Path & Exercises</p>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 pb-24 sm:pb-28">
        {/* Top Topic Hero & Stats Banner */}
        <div className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          {/* Accent decoration */}
          <div
            className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-2xl opacity-15 pointer-events-none"
            style={{ backgroundColor: meta.color }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left Info */}
            <div className="space-y-2">
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-2xs"
                style={{ backgroundColor: meta.color }}
              >
                {topicName} Module
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {topicName} Mastery & Lessons
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                Explore structured step-by-step interactive lessons or test your speed and accuracy in practice sets.
              </p>
            </div>

            {/* Stats Card */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 bg-gray-50/80 dark:bg-[#252f40] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-[#2d3748] shrink-0 min-w-[280px] sm:min-w-[320px]">
              {/* Mastery Stat */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">
                  {mastery}%
                </p>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: primaryColor }}
                >
                  Mastery
                </p>
              </div>

              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 shrink-0" />

              {/* Lessons Stat */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">
                  {loading ? '—' : `${completedTotal}/${lessons.length}`}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  Lessons Done
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
              <span>Overall {topicName} Completion</span>
              <span className="font-semibold text-gray-700 dark:text-white">
                {lessons.length > 0 ? Math.round((completedTotal / lessons.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-2xs"
                style={{
                  width: `${lessons.length > 0 ? Math.min((completedTotal / lessons.length) * 100, 100) : 0}%`,
                  backgroundColor: meta.color,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white dark:bg-[#1a2333] border border-gray-200/80 dark:border-gray-700 rounded-2xl p-1.5 shadow-2xs w-full">
          {[['lessons', IoBookOutline, 'Lessons'], ['practice', IoCreateOutline, 'Practice Sets']].map(([t, Icon, label]) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  backgroundColor: active ? primaryColor : undefined,
                }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'lessons' ? (
          loading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <IoSearchOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lessons by title or topic..."
                  className="w-full bg-white dark:bg-[#1a2333] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-10 text-sm shadow-2xs focus:outline-none"
                  style={{ borderColor: search ? primaryColor : undefined }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <IoCloseOutline size={18} />
                  </button>
                )}
              </div>

              {/* Module chips with PC wrapping & Mobile scroll support */}
              {moduleNames.length > 1 && (
                <div className="relative flex items-center group py-1">
                  {/* Left Scroll Arrow (Mobile only) */}
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollSubtopics('left')}
                      aria-label="Scroll left"
                      className="md:hidden absolute -left-2 z-10 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md text-gray-700 dark:text-zinc-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                    >
                      <IoChevronBackOutline size={16} />
                    </button>
                  )}

                  {/* Chips Track: Wraps on PC (md:flex-wrap), Scrolls on Mobile */}
                  <div
                    ref={subtopicScrollRef}
                    onScroll={checkSubtopicScroll}
                    onWheel={handleWheelScroll}
                    className="flex flex-wrap gap-2 max-md:flex-nowrap max-md:overflow-x-auto max-md:pb-1.5 scrollbar-none scroll-smooth w-full px-0.5"
                  >
                    <button
                      onClick={() => setSelectedModule(null)}
                      style={{
                        backgroundColor: selectedModule === null ? primaryColor : undefined,
                        borderColor: selectedModule === null ? primaryColor : undefined,
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-2xs cursor-pointer ${
                        selectedModule === null
                          ? 'text-white'
                          : 'bg-white dark:bg-[#1a2333] border-gray-200 dark:border-[#2d3748] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#252f40]'
                      }`}
                    >
                      All Subtopics
                    </button>
                    {moduleNames.map((mod) => {
                      const active = selectedModule === mod;
                      const stats = moduleStats[mod];
                      const done = stats?.total > 0 && stats.completed === stats.total;
                      return (
                        <button
                          key={mod}
                          onClick={() => setSelectedModule(active ? null : mod)}
                          style={{
                            backgroundColor: active ? primaryColor : undefined,
                            borderColor: active ? primaryColor : undefined,
                          }}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-2xs cursor-pointer ${
                            active
                              ? 'text-white'
                              : 'bg-white dark:bg-[#1a2333] border-gray-200 dark:border-[#2d3748] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#252f40]'
                          }`}
                        >
                          {done && (
                            <IoCheckmarkCircle
                              size={15}
                              className={active ? 'text-emerald-300' : 'text-emerald-500'}
                            />
                          )}
                          <span>{moduleLabel(mod)}</span>
                          {stats?.total > 0 && (
                            <span className={`ml-0.5 text-[11px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                              active
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200/80 dark:bg-[#252f40] text-gray-800 dark:text-white border border-gray-300/40 dark:border-[#374151]'
                            }`}>
                              {stats.completed}/{stats.total}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Scroll Arrow (Mobile only) */}
                  {canScrollRight && (
                    <button
                      onClick={() => scrollSubtopics('right')}
                      aria-label="Scroll right"
                      className="md:hidden absolute -right-2 z-10 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md text-gray-700 dark:text-zinc-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                    >
                      <IoChevronForwardOutline size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Results count */}
              {(search || selectedModule) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Showing {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
                </p>
              )}

              {/* Lesson list */}
              {filteredLessons.length === 0 ? (
                <div className="bg-white dark:bg-[#1a2333] rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 text-sm shadow-2xs">
                  <IoSearchOutline size={36} className="mx-auto mb-2 opacity-40 text-gray-400" />
                  <p className="font-semibold text-gray-700 dark:text-white mb-1">No matching lessons found</p>
                  <p className="text-xs text-gray-400 mb-3">Try searching for a different keyword or clearing filters.</p>
                  <button
                    onClick={() => { setSearch(''); setSelectedModule(null); }}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" ref={scrollRef}>
                  {filteredLessons.map((lesson, i) => {
                    const done = lesson.userProgress?.status === 'completed';
                    const locked = lesson.isLocked;
                    return (
                      <LessonCard
                        key={lesson._id}
                        lesson={lesson}
                        index={i}
                        locked={locked}
                        done={done}
                        navigate={navigate}
                        topicName={topicName}
                        mastery={mastery}
                      />
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
                  className="w-full mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-100/80 transition-colors shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <IoCheckmarkCircle size={22} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Module complete!</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Up next: <strong className="font-semibold">{moduleLabel(nextIncompleteModule)}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 flex items-center justify-center shadow-2xs" style={{ color: primaryColor }}>
                    <IoArrowForwardOutline size={18} />
                  </div>
                </button>
              )}

              {/* All done banner */}
              {activeModuleDone && !nextIncompleteModule && (
                <div className="mt-6 bg-white dark:bg-[#1a2333] border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-8 text-center shadow-2xs">
                  <p className="text-4xl mb-2">🏆</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">All lessons complete!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You've finished every lesson in {topicName}. Keep practicing to maintain your streak.</p>
                </div>
              )}
            </div>
          )
        ) : (
          /* Practice tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRACTICE_SETS.map((set) => (
              <PracticeSetCard
                key={set.id}
                set={set}
                navigate={navigate}
                topicName={topicName}
                meta={meta}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
