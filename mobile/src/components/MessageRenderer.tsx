/**
 * MessageRenderer
 *
 * Renders math-heavy text with zero WebView usage — pure React Native Text.
 *
 * Handles:
 * - $$...$$ display blocks  → cleaned, styled in a distinct block
 * - $...$ inline math       → cleaned, styled monospace inline
 * - Bare \command tokens    → converted to Unicode (π, θ, √, ×, etc.)
 * - **bold** markdown
 * - Numbered and bullet lists
 * - Plain paragraphs
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  content: string;
  isUser?: boolean;
  textColor?: string;
  fontSize?: number;
}

// ─── Subscript digit helper ───────────────────────────────────────────────────
const SUB_DIGITS: Record<string, string> = {
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄',
  '5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
};
function toSubscript(s: string): string {
  // Convert digit strings to Unicode subscripts; leave letters as-is with underscore
  const allDigits = /^\d+$/.test(s);
  if (allDigits) return s.split('').map(c => SUB_DIGITS[c] ?? c).join('');
  return `_${s}`;
}

// ─── Bare LaTeX → readable Unicode/text ──────────────────────────────────────
const BARE_LATEX_MAP: [RegExp, string | ((...args: string[]) => string)][] = [
  // Multi-arg commands first
  [/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, num, den) => {
    // Render as "num/den" — wrap in parens only if either part is compound
    const needsParens = (s: string) => /[+\-]/.test(s);
    const n = needsParens(num) ? `(${num})` : num;
    const d = needsParens(den) ? `(${den})` : den;
    return `${n}/${d}`;
  }],
  [/\\sqrt\{([^}]+)\}/g,            '√($1)'],
  [/\\text\{([^}]+)\}/g,            '$1'],
  // log with base: \log_{5}(x) → log₅(x)
  [/\\log_\{([^}]+)\}/g, (_: string, base: string) => `log${toSubscript(base)}`],
  [/\\log_([0-9a-zA-Z])/g, (_: string, base: string) => `log${toSubscript(base)}`],
  // subscript: _{n} → Unicode subscript digits where possible
  [/_\{([^}]+)\}/g, (_: string, sub: string) => toSubscript(sub)],
  [/_([0-9])/g,     (_: string, d: string)   => toSubscript(d)],
  // superscript: ^{n}
  [/\^\{([^}]+)\}/g, (_: string, sup: string) => `^${sup}`],
  [/\^([0-9])/g,    (_: string, d: string)   => `^${d}`],
  // Brackets
  [/\\left\(/g,   '('],  [/\\right\)/g,  ')'],
  [/\\left\[/g,   '['],  [/\\right\]/g,  ']'],
  [/\\left\\{/g,  '{'],  [/\\right\\}/g, '}'],
  // Operators
  [/\\times/g,    '×'],  [/\\cdot/g,     '·'],
  [/\\div/g,      '÷'],  [/\\pm/g,       '±'],
  [/\\mp/g,       '∓'],
  // Relations
  [/\\neq/g,      '≠'],  [/\\leq/g,      '≤'],
  [/\\geq/g,      '≥'],  [/\\approx/g,   '≈'],
  [/\\equiv/g,    '≡'],  [/\\sim/g,      '~'],
  // Arrows
  [/\\Rightarrow/g, '⇒'], [/\\Leftarrow/g,  '⇐'],
  [/\\rightarrow/g, '→'], [/\\leftarrow/g,  '←'],
  [/\\Leftrightarrow/g, '⟺'],
  // Greek letters
  [/\\pi/g,       'π'],  [/\\theta/g,    'θ'],
  [/\\alpha/g,    'α'],  [/\\beta/g,     'β'],
  [/\\gamma/g,    'γ'],  [/\\delta/g,    'δ'],
  [/\\epsilon/g,  'ε'],  [/\\zeta/g,     'ζ'],
  [/\\eta/g,      'η'],  [/\\lambda/g,   'λ'],
  [/\\mu/g,       'μ'],  [/\\nu/g,       'ν'],
  [/\\xi/g,       'ξ'],  [/\\rho/g,      'ρ'],
  [/\\sigma/g,    'σ'],  [/\\tau/g,      'τ'],
  [/\\phi/g,      'φ'],  [/\\chi/g,      'χ'],
  [/\\psi/g,      'ψ'],  [/\\omega/g,    'ω'],
  [/\\Gamma/g,    'Γ'],  [/\\Delta/g,    'Δ'],
  [/\\Theta/g,    'Θ'],  [/\\Lambda/g,   'Λ'],
  [/\\Pi/g,       'Π'],  [/\\Sigma/g,    'Σ'],
  [/\\Omega/g,    'Ω'],
  // Trig functions
  [/\\arctan/g,   'arctan'], [/\\arcsin/g, 'arcsin'],
  [/\\arccos/g,   'arccos'], [/\\sin/g,    'sin'],
  [/\\cos/g,      'cos'],    [/\\tan/g,    'tan'],
  [/\\cot/g,      'cot'],    [/\\sec/g,    'sec'],
  [/\\csc/g,      'csc'],
  // Log/misc
  // Plain-text log with attached base: log2(x) → log₂(x), log10(x) → log₁₀(x)
  [/\blog(\d+)\b/g, (_: string, base: string) => `log${toSubscript(base)}`],
  [/\\log/g,      'log'],   [/\\ln/g,     'ln'],
  [/\\exp/g,      'exp'],   [/\\lim/g,    'lim'],
  [/\\infty/g,    '∞'],     [/\\emptyset/g, '∅'],
  [/\\sqrt/g,     '√'],
  // Superscript shorthands (^2, ^3)
  [/\^2/g, '²'], [/\^3/g, '³'],
  // Spacing commands
  [/\\!/g,  ''],  [/\\,/g,  ' '],
  [/\\;/g,  ' '], [/\\:/g,  ' '],
  [/\\ /g,  ' '],
  // Strip remaining bare braces
  [/\{([^}]*)\}/g, '$1'],
  // Any remaining lone backslash-word
  [/\\[a-zA-Z]+/g, ''],
];

function cleanLatex(raw: string): string {
  let s = raw;
  for (const [re, rep] of BARE_LATEX_MAP) {
    s = s.replace(re, rep as string);
  }
  return s.trim();
}

// ─── Block types ──────────────────────────────────────────────────────────────
type Block =
  | { type: 'display-math'; text: string }
  | { type: 'bullet';       text: string }
  | { type: 'numbered';     n: number; text: string }
  | { type: 'paragraph';    text: string };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];

  // Split on $$...$$ first
  const displayRe = /\$\$([\s\S]+?)\$\$/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = displayRe.exec(content)) !== null) {
    if (m.index > last) parseLineBlocks(content.slice(last, m.index), blocks);
    blocks.push({ type: 'display-math', text: cleanLatex(m[1].trim()) });
    last = m.index + m[0].length;
  }
  if (last < content.length) parseLineBlocks(content.slice(last), blocks);
  return blocks;
}

function parseLineBlocks(text: string, out: Block[]) {
  let para = '';
  const flush = () => {
    const t = para.trim();
    if (t) out.push({ type: 'paragraph', text: t });
    para = '';
  };
  for (const raw of text.split('\n')) {
    const t = raw.trim();
    if (!t) { flush(); continue; }
    const bullet = t.match(/^[-*•]\s+(.+)$/);
    const num    = t.match(/^(\d+)\.\s+(.+)$/);
    if (bullet)   { flush(); out.push({ type: 'bullet',   text: bullet[1] }); }
    else if (num) { flush(); out.push({ type: 'numbered', n: parseInt(num[1]), text: num[2] }); }
    else          { para += (para ? ' ' : '') + t; }
  }
  flush();
}

// ─── Inline text: **bold** + $math$ + plain ──────────────────────────────────
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
  type Part = { t: 'plain' | 'bold' | 'math'; v: string };
  const parts: Part[] = [];
  const re = /(\*\*(.+?)\*\*|\$(?!\$)([^$\n]+?)\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'plain', v: text.slice(last, m.index) });
    if (m[0].startsWith('**')) parts.push({ t: 'bold', v: m[2] });
    else                        parts.push({ t: 'math', v: cleanLatex(m[3]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: 'plain', v: cleanLatex(text.slice(last)) });

  return (
    <Text style={{ color, fontSize, lineHeight: fontSize * 1.65, flexShrink: 1 }}>
      {parts.map((p, i) => {
        if (p.t === 'bold') {
          return (
            <Text key={i} style={{ fontWeight: '700', color }}>
              {p.v}
            </Text>
          );
        }
        if (p.t === 'math') {
          return (
            <Text
              key={i}
              style={{
                fontFamily: 'monospace',
                color,
                backgroundColor: mathBg,
                fontSize: fontSize - 1,
                paddingHorizontal: 3,
                borderRadius: 3,
              }}
            >
              {p.v}
            </Text>
          );
        }
        return <Text key={i}>{p.v}</Text>;
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

  const resolvedColor = textColor ?? (isUser ? '#ffffff' : (darkMode ? '#f0f0f0' : '#091426'));
  const mathBg  = isUser
    ? 'rgba(255,255,255,0.15)'
    : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(75,65,225,0.08)');
  const displayBg = isUser
    ? 'rgba(255,255,255,0.1)'
    : (darkMode ? '#242424' : '#f0eeff');
  const displayColor = isUser ? '#ffffff' : (darkMode ? '#c4b5fd' : '#4b41e1');

  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'display-math') {
          return (
            <View key={i} style={[styles.displayBlock, { backgroundColor: displayBg }]}>
              <Text
                style={{
                  fontFamily: 'monospace',
                  fontSize: fontSize + 1,
                  color: displayColor,
                  textAlign: 'center',
                  lineHeight: (fontSize + 1) * 1.6,
                }}
              >
                {block.text}
              </Text>
            </View>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bullet, { color: resolvedColor, fontSize }]}>•</Text>
              <View style={styles.listContent}>
                <InlineText text={block.text} color={resolvedColor} fontSize={fontSize} mathBg={mathBg} />
              </View>
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.bullet, { color: resolvedColor, fontSize }]}>{block.n}.</Text>
              <View style={styles.listContent}>
                <InlineText text={block.text} color={resolvedColor} fontSize={fontSize} mathBg={mathBg} />
              </View>
            </View>
          );
        }

        // paragraph
        return (
          <View key={i} style={i > 0 ? styles.paraGap : undefined}>
            <InlineText text={block.text} color={resolvedColor} fontSize={fontSize} mathBg={mathBg} />
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
  displayBlock: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    minWidth: 20,
    lineHeight: 24,
  },
  listContent: {
    flex: 1,
  },
  paraGap: {
    marginTop: 4,
  },
});
