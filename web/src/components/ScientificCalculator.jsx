/**
 * ScientificCalculator — ported from mobile/src/components/ScientificCalculator.tsx
 *
 * A bottom-sheet modal scientific calculator with:
 *  - Basic arithmetic: + - × ÷
 *  - Trig: sin, cos, tan, asin, acos, atan
 *  - Powers / roots: x², xʸ, √, ∛
 *  - Constants: π, e
 *  - Log: log, ln
 *  - Degree / Radian toggle
 *  - "Use Result" button — pastes the result into the answer field
 */

import { useState, useEffect } from 'react';

// ─── Safe expression evaluator (identical logic to mobile) ────────────────────
function safeEval(expr, mode) {
  try {
    let e = expr
      .replace(/π/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`);

    if (mode === 'DEG') {
      e = e
        .replace(/asin\(([^)]+)\)/g,  (_, a) => `(Math.asin(${a})*(180/Math.PI))`)
        .replace(/acos\(([^)]+)\)/g,  (_, a) => `(Math.acos(${a})*(180/Math.PI))`)
        .replace(/atan\(([^)]+)\)/g,  (_, a) => `(Math.atan(${a})*(180/Math.PI))`)
        .replace(/sin\(([^)]+)\)/g,   (_, a) => `(Math.sin((${a})*Math.PI/180))`)
        .replace(/cos\(([^)]+)\)/g,   (_, a) => `(Math.cos((${a})*Math.PI/180))`)
        .replace(/tan\(([^)]+)\)/g,   (_, a) => `(Math.tan((${a})*Math.PI/180))`);
    } else {
      e = e
        .replace(/asin\(([^)]+)\)/g,  (_, a) => `(Math.asin(${a}))`)
        .replace(/acos\(([^)]+)\)/g,  (_, a) => `(Math.acos(${a}))`)
        .replace(/atan\(([^)]+)\)/g,  (_, a) => `(Math.atan(${a}))`)
        .replace(/sin\(([^)]+)\)/g,   (_, a) => `(Math.sin(${a}))`)
        .replace(/cos\(([^)]+)\)/g,   (_, a) => `(Math.cos(${a}))`)
        .replace(/tan\(([^)]+)\)/g,   (_, a) => `(Math.tan(${a}))`);
    }

    e = e
      .replace(/log\(([^)]+)\)/g,  (_, a) => `(Math.log10(${a}))`)
      .replace(/ln\(([^)]+)\)/g,   (_, a) => `(Math.log(${a}))`)
      .replace(/√\(([^)]+)\)/g,    (_, a) => `(Math.sqrt(${a}))`)
      .replace(/∛\(([^)]+)\)/g,    (_, a) => `(Math.cbrt(${a}))`)
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    // Only allow safe characters
    if (/[^0-9+\-*/().Math\s,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_]/.test(e)) {
      return 'Error';
    }

    // eslint-disable-next-line no-new-func
    const result = new Function('"use strict"; return (' + e + ')')();
    if (typeof result !== 'number' || !isFinite(result)) return 'Error';

    const rounded = parseFloat(result.toPrecision(10));
    return parseFloat(rounded.toFixed(4)).toString();
  } catch {
    return 'Error';
  }
}

// ─── Button component ─────────────────────────────────────────────────────────
function Btn({ label, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-11 rounded-xl text-sm font-semibold active:scale-95 transition-transform ${className}`}
    >
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScientificCalculator({ visible, onClose, onUseResult }) {
  const [display,        setDisplay]        = useState('0');
  const [expression,     setExpression]     = useState('');
  const [angleMode,      setAngleMode]      = useState('DEG');
  const [justEvaluated,  setJustEvaluated]  = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  const append = (val) => {
    if (justEvaluated) {
      if ('0123456789.πe('.includes(val)) {
        const next = val === '0' ? '0' : val;
        setDisplay(next); setExpression(next);
      } else {
        setDisplay(display + val); setExpression(display + val);
      }
      setJustEvaluated(false);
      return;
    }
    const newExpr = expression === '0' && !['/', '*', '+', '-', '×', '÷', '.'].includes(val)
      ? val
      : expression + val;
    setExpression(newExpr);
    setDisplay(newExpr);
  };

  const appendFn = (fn) => {
    const newExpr = justEvaluated ? fn + '(' : expression + fn + '(';
    setExpression(newExpr);
    setDisplay(newExpr);
    setJustEvaluated(false);
  };

  const calculate = () => {
    if (!expression || expression === 'Error') return;
    const result = safeEval(expression, angleMode);
    setDisplay(result); setExpression(result); setJustEvaluated(true);
  };

  const clear = () => { setDisplay('0'); setExpression(''); setJustEvaluated(false); };

  const backspace = () => {
    if (justEvaluated) { clear(); return; }
    const next = expression.slice(0, -1);
    setExpression(next);
    setDisplay(next || '0');
  };

  const useResult = () => {
    if (display !== 'Error' && display !== '0') { onUseResult(display); onClose(); }
  };

  // Shorthand helpers
  const num = (v) => <Btn key={v} label={v} onClick={() => append(v)}    className="bg-white border border-gray-100 text-gray-900 shadow-sm" />;
  const op  = (l, v) => <Btn key={l} label={l} onClick={() => append(v ?? l)} className="bg-purple-100 text-purple-700" />;
  const fn  = (l, f) => <Btn key={l} label={l} onClick={() => appendFn(f ?? l)} className="bg-blue-50 text-blue-700" />;

  return (
    /* Overlay — centered on all screen sizes */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet */}
      <div className="w-full max-w-md bg-gray-50 rounded-3xl shadow-2xl pb-6 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <span className="text-base font-bold text-gray-900">Calculator</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')}
              className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wide"
            >
              {angleMode}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="mx-4 mt-3 mb-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 min-h-[72px] flex flex-col justify-end shadow-sm">
          <p className="text-xs text-gray-400 text-right truncate">{expression || ' '}</p>
          <p className="text-3xl font-bold text-gray-900 text-right truncate">{display}</p>
        </div>

        {/* Button grid */}
        <div className="px-3 space-y-1.5">
          {/* Row 1 — trig functions */}
          <div className="flex gap-1.5">
            {fn('sin')}{fn('cos')}{fn('tan')}{fn('asin')}{fn('acos')}{fn('atan')}
          </div>

          {/* Row 2 — roots / powers / log */}
          <div className="flex gap-1.5">
            {fn('√')}{fn('∛')}
            <Btn label="x²" onClick={() => append('²')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700" />
            <Btn label="xʸ" onClick={() => append('^')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700" />
            {fn('log')}{fn('ln')}
          </div>

          {/* Row 3 — constants / parens / clear */}
          <div className="flex gap-1.5">
            <Btn label="π"  onClick={() => append('π')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700" />
            <Btn label="e"  onClick={() => append('e')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700" />
            <Btn label="("  onClick={() => append('(')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-white border border-gray-100 text-gray-900 shadow-sm" />
            <Btn label=")"  onClick={() => append(')')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-white border border-gray-100 text-gray-900 shadow-sm" />
            <Btn label="⌫"  onClick={backspace}         className="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-50 text-red-500" />
            <Btn label="AC" onClick={clear}             className="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-50 text-red-500" />
          </div>

          {/* Rows 4-7 — number pad */}
          <div className="flex gap-1.5">{num('7')}{num('8')}{num('9')}{op('÷')}</div>
          <div className="flex gap-1.5">{num('4')}{num('5')}{num('6')}{op('×')}</div>
          <div className="flex gap-1.5">{num('1')}{num('2')}{num('3')}{op('-')}</div>
          <div className="flex gap-1.5">
            {num('0')}{num('.')}
            <Btn label="=" onClick={calculate} className="flex-1 h-11 rounded-xl text-sm font-bold bg-purple-600 text-white" />
            {op('+')}
          </div>
        </div>

        {/* Use Result */}
        <div className="px-4 mt-3">
          <button
            type="button"
            onClick={useResult}
            disabled={display === 'Error'}
            className="w-full h-13 py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-base hover:bg-purple-700 disabled:opacity-40 transition-colors"
          >
            Use Result &nbsp;({display})
          </button>
        </div>

      </div>
    </div>
  );
}
