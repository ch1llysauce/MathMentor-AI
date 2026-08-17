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
  IoSchoolOutline,
  IoPlayOutline,
  IoCalculatorOutline,
} from 'react-icons/io5';
import { questionApi, learningApi } from '../services/api';
import MathText from '../components/MathText';
import ScientificCalculator from '../components/ScientificCalculator';

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
function MasteryRing({ percentage, topic, subtitle, onClick, color = '#4b41e1', size = 120, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;

  const content = (
    <>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="drop-shadow-sm">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius} stroke="#f2f4f6" strokeWidth={stroke} fill="none" />
          {/* Progress */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight" style={{ color: color }}>{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{topic}</p>
        {subtitle && <p className="text-xs font-medium text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50/80 transition-all duration-300 focus:outline-none group border border-transparent hover:border-gray-200 hover:shadow-sm"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl">
      {content}
    </div>
  );
}

// ─── Weak Area Card ───────────────────────────────────────────────────────────
function WeakAreaCard({ subtopic, masteryPercentage, onPress }) {
  return (
    <div className="rounded-2xl p-4 mb-3 bg-white border border-red-100 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group" onClick={onPress}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">{subtopic}</span>
        <span className="text-xs font-extrabold text-red-500 bg-red-50 px-2 py-1 rounded-md">{masteryPercentage}% Mastery</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all" style={{ width: `${masteryPercentage}%` }} />
      </div>
      <div className="flex justify-end">
        <button className="text-xs font-bold text-red-600 group-hover:text-red-700 tracking-wider flex items-center gap-1 uppercase">
          Review Now <IoArrowForwardOutline size={12} />
        </button>
      </div>
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
      <div className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-2xl p-8 shadow-sm text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center mx-auto mb-4">
          <IoAnalyticsOutline size={34} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">Update Your Knowledge Map</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
          15 questions across Algebra, Geometry, and Trigonometry. Takes around 15–20 minutes.
          Your personalised learning path will be updated when you finish.
        </p>
      </div>
      <div className="mb-6 space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">What to expect</p>
        {[
          { Icon: IoHelpCircleOutline, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50', title: '15 questions', sub: 'Balanced across all three topics' },
          { Icon: IoBulbOutline,       color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50', title: 'Hints available', sub: 'One hint per question if you need it' },
          { Icon: IoAnalyticsOutline,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', title: 'Instant results', sub: 'Your knowledge map updates immediately' },
        ].map(({ Icon, color, bg, title, sub }) => (
          <div key={title} className="flex items-center gap-4 bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-xl p-4 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-400 dark:border-amber-500 rounded-xl p-4 mb-6 text-sm leading-relaxed shadow-2xs">
        <p className="font-bold text-amber-950 dark:text-amber-100 mb-1">Tips for best results</p>
        <p className="text-amber-900 dark:text-amber-200">• Find a quiet spot with no distractions</p>
        <p className="text-amber-900 dark:text-amber-200">• Have paper handy for calculations</p>
        <p className="text-amber-900 dark:text-amber-200">• Answer honestly — the path is built around your results</p>
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

function TestScreen({ questions, onSubmit, onCancel }) {
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [answers, setAnswers]                 = useState({});
  const [selectedAnswer, setSelectedAnswer]   = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect]             = useState(null);
  const [showHint, setShowHint]               = useState(false);
  const [showCalc, setShowCalc]               = useState(false);
  const [showQuitModal, setShowQuitModal]     = useState(false);
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
    <>
      {/* Scientific Calculator Floating Drawer */}
      <ScientificCalculator isOpen={showCalc} onClose={() => setShowCalc(false)} />

      {/* Leave Warning Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <IoWarningOutline size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Diagnostic Test?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to leave? Your progress in this diagnostic test will not be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowQuitModal(false);
                  if (onCancel) onCancel();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors shadow-md shadow-red-500/20"
              >
                Leave Test
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-full">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => setShowQuitModal(true)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 shrink-0 transition-colors"
            >
              <IoArrowBackOutline size={20} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs font-semibold text-purple-600 truncate uppercase tracking-wider">{q?.topic}</p>
              <p className="text-sm font-extrabold text-gray-900">{currentIndex + 1} of {questions.length}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl border" style={{ backgroundColor: diffColor + '18', borderColor: diffColor + '30', color: diffColor }}>
              {q?.difficulty}
            </span>
          </div>
          <div className="mt-3 max-w-3xl mx-auto">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full pb-36">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs mb-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              {q?.subtopic ? (
                <span className="inline-block bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold px-3.5 py-1 rounded-xl">
                  {q.subtopic}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <IoHelpCircleOutline size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Question</span>
                </div>
              )}
              {!showExplanation && (
                <button
                  type="button"
                  onClick={() => setShowCalc(!showCalc)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-100 dark:border-purple-800/40 transition-colors shadow-2xs cursor-pointer"
                >
                  <IoCalculatorOutline size={16} />
                  <span>{showCalc ? 'Hide Calculator' : 'Scientific Calculator'}</span>
                </button>
              )}
            </div>
            <div className="text-gray-900 font-semibold leading-relaxed text-lg">
              <MathText text={q?.question} />
            </div>
          </div>

          {q?.choices?.length > 0 && (
            <div className="space-y-3 mb-5">
              {q.choices.map((choice, idx) => {
                const letter  = String.fromCharCode(65 + idx);
                const isSel   = selectedAnswer === choice;
                const isRight = choice.trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
                let cardClass   = 'bg-white border-gray-200/90 text-gray-800 hover:border-purple-300 hover:bg-purple-50/20';
                let bubbleClass = 'bg-gray-100 text-gray-600';
                if (showExplanation) {
                  if (isSel && isCorrect)      { cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium'; bubbleClass = 'bg-emerald-500 text-white'; }
                  else if (isSel && !isCorrect){ cardClass = 'bg-red-50 border-red-400 text-red-900 font-medium';           bubbleClass = 'bg-red-500 text-white'; }
                  else if (!isSel && isRight)  { cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium'; }
                } else if (isSel) {
                  cardClass   = 'bg-purple-50 border-purple-500 text-purple-900 font-medium shadow-2xs';
                  bubbleClass = 'bg-purple-600 text-white';
                }
                return (
                  <button key={idx} onClick={() => !showExplanation && setSelectedAnswer(choice)} disabled={showExplanation}
                    className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-base transition-all ${cardClass}`}>
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs ${bubbleClass}`}>{letter}</span>
                    <span className="flex-1 font-medium"><MathText text={choice} /></span>
                    {showExplanation && isSel && isCorrect  && <IoCheckmarkCircleOutline size={22} className="shrink-0 text-emerald-600" />}
                    {showExplanation && isSel && !isCorrect && <IoCloseOutline size={22} className="shrink-0 text-red-500" />}
                    {showExplanation && !isSel && isRight   && <IoCheckmarkCircleOutline size={22} className="shrink-0 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          )}

          {!showExplanation && q?.hints?.length > 0 && (
            <div className="mb-5">
              {!showHint ? (
                <button onClick={() => setShowHint(true)}
                  className="w-full flex items-center justify-center gap-2 bg-amber-50/60 border border-amber-200 text-amber-900 text-sm font-bold py-3 rounded-2xl hover:bg-amber-100/80 transition-colors shadow-2xs">
                  <IoBulbOutline size={20} className="text-amber-500" /> Show Hint
                </button>
              ) : (
                <div className="flex gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-2xl p-4 text-sm text-amber-900 shadow-2xs">
                  <IoBulbOutline size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="leading-relaxed"><MathText text={q.hints[0]} /></div>
                </div>
              )}
            </div>
          )}

          {showExplanation && (
            <div className={`rounded-3xl border-l-4 p-5 mb-5 text-sm shadow-2xs ${isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
              <p className={`font-extrabold text-base mb-1.5 ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
              <div className={`leading-relaxed font-medium ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}><MathText text={q?.explanation} /></div>
              {!isCorrect && <div className="text-emerald-700 font-extrabold mt-3 pt-2 border-t border-red-100 flex items-center gap-1">Correct answer: <MathText text={q?.correctAnswer} /></div>}
            </div>
          )}
        </div>

        {/* Fixed action bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-lg z-20">
          <div className="max-w-3xl mx-auto">
            {!showExplanation ? (
              <button onClick={handleConfirm} disabled={!selectedAnswer}
                className="w-full bg-purple-600 text-white font-extrabold py-4 rounded-2xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md shadow-purple-600/20">
                Confirm Answer
              </button>
            ) : (
              <button onClick={handleNext}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish & Submit'}
                <IoArrowForwardOutline size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
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

// ─── Topic Detail Screen (matching mobile UI) ─────────────────────────────────
const TOPIC_SUBTOPICS = {
  Algebra:      ['Fractions', 'Linear Equations', 'Factoring'],
  Geometry:     ['Angles', 'Triangles', 'Area', 'Basic Circles'],
  Trigonometry: ['SOH-CAH-TOA', 'Basic Trig Ratios', 'Simple Applications'],
};

const SUBTOPIC_KEY_MAP = {
  'Fractions':           'fractions',
  'Linear Equations':    'linearEquations',
  'Factoring':           'factoring',
  'Angles':              'angles',
  'Triangles':           'triangles',
  'Area':                'area',
  'Basic Circles':       'basicCircles',
  'SOH-CAH-TOA':         'sohCahToa',
  'Basic Trig Ratios':   'basicTrigRatios',
  'Simple Applications': 'simpleApplications',
};

function getScoreColor(score) {
  if (score >= 80) return '#00a472';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Proficient';
  if (score >= 40) return 'Developing';
  return 'Needs Practice';
}

function TopicDetailScreen({ topic, latestDiag, onBack, onPractice }) {
  const topicKey = topic.toLowerCase();
  const score = latestDiag?.[`${topicKey}Score`] ?? 0;
  const topicScore = latestDiag?.topicScores?.[topicKey] ?? null;

  const totalQuestions = topicScore?.questionsAnswered ?? 0;
  const totalCorrect   = topicScore?.correctAnswers    ?? 0;
  const totalIncorrect = Math.max(0, totalQuestions - totalCorrect);

  const subtopicNames = TOPIC_SUBTOPICS[topic] ?? [];
  const subtopics = subtopicNames.map((name) => {
    const key = SUBTOPIC_KEY_MAP[name];
    const stScore = key != null ? (topicScore?.subtopicScores?.[key] ?? null) : null;
    return { name, score: stScore };
  });

  const recommendation =
    score < 50
      ? `Your ${topic} skills need work. Focus on the red subtopics first with targeted practice.`
      : score < 80
      ? `Good foundation in ${topic}! Push to master the remaining subtopics.`
      : `Excellent ${topic} mastery! Challenge yourself with harder problems.`;

  const topicColor = topic === 'Algebra' ? '#3b82f6' : topic === 'Geometry' ? '#10b981' : '#f59e0b';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Header Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all shadow-2xs group shrink-0"
          >
            <IoArrowBackOutline size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                Knowledge Map
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-gray-500">{topic} Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
              {topic} Mastery Overview
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPractice(topic)}
            className="bg-[#4b41e1] hover:bg-[#3d33d0] text-white font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 text-sm"
          >
            <IoPlayOutline size={18} /> Practice {topic}
          </button>
        </div>
      </div>

      {/* PC Friendly 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (1/3 width on PC): Overall Card, Recommendation & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overall Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col items-center gap-6">
            <MasteryRing
              percentage={score}
              topic={topic}
              subtitle={getScoreLabel(score)}
              color={topicColor}
              size={130}
              stroke={11}
            />

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <div className="bg-purple-50/70 border border-purple-100/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-extrabold text-purple-700">{totalQuestions}</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-0.5">Questions</span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-extrabold text-[#00a472]">{totalCorrect}</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-0.5">Correct</span>
              </div>
              <div className="bg-red-50/70 border border-red-100/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-extrabold text-[#ef4444]">{totalIncorrect}</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-0.5">Incorrect</span>
              </div>
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="bg-amber-50/80 border-l-4 border-amber-400 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
              <IoBulbOutline size={18} className="text-amber-500" />
              <span>AI Recommendation</span>
            </div>
            <p className="text-sm font-medium text-amber-950 leading-relaxed">{recommendation}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onPractice(topic)}
              className="w-full bg-[#4b41e1] hover:bg-[#3d33d0] text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 text-sm"
            >
              <IoPlayOutline size={18} /> Practice {topic}
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#4b41e1] font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-2xs"
            >
              Back to Knowledge Map
            </button>
          </div>
        </div>

        {/* Right Column (2/3 width on PC): Subtopics Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Subtopics Breakdown</h2>
                <p className="text-xs text-gray-500 mt-0.5">Detailed accuracy and performance level per skill</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-100">
                {subtopics.length} Subtopics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subtopics.map((st, i) => (
                <div
                  key={i}
                  className="bg-gray-50/70 border border-gray-100 hover:border-purple-200 rounded-2xl p-5 transition-all shadow-2xs flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {st.name}
                    </span>
                    {st.score !== null ? (
                      <span className="text-lg font-extrabold shrink-0 ml-2" style={{ color: getScoreColor(st.score) }}>
                        {st.score}%
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 italic shrink-0 ml-2">Not tested</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                      {st.score !== null ? (
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${st.score}%`, backgroundColor: getScoreColor(st.score) }}
                        />
                      ) : (
                        <div className="h-full w-0 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    {st.score !== null && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="font-semibold">{getScoreLabel(st.score)}</span>
                        <span className="text-[11px] text-gray-400">Mastery score</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Diagnosis() {
  const navigate = useNavigate();
  const [view, setView]           = useState('menu');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult]       = useState(null);
  const [latestDiag, setLatestDiag] = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(true);
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
      .catch(() => {})
      .finally(() => setLoadingDiag(false));
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
      const totalCorrect = Object.entries(answers).filter(
        ([idx, ans]) => (ans ?? '').trim().toLowerCase() === (questions[idx]?.correctAnswer ?? '').trim().toLowerCase()
      ).length;
      const { data } = await learningApi.submitDiagnostic({
        topicScores, totalQuestions: questions.length, correctAnswers: totalCorrect, timeSpent,
      });
      const diag = data?.data?.diagnosticResult ?? data?.data?.diagnostic ?? data?.diagnostic ?? data;
      setResult(diag);
      setLatestDiag(diag);
      loadTimeline(selectedPeriod);
      setView('result');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save results. Please try again.');
      setView('menu');
    }
  };

  const handleTopicClick = (topicName) => {
    setSelectedTopic(topicName);
    setView('topicDetail');
  };

  const handleViewAllTopics = () => {
    if (!latestDiag) return;
    const scores = [
      { topic: 'Algebra',      score: latestDiag.algebraScore ?? 0 },
      { topic: 'Geometry',     score: latestDiag.geometryScore ?? 0 },
      { topic: 'Trigonometry', score: latestDiag.trigonometryScore ?? 0 },
    ];
    const weakest = scores.reduce((a, b) => (a.score <= b.score ? a : b));
    setSelectedTopic(weakest.topic);
    setView('topicDetail');
  };

  if (view === 'intro')      return <IntroScreen onStart={startTest} loading={loadingQ} />;
  if (view === 'test')       return <TestScreen questions={questions} onSubmit={handleSubmit} onCancel={() => setView('menu')} />;
  if (view === 'submitting') return <SubmittingScreen />;
  if (view === 'history')    return <HistoryScreen onBack={() => setView('menu')} />;
  if (view === 'topicDetail' && selectedTopic) {
    return (
      <TopicDetailScreen
        topic={selectedTopic}
        latestDiag={latestDiag}
        onBack={() => { setView('menu'); setSelectedTopic(null); }}
        onPractice={(tName) => navigate(`/practice/topic/${encodeURIComponent(tName)}`, { state: { mastery: latestDiag?.[`${tName.toLowerCase()}Score`] ?? 0 } })}
      />
    );
  }

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

  if (loadingDiag) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#4b41e1] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#75777d]">Loading Knowledge Map…</p>
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
    { name: 'Algebra',      score: latestDiag.algebraScore ?? 0, color: '#3b82f6' }, // Blue
    { name: 'Geometry',     score: latestDiag.geometryScore ?? 0, color: '#10b981' }, // Emerald
    { name: 'Trigonometry', score: latestDiag.trigonometryScore ?? 0, color: '#f59e0b' }, // Amber
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center">
              <IoAnalyticsOutline size={22} />
            </div>
            Knowledge Map
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Visualizing your path to mathematical excellence</p>
        </div>
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-sm font-extrabold border border-purple-200 shadow-sm">
            <IoSparklesOutline size={16} />
            Overall {Math.round(latestDiag.overallScore ?? 0)}%
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 shadow-sm">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topic Mastery (Larger width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Topic Mastery section ── */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-gray-900">Topic Mastery</h2>
              <button
                onClick={handleViewAllTopics}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 tracking-wider uppercase flex items-center gap-1 transition-colors"
              >
                VIEW DETAILS <IoChevronForwardOutline size={14} />
              </button>
            </div>

            {/* Mastery rings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {subjects.map(({ name, score, color }) => (
                <MasteryRing
                  key={name}
                  percentage={score}
                  topic={name}
                  color={color}
                  subtitle={getTopicSubtitle(score)}
                  onClick={() => handleTopicClick(name)}
                />
              ))}
            </div>

            {/* AI Recommendation */}
            <div className="bg-gradient-to-r from-[#4b41e1] to-[#3d33d0] rounded-2xl p-5 shadow-lg shadow-purple-500/20 text-white flex gap-4 items-start relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm shadow-inner">
                <IoSparklesOutline size={24} className="text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-extrabold uppercase tracking-widest text-white/90 mb-1.5">AI Recommendation</p>
                <p className="text-sm text-white/95 leading-relaxed font-medium">{getRecommendation(latestDiag)}</p>
              </div>
            </div>
          </div>
          
          {/* ── Mastery Timeline section ── */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Mastery Timeline</h2>
                <p className="text-xs font-medium text-gray-500 mt-1">Tracking your overall growth over time</p>
              </div>
              
              {/* Period selector */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {PERIODS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPeriod(id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                      selectedPeriod === id
                        ? 'bg-white text-[#4b41e1] shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <TimelineChart data={timelineData} />
            </div>
          </div>
        </div>

        {/* Right Column: Weak Areas & CTAs */}
        <div className="lg:col-span-1 space-y-6">
          {/* ── Weak Areas section ── */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <IoWarningOutline size={18} />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Weak Areas</h2>
            </div>

            <div className="space-y-4">
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
                <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <IoCheckmarkCircleOutline size={32} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-bold text-emerald-800">Great work!</p>
                  <p className="text-xs text-emerald-600 mt-1">No major weak areas identified right now.</p>
                </div>
              )}
            </div>

            {/* CTA card */}
            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-2xl p-6 mt-6 shadow-lg shadow-purple-900/20 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                <IoSchoolOutline size={24} />
              </div>
              <p className="text-white font-bold text-lg mb-1">Ready for a challenge?</p>
              <p className="text-purple-200 text-xs font-medium mb-5 leading-relaxed">Retake the diagnostic to update your personalised learning path</p>
              <button
                onClick={() => setView('intro')}
                className="w-full bg-white text-purple-800 font-extrabold py-3.5 rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
              >
                RETAKE DIAGNOSTIC
              </button>
            </div>
          </div>

          {/* History button */}
          <button
            onClick={() => setView('history')}
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:border-[#4b41e1]/40 hover:text-[#4b41e1] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <IoTimeOutline size={20} /> View Diagnostic History
          </button>
        </div>
      </div>
    </div>
  );
}
