/**
 * MathToolbar — ported from mobile/src/components/MathToolbar.tsx
 * A grid of math-symbol buttons shown below the free-response input.
 */

const ROWS = [
  [
    { label: 'π', value: 'π' },
    { label: '√', value: '√' },
    { label: 'θ', value: 'θ' },
    { label: '°', value: '°' },
    { label: '²', value: '²' },
    { label: '³', value: '³' },
    { label: '/', value: '/' },
    { label: '.', value: '.' },
  ],
  [
    { label: '×', value: '×' },
    { label: '÷', value: '÷' },
    { label: '±', value: '±' },
    { label: '≈', value: '≈' },
    { label: '≠', value: '≠' },
    { label: '≤', value: '≤' },
    { label: '≥', value: '≥' },
    { label: '∞', value: '∞' },
  ],
  [
    { label: 'α', value: 'α' },
    { label: 'β', value: 'β' },
    { label: 'λ', value: 'λ' },
    { label: 'μ', value: 'μ' },
    { label: 'σ', value: 'σ' },
    { label: 'Δ', value: 'Δ' },
    { label: 'Σ', value: 'Σ' },
    { label: 'Ω', value: 'Ω' },
  ],
];

export default function MathToolbar({ onInsert }) {
  return (
    <div className="mt-2 rounded-xl border border-purple-200 bg-purple-50 p-2 space-y-1.5">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((sym) => (
            <button
              key={sym.value}
              type="button"
              onClick={() => onInsert(sym.value)}
              className="flex-1 h-9 rounded-lg border border-purple-200 bg-white text-purple-700 text-base font-semibold hover:bg-purple-100 active:bg-purple-200 transition-colors shadow-sm"
              style={{ fontSize: '16px' }}
            >
              {sym.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
