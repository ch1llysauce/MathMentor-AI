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

// ─── Safe expression evaluator ────────────────────────────────────────────────
function safeEval(expr, mode) {
  try {
    if (!expr || typeof expr !== 'string') return 'Error';

    const _sin  = (x) => (mode === 'DEG' ? Math.sin((x * Math.PI) / 180) : Math.sin(x));
    const _cos  = (x) => (mode === 'DEG' ? Math.cos((x * Math.PI) / 180) : Math.cos(x));
    const _tan  = (x) => (mode === 'DEG' ? Math.tan((x * Math.PI) / 180) : Math.tan(x));
    const _asin = (x) => (mode === 'DEG' ? (Math.asin(x) * 180) / Math.PI : Math.asin(x));
    const _acos = (x) => (mode === 'DEG' ? (Math.acos(x) * 180) / Math.PI : Math.acos(x));
    const _atan = (x) => (mode === 'DEG' ? (Math.atan(x) * 180) / Math.PI : Math.atan(x));
    const _log  = Math.log10;
    const _ln   = Math.log;
    const _sqrt = Math.sqrt;
    const _cbrt = Math.cbrt;

    let e = expr
      .replace(/π/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`)
      .replace(/²/g, '**2')
      .replace(/³/g, '**3')
      .replace(/\^/g, '**')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\basin\(/g, '_asin(')
      .replace(/\bacos\(/g, '_acos(')
      .replace(/\batan\(/g, '_atan(')
      .replace(/\bsin\(/g,  '_sin(')
      .replace(/\bcos\(/g,  '_cos(')
      .replace(/\btan\(/g,  '_tan(')
      .replace(/\blog\(/g,  '_log(')
      .replace(/\bln\(/g,   '_ln(')
      .replace(/√\(/g,     '_sqrt(')
      .replace(/∛\(/g,     '_cbrt(');

    // Only allow safe characters
    if (/[^0-9+\-*/().Math\s,_a-zA-Z]/.test(e)) {
      return 'Error';
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function('_sin', '_cos', '_tan', '_asin', '_acos', '_atan', '_log', '_ln', '_sqrt', '_cbrt', `"use strict"; return (${e});`);
    const result = fn(_sin, _cos, _tan, _asin, _acos, _atan, _log, _ln, _sqrt, _cbrt);

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
export default function ScientificCalculator({ isOpen, visible, onClose, onUseResult }) {
  const isVisible = Boolean(isOpen ?? visible);
  const [display,        setDisplay]        = useState('0');
  const [expression,     setExpression]     = useState('');
  const [angleMode,      setAngleMode]      = useState('DEG');
  const [justEvaluated,  setJustEvaluated]  = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

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
    if (display !== 'Error' && display !== '0' && onUseResult) {
      onUseResult(display);
      onClose();
    }
  };

  // Shorthand helpers
  const num = (v) => <Btn key={v} label={v} onClick={() => append(v)} className="bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />;
  const op  = (l, v) => <Btn key={l} label={l} onClick={() => append(v ?? l)} className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold cursor-pointer" />;
  const fn  = (l, f) => <Btn key={l} label={l} onClick={() => appendFn(f ?? l)} className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer" />;

  return (
    /* Overlay — centered on all screen sizes */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet */}
      <div className="w-full max-w-md bg-gray-50 dark:bg-[#1a2333] border border-gray-200 dark:border-[#2d3748] rounded-3xl shadow-2xl pb-6 overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#2d3748]">
          <span className="text-base font-bold text-gray-900 dark:text-white">Scientific Calculator</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')}
              className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide cursor-pointer"
            >
              {angleMode}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d3748] transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="mx-4 mt-3 mb-2 bg-white dark:bg-[#0d131f] border border-gray-200 dark:border-[#2d3748] rounded-2xl px-4 py-3 min-h-[72px] flex flex-col justify-end shadow-inner">
          <p className="text-xs text-gray-400 dark:text-gray-400 text-right truncate">{expression || ' '}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white text-right truncate">{display}</p>
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
            <Btn label="x²" onClick={() => append('²')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 cursor-pointer" />
            <Btn label="xʸ" onClick={() => append('^')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 cursor-pointer" />
            {fn('log')}{fn('ln')}
          </div>

          {/* Row 3 — constants / parens / clear */}
          <div className="flex gap-1.5">
            <Btn label="π"  onClick={() => append('π')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 cursor-pointer" />
            <Btn label="e"  onClick={() => append('e')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 cursor-pointer" />
            <Btn label="("  onClick={() => append('(')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />
            <Btn label=")"  onClick={() => append(')')} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-white dark:bg-[#252f40] border border-gray-100 dark:border-[#374151] text-gray-900 dark:text-white shadow-xs cursor-pointer" />
            <Btn label="⌫"  onClick={backspace}         className="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-300 cursor-pointer" />
            <Btn label="AC" onClick={clear}             className="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-300 cursor-pointer" />
          </div>

          {/* Rows 4-7 — number pad */}
          <div className="flex gap-1.5">{num('7')}{num('8')}{num('9')}{op('÷')}</div>
          <div className="flex gap-1.5">{num('4')}{num('5')}{num('6')}{op('×')}</div>
          <div className="flex gap-1.5">{num('1')}{num('2')}{num('3')}{op('-')}</div>
          <div className="flex gap-1.5">
            {num('0')}{num('.')}
            <Btn label="=" onClick={calculate} className="flex-1 h-11 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer" />
            {op('+')}
          </div>
        </div>

        {/* Use Result */}
        {onUseResult && (
          <div className="px-4 mt-3">
            <button
              type="button"
              onClick={useResult}
              disabled={display === 'Error'}
              className="w-full h-12 rounded-2xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Use Result ({display})
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
