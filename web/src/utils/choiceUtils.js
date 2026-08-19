/**
 * Utility function to match a calculator result value against question choices or options.
 * Prioritizes exact string & numeric matches before any fallback.
 * Prevents false partial matches (e.g. matching "1/2" before exact "1" when value is "1").
 */
export function findMatchingChoice(choices, val) {
  if (!choices || !Array.isArray(choices) || choices.length === 0 || !val) {
    return val;
  }

  const clean = (str) => {
    if (str == null) return '';
    return String(str)
      .replace(/\$|`/g, '') // remove math delimiters
      .trim()
      .toLowerCase();
  };

  const parseVal = (str) => {
    const s = clean(str).replace(/^x\s*=\s*/, '').replace(/[^\d./-]/g, '');
    if (!s) return null;
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 2) {
        const n = parseFloat(parts[0]);
        const d = parseFloat(parts[1]);
        if (!isNaN(n) && !isNaN(d) && d !== 0) return n / d;
      }
    }
    const num = parseFloat(s);
    return isNaN(num) ? null : num;
  };

  const cleanVal = clean(val);
  const numVal = parseVal(val);

  const getChoiceText = (c) => {
    if (typeof c === 'object' && c !== null) {
      return String(c.text ?? c.value ?? c.label ?? '');
    }
    return String(c);
  };

  // 1. Exact string match (raw or cleaned, or stripping "x = ")
  for (const choice of choices) {
    const text = getChoiceText(choice);
    const cleanText = clean(text);
    if (cleanText === cleanVal) return text;
    if (cleanText.replace(/^x\s*=\s*/, '') === cleanVal) return text;
  }

  // 2. Numeric equivalence match (e.g. "0.5" matching "1/2", or "1.0" matching "1")
  if (numVal !== null) {
    for (const choice of choices) {
      const text = getChoiceText(choice);
      const choiceNum = parseVal(text);
      if (choiceNum !== null && Math.abs(choiceNum - numVal) < 1e-5) {
        return text;
      }
    }
  }

  // 3. Fallback: Return original calculator val
  return val;
}
