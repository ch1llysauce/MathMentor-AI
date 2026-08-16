import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoBulbOutline,
  IoAnalyticsOutline,
  IoCloseOutline,
  IoHelpCircleOutline,
  IoSparklesOutline,
  IoWarningOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';
import { questionApi, learningApi } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SUBTOPIC_DB_KEY = {
  'linear equations':    'linearEquations',
  'fractions':           'fractions',
  'factoring':           'factoring',
  'angles':              'angles',
  'triangles':           'triangles',
  'area':                'area',
  'basic circles':       'basicCircles',
  'soh-cah-toa':         'sohCahToa',
  'basic trig ratios':   'basicTrigRatios',
  'simple applications': 'simpleApplications',
};

function buildTopicScores(questions, answers) {
  const buckets = {};
  questions.forEach((q, i) => {
    const topicKey = q.topic.toLowerCase();
    if (!buckets[topicKey]) buckets[topicKey] = { correct: 0, total: 0, subtopics: {} };
    const stRaw = (q.subtopic ?? '').toLowerCase();
    const stKey = SUBTOPIC_DB_KEY[stRaw] ?? stRaw;
    if (!buckets[topicKey].subtopics[stKey]) buckets[topicKey].subtopics[stKey] = { c: 0, t: 0 };
    const isCorrect = (answers[i] ?? '').trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
    buckets[topicKey].total += 1;
    buckets[topicKey].subtopics[stKey].t += 1;
    if (isCorrect) { buckets[topicKey].correct += 1; buckets[topicKey].subtopics[stKey].c += 1; }
  });
  const makeScore = (key) => {
    const b = buckets[key] ?? { correct: 0, total: 0, subtopics: {} };
    const subtopicScores = {};
    Object.entries(b.subtopics).forEach(([st, v]) => { subtopicScores[st] = v.t > 0 ? Math.round((v.c / v.t) * 100) : 0; });
    return { score: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0, questionsAnswered: b.total, correctAnswers: b.correct, subtopicScores };
  };
  return { algebra: makeScore('algebra'), geometry: makeScore('geometry'), trigonometry: makeScore('trigonometry') };
}

function getTopicSubtitle(score) {
  if (score >= 80) return 'Expert Level';
  if (score >= 60) return 'Proficient';
  if (score >= 40) return 'Developing';
  return 'Needs Practice';
}

function getRecommendation(diag) {
  if (!diag) return '';
  const { algebraScore, geometryScore, trigonometryScore } = diag;
  const highest = Math.max(algebraScore, geometryScore, trigonometryScore);
  const lowest  = Math.min(algebraScore, geometryScore, trigonometryScore);
  let weakTopic = '';
  if (algebraScore === lowest)      weakTopic = 'Algebra';
  else if (geometryScore === lowest) weakTopic = 'Geometry';
  else                               weakTopic = 'Trigonometry';
  if (highest - lowest > 20) {
    return `Focus on ${weakTopic} to boost your overall mastery. You could improve by ${Math.round((highest - lowest) / 2)}% with targeted practice.`;
  }
  return 'Great balanced progress! Keep practicing to maintain your skills across all topics.';
}

// ─── Mastery Ring (SVG) ───────────────────────────────────────────────────────
function MasteryRing({ percentage, topic, subtitle, onClick }) {
  const size = 128, stroke = 8;
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;
  const scoreColor = percentage >= 80 ? '#00a472' : percentage >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 focus:outline-none group"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
          {/* Progress */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            stroke="#4b41e1"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-purple-700">{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className="text-base font-semibold text-gray-900">{topic}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </button>
  );
}

// ─── Weak Area Card ───────────────────────────────────────────────────────────
function WeakAreaCard({ subtopic, masteryPercentage, onPress }) {
  return (
    <div className="rounded-xl p-4 mb-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={onPress}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-900 flex-1 mr-2">{subtopic}</span>
        <span className="text-sm font-medium text-red-500">{masteryPercentage}% Mastery</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${masteryPercentage}%` }} />
      </div>
      <button className="text-xs font-medium text-purple-600 hover:text-purple-800 tracking-wide">
        REVIEW NOW
      </button>
    </div>
  );
}

// ─── Timeline Chart ───────────────────────────────────────────────────────────
function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No timeline data available</p>;
  }
  const chartH = 180;
  const barW = Math.max(32, Math.floor(300 / data.length));
  const yTicks = [100, 75, 50, 25, 0];

  return (
    <div className="flex gap-2 overflow-hidden">
      {/* Y-axis */}
      <div className="flex flex-col justify-between text-right shrink-0" style={{ height: chartH }}>
        {yTicks.map((t) => (
          <span key={t} className="text-xs text-gray-400 leading-none">{t}</span>
        ))}
      </div>

      {/* Bars + gridlines */}
      <div className="flex-1 overflow-x-auto">
        <div className="relative" style={{ height: chartH }}>
          {/* Gridlines */}
          {yTicks.map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${((100 - t) / 100) * chartH}px` }}
            />
          ))}

          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-1 pb-6 px-1">
            {data.map((point, i) => {
              const pct = Math.min(Math.max(point.score, 0), 100);
              const barH = (pct / 100) * (chartH - 24); // 24 = label space
              const color = pct >= 70 ? '#4b41e1' : pct >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: `${barW}px` }}>
                  <div className="flex flex-col justify-end flex-1 w-full px-1">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{ height: `${barH}px`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 truncate w-full text-center">{point.date}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* X label */}
        <p className="text-xs text-gray-400 text-center mt-1">Date</p>
      </div>
    </div>
  );
}

// ─── Diagnostic Quiz screen ───────────────────────────────────────────────────
function IntroScreen({ onStart, loading }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <IoAnalyticsOutline size={34} className="text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-purple-700 mb-2">Update Your Knowledge Map</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          15 questions across Algebra, Geometry, and Trigonometry. Takes around 15–20 minutes.
          Your personalised learning path will be updated when you finish.
        </p>
      </div>
      <div className="mb-6 space-y-3">
        <p className="text-sm font-semibold text-gray-700">What to expect</p>
        {[
          { Icon: IoHelpCircleOutline, color: 'text-purple-600', bg: 'bg-purple-50', title: '15 questions', sub: 'Balanced across all three topics' },
          { Icon: IoBulbOutline,       color: 'text-yellow-500', bg: 'bg-yellow-50', title: 'Hints available', sub: 'One hint per question if you need it' },
          { Icon: IoAnalyticsOutline,  color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Instant results', sub: 'Your knowledge map updates immediately' },
        ].map(({ Icon, color, bg, title, sub }) => (
          <div key={title} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 mb-6 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-gray-800 mb-1">Tips for best results</p>
        <p>• Find a quiet spot with no distractions</p>
        <p>• Have paper handy for calculations</p>
        <p>• Answer honestly — the path is built around your results</p>
      </div>
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
      >
        {loading ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading questions…</>
        ) : (
          <><span>Start Diagnostic</span><IoArrowForwardOutline size={18} /></>
        )}
      </button>
    </div>
  );
}

function TestScreen({ questions, onSubmit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect]       = useState(null);
  const [showHint, setShowHint]         = useState(false);
  const startTimeRef = useRef(Date.now());

  const q = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;
  const diffColor = q?.difficulty === 'Easy' ? '#00a472' : q?.difficulty === 'Hard' ? '#ef4444' : '#f59e0b';

  const handleConfirm = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer.trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
    setIsCorrect(correct);
    setShowExplanation(true);
    setAnswers((prev) => ({ ...prev, [currentIndex]: selectedAnswer }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const finalAnswers = { ...answers, [currentIndex]: selectedAnswer };
      onSubmit(finalAnswers, timeSpent);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <p className="text-base font-bold text-purple-700">{currentIndex + 1} / {questions.length}</p>
          <p className="text-xs text-gray-400">{q?.topic}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: diffColor + '20', color: diffColor }}>
          {q?.difficulty}
        </span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">{q?.subtopic}</span>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-gray-900 font-medium leading-relaxed text-base">{q?.question}</p>
      </div>
      {q?.choices?.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {q.choices.map((choice, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSel  = selectedAnswer === choice;
            const isRight = choice.trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
            let cardClass  = 'bg-white border-gray-200 text-gray-700';
            let bubbleClass = 'bg-gray-100 text-gray-500';
            if (showExplanation) {
              if (isSel && isCorrect)      { cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-800'; bubbleClass = 'bg-emerald-500 text-white'; }
              else if (isSel && !isCorrect){ cardClass = 'bg-red-50 border-red-400 text-red-800';           bubbleClass = 'bg-red-500 text-white'; }
              else if (!isSel && isRight)  { cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-800'; }
            } else if (isSel) {
              cardClass  = 'bg-purple-50 border-purple-400 text-purple-800';
              bubbleClass = 'bg-purple-600 text-white';
            }
            return (
              <button key={idx} onClick={() => !showExplanation && setSelectedAnswer(choice)} disabled={showExplanation}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-colors ${cardClass}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${bubbleClass}`}>{letter}</span>
                <span className="flex-1">{choice}</span>
                {showExplanation && isSel && isCorrect  && <IoCheckmarkCircleOutline size={20} className="shrink-0 text-emerald-600" />}
                {showExplanation && isSel && !isCorrect && <IoCloseOutline size={20} className="shrink-0 text-red-500" />}
                {showExplanation && !isSel && isRight   && <IoCheckmarkCircleOutline size={20} className="shrink-0 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
      {!showExplanation && q?.hints?.length > 0 && (
        <div className="mb-4">
          {!showHint ? (
            <button onClick={() => setShowHint(true)}
              className="w-full flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm font-semibold py-2.5 rounded-xl">
              <IoBulbOutline size={18} className="text-yellow-500" /> Show Hint
            </button>
          ) : (
            <div className="flex gap-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 text-sm text-yellow-900">
              <IoBulbOutline size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <p>{q.hints[0]}</p>
            </div>
          )}
        </div>
      )}
      {showExplanation && (
        <div className={`rounded-2xl border-l-4 p-4 mb-4 text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
          <p className={`font-bold text-base mb-1 ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
          <p className={isCorrect ? 'text-emerald-800' : 'text-red-800'}>{q?.explanation}</p>
          {!isCorrect && <p className="text-emerald-700 font-semibold mt-2">Correct answer: {q?.correctAnswer}</p>}
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:mt-2">
        {!showExplanation ? (
          <button onClick={handleConfirm} disabled={!selectedAnswer}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
            Confirm Answer
          </button>
        ) : (
          <button onClick={handleNext}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
            <IoArrowForwardOutline size={20} />
          </button>
        )}
        <div className="h-4 lg:hidden" />
      </div>
      <div className="h-20 lg:hidden" />
    </div>
  );
}

function SubmittingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-lg font-bold text-purple-700">Analysing your results…</p>
      <p className="text-sm text-gray-500">Building your personalised learning path</p>
    </div>
  );
}

function HistoryScreen({ onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    learningApi.getDiagnosticHistory()
      .then(({ data }) => setHistory(data?.data?.diagnostics ?? data?.diagnostics ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600"><IoArrowBackOutline size={20} /></button>
        <h1 className="text-xl font-bold text-gray-900">Diagnostic History</h1>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : history.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No diagnostic history yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <IoTimeOutline size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Diagnostic #{history.length - i}</p>
                  {h.completedAt && <p className="text-xs text-gray-400">{new Date(h.completedAt).toLocaleDateString()}</p>}
                </div>
              </div>
              {h.overallScore != null && (
                <span className={`text-sm font-bold ${h.overallScore >= 70 ? 'text-emerald-600' : h.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {Math.round(h.overallScore)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Diagnosis() {
  const navigate = useNavigate();
  const [view, setView]           = useState('menu');
  const [questions, setQuestions] = useState([]);
  const [result, setResult]       = useState(null);
  const [latestDiag, setLatestDiag] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loadingQ, setLoadingQ]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    learningApi.getLatestDiagnostic()
      .then(({ data }) => {
        const d = data?.data?.diagnostic ?? data?.diagnostic;
        if (d?._id) setLatestDiag(d);
      })
      .catch(() => {});
  }, []);

  // Load timeline whenever period changes and we have a diagnostic
  useEffect(() => {
    if (!latestDiag) return;
    loadTimeline(selectedPeriod);
  }, [selectedPeriod, latestDiag]);

  const loadTimeline = async (period) => {
    try {
      const { data } = await learningApi.getDiagnosticHistory();
      const diagnostics = data?.data?.diagnostics ?? data?.diagnostics ?? [];
      const now = new Date();
      const filterDate = new Date();
      if (period === 'week')        filterDate.setDate(now.getDate() - 7);
      else if (period === 'month')  filterDate.setMonth(now.getMonth() - 1);
      else                          filterDate.setMonth(now.getMonth() - 6);
      const filtered = diagnostics
        .filter((d) => new Date(d.completedAt) >= filterDate)
        .map((d) => ({
          date:  new Date(d.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: d.overallScore,
        }))
        .reverse();
      setTimelineData(filtered);
    } catch { setTimelineData([]); }
  };

  const startTest = async () => {
    setError('');
    setLoadingQ(true);
    try {
      const { data } = await questionApi.getDiagnostic();
      const qs = data?.data?.questions ?? data?.questions ?? [];
      if (!qs.length) { setError('No diagnostic questions are available.'); return; }
      setQuestions(qs);
      setView('test');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load questions. Please check your connection.');
    } finally { setLoadingQ(false); }
  };

  const handleSubmit = async (answers, timeSpent) => {
    setView('submitting');
    try {
      const topicScores  = buildTopicScores(questions, answers);
      const totalCorrect = Object.values(answers).filter(
        (ans, i) => (ans ?? '').trim().toLowerCase() === (questions[i]?.correctAnswer ?? '').trim().toLowerCase()
      ).length;
      const { data } = await learningApi.submitDiagnostic({
        topicScores, totalQuestions: questions.length, correctAnswers: totalCorrect, timeSpent,
      });
      const diag = data?.data?.diagnostic ?? data?.diagnostic ?? data;
      setResult(diag);
      setLatestDiag(diag);
      loadTimeline(selectedPeriod);
      setView('result');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save results. Please try again.');
      setView('menu');
    }
  };

  if (view === 'intro')      return <IntroScreen onStart={startTest} loading={loadingQ} />;
  if (view === 'test')       return <TestScreen questions={questions} onSubmit={handleSubmit} />;
  if (view === 'submitting') return <SubmittingScreen />;
  if (view === 'history')    return <HistoryScreen onBack={() => setView('menu')} />;

  // Result screen (after submitting)
  if (view === 'result' && result) {
    const subjects = [
      { name: 'Algebra',      score: result.algebraScore ?? 0 },
      { name: 'Geometry',     score: result.geometryScore ?? 0 },
      { name: 'Trigonometry', score: result.trigonometryScore ?? 0 },
    ];
    const barColor = (s) => s >= 70 ? 'bg-emerald-500' : s >= 40 ? 'bg-yellow-400' : 'bg-red-400';
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
            <IoSearchOutline size={32} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnostic Complete</h2>
          {result.overallScore != null && (
            <p className="text-gray-500 mt-1">Overall: <strong className="text-purple-700">{Math.round(result.overallScore)}%</strong></p>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Subject Scores</h3>
          <div className="space-y-3">
            {subjects.map(({ name, score }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{name}</span>
                  <span className="text-gray-500">{score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {result.weakTopics?.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-4">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <IoAlertCircleOutline size={18} /> Areas to Improve
            </h3>
            <ul className="space-y-1.5">
              {result.weakTopics.map((area, i) => (
                <li key={i} className="text-sm text-red-700 flex justify-between">
                  <span>{area.topic}{area.subtopic ? ` — ${area.subtopic}` : ''}</span>
                  <span className="font-semibold">{area.score}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={() => { setView('menu'); setResult(null); }}
          className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <IoRefreshOutline size={16} /> Back to Diagnosis
        </button>
      </div>
    );
  }

  // ── Menu view — Knowledge Map ──────────────────────────────────────────────
  const hasDiag = Boolean(latestDiag);
  const PERIODS = [
    { id: 'week', label: 'W' },
    { id: 'month', label: 'M' },
    { id: '6months', label: '6M' },
  ];

  if (!hasDiag) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center">
        <IoAnalyticsOutline size={80} className="text-purple-500 mb-6" />
        <h2 className="text-2xl font-bold text-purple-700 mb-3">Start Your Journey</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Complete a diagnostic test to unlock personalized learning paths and track your progress.
        </p>
        <button
          onClick={() => setView('intro')}
          className="bg-purple-600 text-white font-bold px-12 py-4 rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
        >
          START DIAGNOSTIC
        </button>
      </div>
    );
  }

  const subjects = [
    { name: 'Algebra',      score: latestDiag.algebraScore ?? 0 },
    { name: 'Geometry',     score: latestDiag.geometryScore ?? 0 },
    { name: 'Trigonometry', score: latestDiag.trigonometryScore ?? 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Knowledge Map</h1>
          <p className="text-sm text-gray-400 mt-1">Visualizing your path to mathematical excellence</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
          Overall {Math.round(latestDiag.overallScore ?? 0)}%
        </span>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      {/* ── Topic Mastery section ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-purple-700">Topic Mastery</h2>
          <button
            onClick={() => navigate('/practice')}
            className="text-sm font-medium text-purple-600 hover:text-purple-800 tracking-wide"
          >
            VIEW DETAILS →
          </button>
        </div>

        {/* Mastery rings */}
        <div className="flex justify-around mb-6 overflow-x-auto gap-4 pb-2">
          {subjects.map(({ name, score }) => (
            <MasteryRing
              key={name}
              percentage={score}
              topic={name}
              subtitle={getTopicSubtitle(score)}
              onClick={() => navigate('/practice', { state: { topicFilter: name } })}
            />
          ))}
        </div>

        {/* AI Recommendation */}
        <div className="flex gap-4 bg-gray-50 border-l-4 border-purple-500 rounded-xl p-4">
          <IoSparklesOutline size={24} className="text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-700 mb-1">AI Recommendation</p>
            <p className="text-sm text-gray-700 leading-relaxed">{getRecommendation(latestDiag)}</p>
          </div>
        </div>
      </div>

      {/* ── Weak Areas section ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <IoWarningOutline size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Weak Areas</h2>
        </div>

        {latestDiag.weakTopics?.length > 0 ? (
          // Deduplicate by topic name, show top 3
          [...new Map(latestDiag.weakTopics.map((w) => [w.topic, w])).values()]
            .slice(0, 3)
            .map((weak, i) => (
              <WeakAreaCard
                key={i}
                subtopic={weak.topic}
                masteryPercentage={weak.score}
                onPress={() => navigate(`/practice/topic/${encodeURIComponent(weak.topic)}`, { state: { mastery: weak.score } })}
              />
            ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Great work! No weak areas identified.</p>
        )}

        {/* CTA card */}
        <div className="bg-purple-700 rounded-2xl p-5 mt-4">
          <p className="text-white font-semibold text-base mb-1">Ready for a challenge?</p>
          <p className="text-purple-200 text-sm mb-4">Retake the diagnostic to update your personalised learning path</p>
          <button
            onClick={() => setView('intro')}
            className="w-full bg-purple-500 text-white font-semibold py-3 rounded-xl hover:bg-purple-400 transition-colors tracking-wide"
          >
            RETAKE DIAGNOSTIC
          </button>
        </div>
      </div>

      {/* ── Mastery Timeline section ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mastery Timeline</h2>
          <p className="text-xs text-gray-400 mt-0.5">Tracking your growth over time</p>
        </div>

        {/* Period selector */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 self-start w-fit mb-5">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedPeriod(id)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                selectedPeriod === id
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <TimelineChart data={timelineData} />
      </div>

      {/* History button */}
      <button
        onClick={() => setView('history')}
        className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <IoTimeOutline size={18} /> View Diagnostic History
      </button>
    </div>
  );
}
