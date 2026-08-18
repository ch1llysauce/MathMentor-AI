/**
 * MessageRenderer
 *
 * Full LaTeX + Markdown renderer matching web's MathText.
 * Handles:
 * - $$...$$ display math blocks via KaTeX MathRenderer WebView
 * - $...$ inline math via KaTeX MathRenderer or formatted math
 * - Automatic LaTeX normalization for un-delimited math expressions (e.g. x^2, \frac{a}{b})
 * - Markdown bold (**text**), lists (bullets & numbered), headings (#, ##, ###)
 * - Markdown tables (| col1 | col2 |)
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import MathRenderer from './MathRenderer';

interface Props {
  content: string;
  isUser?: boolean;
  textColor?: string;
  fontSize?: number;
}

// ─── Subscript / Superscript helpers ─────────────────────────────────────────
const SUB_DIGITS: Record<string, string> = {
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄',
  '5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
};
function toSubscript(s: string): string {
  const allDigits = /^\d+$/.test(s);
  if (allDigits) return s.split('').map(c => SUB_DIGITS[c] ?? c).join('');
  return `_${s}`;
}

const SUP_DIGITS: Record<string, string> = {
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
  '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
  'n':'ⁿ','i':'ⁱ','x':'ˣ',
};
function toSuperscript(s: string): string {
  const chars = s.split('');
  if (chars.length > 0 && chars.every(c => SUP_DIGITS[c] !== undefined)) {
    return chars.map(c => SUP_DIGITS[c]).join('');
  }
  return `^${s}`;
}

// ─── Bare LaTeX → readable Unicode/text fallback ─────────────────────────────
const BARE_LATEX_MAP: [RegExp, string | ((...args: string[]) => string)][] = [
  // Degrees: \^{circ}, ^\circ, \^{\degree}, ^\degree, ^degree, ^deg, \degree, ° -> ° (no carets!)
  [/\^\{\\?(circ|degree|degrees|deg)\}/gi, '°'],
  [/\^\\?(circ|degree|degrees|deg)\b/gi,  '°'],
  [/\\(circ|degree|degrees)\b/gi,          '°'],
  [/\^°/g,                                 '°'],

  // Fractions & Roots
  [/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, num, den) => {
    const needsParens = (s: string) => /[+\-]/.test(s);
    const n = needsParens(num) ? `(${num})` : num;
    const d = needsParens(den) ? `(${den})` : den;
    return `${n}/${d}`;
  }],
  [/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, (_, root, body) => `${toSuperscript(root)}√(${body})`],
  [/\\sqrt\{([^}]+)\}/g,            '√($1)'],
  [/\\text\{([^}]+)\}/g,            '$1'],
  [/\\mathrm\{([^}]+)\}/g,          '$1'],
  [/\\mathbf\{([^}]+)\}/g,          '$1'],

  // Logarithms & Subscripts
  [/\\log_\{([^}]+)\}/g, (_: string, base: string) => `log${toSubscript(base)}`],
  [/\\log_([0-9a-zA-Z])/g, (_: string, base: string) => `log${toSubscript(base)}`],
  [/_\{([^}]+)\}/g, (_: string, sub: string) => toSubscript(sub)],
  [/_([0-9a-zA-Z])/g, (_: string, d: string)   => toSubscript(d)],

  // Inverse functions & negative powers: f^(-1), f^-1, f^{-1}, f^{( - 1)} -> f⁻¹
  [/([a-zA-Z0-9_])\^?\s*\(\s*-\s*([0-9a-zA-Z]+)\s*\)/g, (_, fn, exp) => `${fn}${toSuperscript('-' + exp)}`],
  [/([a-zA-Z0-9_])\^?\s*\{\s*\(?\s*-\s*([0-9a-zA-Z]+)\s*\)?\s*\}/g, (_, fn, exp) => `${fn}${toSuperscript('-' + exp)}`],
  [/([a-zA-Z0-9_])\^\s*-\s*([0-9a-zA-Z]+)/g, (_, fn, exp) => `${fn}${toSuperscript('-' + exp)}`],

  // Superscripts & Exponents
  [/\^\{([^}]+)\}/g, (_: string, sup: string) => toSuperscript(sup)],
  [/\^([0-9nix])/g,   (_: string, d: string)   => toSuperscript(d)],

  // Left/Right Brackets
  [/\\left\(/g,   '('],  [/\\right\)/g,  ')'],
  [/\\left\[/g,   '['],  [/\\right\]/g,  ']'],
  [/\\left\\{/g,  '{'],  [/\\right\\}/g, '}'],

  // Trig & Functions
  [/\\sin/g,      'sin'],[/\\cos/g,      'cos'],[/\\tan/g,      'tan'],
  [/\\csc/g,      'csc'],[/\\sec/g,      'sec'],[/\\cot/g,      'cot'],
  [/\\arcsin/g,   'arcsin'], [/\\arccos/g, 'arccos'], [/\\arctan/g, 'arctan'],
  [/\\sinh/g,     'sinh'],[/\\cosh/g,    'cosh'],[/\\tanh/g,    'tanh'],
  [/\\ln/g,       'ln'], [/\\log/g,     'log'], [/\\lim/g,     'lim'],
  [/\\deg/g,      'deg'],[/\\min/g,     'min'], [/\\max/g,     'max'],

  // Math Operators & Relations
  [/\\times/g,    '×'],  [/\\cdot/g,     '·'],
  [/\\div/g,      '÷'],  [/\\pm/g,       '±'],
  [/\\mp/g,       '∓'],  [/\\neq/g,      '≠'],
  [/\\leq/g,      '≤'],  [/\\geq/g,      '≥'],
  [/\\approx/g,   '≈'],  [/\\equiv/g,    '≡'],

  // Greek Letters
  [/\\pi/g,       'π'],  [/\\theta/g,    'θ'],
  [/\\alpha/g,    'α'],  [/\\beta/g,     'β'],
  [/\\gamma/g,    'γ'],  [/\\delta/g,    'δ'],
  [/\\lambda/g,   'λ'],  [/\\mu/g,       'μ'],
  [/\\sigma/g,    'σ'],  [/\\omega/g,    'ω'],
  [/\\Delta/g,    'Δ'],  [/\\Sigma/g,    'Σ'],
  [/\\Omega/g,    'Ω'],  [/\\infty/g,    '∞'],

  // Braces & Stray Slashes Cleanup
  [/\{([^}]*)\}/g, '$1'],
  [/\\[a-zA-Z]+/g, ''],
];

function cleanLatexFallback(raw: string): string {
  let s = raw;
  for (const [re, rep] of BARE_LATEX_MAP) {
    s = s.replace(re, rep as string);
  }
  s = s.replace(/\\+/g, '');
  return s.trim();
}

/**
 * Automatically isolates pure math expressions into standard LaTeX $...$ delimiters
 */
function normalizeMathInText(rawText: string): string {
  if (!rawText) return '';
  let str = String(rawText);

  if (/\$[^\$\n]+?\$|\\\([\s\S]*?\\\)/.test(str)) {
    return str;
  }

  const mathTriggerRegex = /[\^±√=]|\blog_?[0-9a-zA-Z]*|\b[a-zA-Z0-9_()]+\s*\/\s*[a-zA-Z0-9_()]+\b/i;
  if (!mathTriggerRegex.test(str)) {
    return str;
  }

  const formatFormulaOnly = (expr: string) => {
    let s = expr.trim();
    let punct = '';
    const matchPunct = s.match(/([.,;:?!])$/);
    if (matchPunct && !s.endsWith(')')) {
      punct = matchPunct[1];
      s = s.slice(0, -1).trim();
    }

    s = s.replace(/±|\+-/g, '\\pm ');
    s = s.replace(/×/g, '\\times ').replace(/÷/g, '\\div ');
    s = s.replace(/\^?\\?(degree|degrees|circ)\b/gi, '^{\\circ}').replace(/°/g, '^{\\circ}');

    s = s.replace(/√\s*\(\s*\(\s*([^)]+)\s*\)\s*\)/g, '\\sqrt{$1}');
    s = s.replace(/√\s*\(\s*([^)]+)\s*\)/g, '\\sqrt{$1}');
    s = s.replace(/√\s*([a-zA-Z0-9_]+)/g, '\\sqrt{$1}');

    s = s.replace(/\(\s*-b\s*\\pm\s*\\sqrt\{([^}]+)\}\s*\)\s*\/\s*(\(?\s*\d*[a-zA-Z0-9^]+\s*\)?)/g, '\\frac{-b \\pm \\sqrt{$1}}{$2}');
    s = s.replace(/\\sqrt\{\s*\(?\s*([^/]+?)\s*\/\s*([^)]+?)\s*\)?\s*\}/g, '\\sqrt{\\frac{$1}{$2}}');

    const parenFracRegex = /\(\s*((?:[^{}()]+|\([^()]*\))+?)\s*\/\s*((?:[^{}()]+|\([^()]*\))+?)\s*\)/g;
    s = s.replace(parenFracRegex, (match, num, den) => {
      let n = num.trim();
      let d = den.trim();
      if (n.startsWith('(') && n.endsWith(')')) n = n.slice(1, -1).trim();
      return `\\frac{${n}}{${d}}`;
    });

    const unparenFracRegex = /(\b[a-zA-Z0-9_]+(?:\([^()]*\))?)\s*\/\s*(\b[a-zA-Z0-9_]+(?:\([^()]*\))?)/g;
    s = s.replace(unparenFracRegex, '\\frac{$1}{$2}');
    // Clean up stray closing parenthesis directly following \frac{...}{...}
    s = s.replace(/(\\frac\s*\{[^{}]*\}\s*\{[^}]+\})\)/g, (m, p1) => p1);

    // Wrap fractions adjacent to whole numbers in parens: 2\frac{1}{3} or 2 1/3 -> 2\left(\frac{1}{3}\right)
    s = s.replace(/(\b\d+)\s*\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1\\left(\\frac{$2}{$3}\\right)');
    s = s.replace(/(\b\d+)\s+([a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)/g, '$1\\left(\\frac{$2}{$3}\\right)');
    s = s.replace(/\\left\(\\left\(/g, '\\left(').replace(/\\right\)\\right\)/g, '\\right)');

    s = s.replace(/(?<!\\)\b(sin|cos|tan|asin|acos|atan|csc|sec|cot)\b/g, (m) => '\\' + m);

    s = s.replace(/\blog_?([0-9a-zA-Z]+)\s*\(([^)]+)\)/gi, '\\log_{$1}($2)');
    s = s.replace(/\blog_?([0-9a-zA-Z]+)\s+([0-9a-zA-Z]+)/gi, '\\log_{$1}{$2}');
    // Format inverse functions and negative exponents: f^(-1) -> f^{-1}, f^-1 -> f^{-1}
    s = s.replace(/([a-zA-Z0-9_])\^?\s*\(\s*-\s*([0-9a-zA-Z]+)\s*\)/g, '$1^{-$2}');
    s = s.replace(/([a-zA-Z0-9_])\^?\s*\{\s*\(?\s*-\s*([0-9a-zA-Z]+)\s*\)?\s*\}/g, '$1^{-$2}');
    s = s.replace(/([a-zA-Z0-9_])\^\s*-\s*([0-9a-zA-Z]+)/g, '$1^{-$2}');

    s = s.replace(/([a-zA-Z0-9_)]+)\^([a-zA-Z0-9_]+)/g, '$1^{$2}');

    let openCount = (s.match(/\(/g) || []).length;
    let closeCount = (s.match(/\)/g) || []).length;
    while (closeCount > openCount && s.endsWith(')')) {
      s = s.slice(0, -1).trim();
      closeCount--;
    }

    s = s.replace(/\s+/g, ' ').trim();
    return `$${s}$` + punct;
  };

  const isProseWord = (word: string) => {
    const w = word.toLowerCase().trim();
    if (!w || w.length < 2) return false;
    if (/^log_?[0-9a-zA-Z]*$/i.test(w)) return false;
    const mathKeywords = new Set([
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'lim', 'det',
      'min', 'max', 'ax', 'bx', 'cx', 'dx', 'ex', 'fx', 'gx', 'hx', 'pm'
    ]);
    return !mathKeywords.has(w);
  };

  return str.replace(/((?:\([^)]+\)|[a-zA-Z0-9_]|\s|[+\-*/=^±√().,°%\[\]{}]){1,})/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed) return match;

    const words = trimmed.match(/\b[a-zA-Z]{2,}\b/g) || [];
    const proseWords = words.filter(isProseWord);

    if (proseWords.length > 0) {
      return match;
    }

    const hasMathIndicator = /[\^±√=]|\blog_?[0-9a-zA-Z]*|\b[a-zA-Z0-9_]+\s*[+\-*/=]\s*[a-zA-Z0-9_]+\b|\([a-zA-Z0-9^+\-*/\s]+\)\s*\(/i.test(trimmed);
    if (hasMathIndicator) {
      return formatFormulaOnly(trimmed);
    }

    return match;
  });
}

// ─── Block types ──────────────────────────────────────────────────────────────
type Block =
  | { type: 'display-math'; rawMath: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; n: number; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'paragraph'; text: string };

function isInvalidDisplayMath(raw: string): boolean {
  if (!raw) return true;
  // If raw contains Markdown headers, URLs, or markdown links/bold, it's not a pure math block
  if (/#{1,6}\s+|https?:\/\/|\*\*|\[.+\]\(.+\)/.test(raw)) return true;
  // If raw contains backtick code spans or list markers, it's prose/code explanation
  if (/`|^\s*[-*•]\s+/m.test(raw)) return true;
  return false;
}

function parseBlocks(content: string): Block[] {
  const normalized = normalizeMathInText(content);
  const blocks: Block[] = [];

  const displayRe = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = displayRe.exec(normalized)) !== null) {
    const raw = m[0].startsWith('$$') ? m[0].slice(2, -2) : m[0].slice(2, -2);
    if (!isInvalidDisplayMath(raw)) {
      if (m.index > last) parseLineBlocks(normalized.slice(last, m.index), blocks);
      blocks.push({ type: 'display-math', rawMath: raw.trim() });
      last = m.index + m[0].length;
    }
  }
  if (last < normalized.length) parseLineBlocks(normalized.slice(last), blocks);
  return blocks;
}

function parseLineBlocks(text: string, out: Block[]) {
  let para = '';
  const flush = () => {
    const t = para.trim();
    if (t) out.push({ type: 'paragraph', text: t });
    para = '';
  };

  const lines = text.split('\n');
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      const cleanRows = tableBuffer
        .map(l => l.trim())
        .filter(l => l.startsWith('|') || l.endsWith('|'))
        .map(l => {
          const cells = l.split('|');
          if (cells.length > 1 && cells[0].trim() === '') cells.shift();
          if (cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();
          return cells.map(c => c.trim());
        });

      if (cleanRows.length > 0) {
        const isDivider = cleanRows[1] && cleanRows[1].every(c => /^:?-+:?$/.test(c.replace(/\s+/g, '')));
        const finalRows = isDivider ? [cleanRows[0], ...cleanRows.slice(2)] : cleanRows;
        out.push({ type: 'table', rows: finalRows });
      }
      tableBuffer = [];
    }
  };

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) {
      flushTable();
      flush();
      continue;
    }

    if (t.startsWith('|') && t.includes('|')) {
      flush();
      tableBuffer.push(t);
      continue;
    }
    flushTable();

    const heading = t.match(/^(#{1,4})\s+(.+)$/);
    const bullet  = t.match(/^[-*•]\s+(.+)$/);
    const num     = t.match(/^(\d+)\.\s+(.+)$/);

    if (heading) {
      flush();
      out.push({ type: 'heading', level: heading[1].length, text: heading[2] });
    } else if (bullet) {
      flush();
      out.push({ type: 'bullet', text: bullet[1] });
    } else if (num) {
      flush();
      out.push({ type: 'numbered', n: parseInt(num[1], 10), text: num[2] });
    } else {
      para += (para ? ' ' : '') + t;
    }
  }
  flushTable();
  flush();
}

// ─── Inline renderer: bold + code + math + text ──────────────────────────────
function InlineText({
  text,
  color,
  fontSize,
  mathBg,
}: {
  text: string;
  color: string;
  fontSize: number;
  mathBg: string;
}) {
  type Part = { type: 'plain' | 'bold' | 'code' | 'math'; value: string };
  const parts: Part[] = [];
  const re = /(\*\*(.+?)\*\*|`([^`\n]+)`|\$(?!\$)([^$\n]+?)\$|\\\((.+?)\\\))/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'plain', value: text.slice(last, m.index) });
    if (m[0].startsWith('**')) {
      parts.push({ type: 'bold', value: m[2] });
    } else if (m[0].startsWith('`')) {
      parts.push({ type: 'code', value: m[3] });
    } else {
      const mathStr = m[4] || m[5];
      parts.push({ type: 'math', value: mathStr });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'plain', value: text.slice(last) });

  return (
    <Text style={{ color, fontSize, lineHeight: fontSize * 1.55, flexShrink: 1 }}>
      {parts.map((p, i) => {
        if (p.type === 'bold') {
          return (
            <Text key={i} style={{ fontWeight: '700', color }}>
              {p.value}
            </Text>
          );
        }
        if (p.type === 'code') {
          return (
            <Text
              key={i}
              style={{
                fontFamily: 'monospace',
                fontSize: fontSize * 0.9,
                color,
                backgroundColor: mathBg,
                paddingHorizontal: 4,
                borderRadius: 4,
              }}
            >
              {p.value}
            </Text>
          );
        }
        if (p.type === 'math') {
          // Cleaned Math symbol matching Web KaTeX font & transparent background
          const mathDisplay = cleanLatexFallback(p.value);
          return (
            <Text
              key={i}
              style={{
                fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                fontWeight: '600',
                color,
                fontSize,
                paddingHorizontal: 1,
              }}
            >
              {mathDisplay}
            </Text>
          );
        }
        return <Text key={i}>{p.value}</Text>;
      })}
    </Text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MessageRenderer({
  content,
  isUser = false,
  textColor,
  fontSize = 15,
}: Props) {
  const { darkMode } = useTheme();
  const effectiveFontSize = fontSize;

  const resolvedColor = isUser ? '#ffffff' : (textColor ?? (darkMode ? '#f0f0f0' : '#091426'));
  const mathBg = isUser
    ? 'rgba(255,255,255,0.15)'
    : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(75,65,225,0.08)');
  const displayBg = isUser
    ? 'rgba(255,255,255,0.1)'
    : (darkMode ? '#1e1e1e' : '#f0eeff');
  const displayColor = isUser ? '#ffffff' : (darkMode ? '#c4b5fd' : '#4b41e1');
  const borderColor = darkMode ? '#2e2e2e' : '#e0e3e5';

  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'display-math') {
          return (
            <MathRenderer
              key={i}
              math={block.rawMath}
              displayMode={true}
              color={displayColor}
              fontSize={effectiveFontSize + 1}
              backgroundColor={displayBg}
            />
          );
        }

        if (block.type === 'heading') {
          const hSizes: Record<number, number> = { 1: 18, 2: 17, 3: 16, 4: 15 };
          const hSize = hSizes[block.level] || 15;
          return (
            <View key={i} style={{ marginTop: 8, marginBottom: 4 }}>
              <InlineText text={block.text} color={resolvedColor} fontSize={hSize} mathBg={mathBg} />
            </View>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bullet, { color: resolvedColor, fontSize: effectiveFontSize }]}>•</Text>
              <View style={styles.listContent}>
                <InlineText text={block.text} color={resolvedColor} fontSize={effectiveFontSize} mathBg={mathBg} />
              </View>
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bullet, { color: resolvedColor, fontSize: effectiveFontSize }]}>{block.n}.</Text>
              <View style={styles.listContent}>
                <InlineText text={block.text} color={resolvedColor} fontSize={effectiveFontSize} mathBg={mathBg} />
              </View>
            </View>
          );
        }

        if (block.type === 'table') {
          return (
            <View key={i} style={[styles.tableCard, { borderColor }]}>
              {block.rows.map((row, rIdx) => (
                <View
                  key={rIdx}
                  style={[
                    styles.tableRow,
                    rIdx === 0 && { backgroundColor: darkMode ? '#252f40' : '#f0eeff' },
                    rIdx < block.rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                  ]}
                >
                  {row.map((cell, cIdx) => (
                    <View key={cIdx} style={styles.tableCell}>
                      <InlineText text={cell} color={resolvedColor} fontSize={effectiveFontSize - 1} mathBg={mathBg} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        }

        // paragraph
        return (
          <View key={i} style={i > 0 ? styles.paraGap : undefined}>
            <InlineText text={block.text} color={resolvedColor} fontSize={effectiveFontSize} mathBg={mathBg} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    gap: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    minWidth: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  listContent: {
    flex: 1,
  },
  paraGap: {
    marginTop: 4,
  },
  tableCard: {
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
});
