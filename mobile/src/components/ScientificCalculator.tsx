/**
 * ScientificCalculator
 *
 * A modal scientific calculator with:
 * - Basic arithmetic: + - × ÷
 * - Trig: sin, cos, tan, asin, acos, atan
 * - Powers: x², x³, xʸ, √, ∛
 * - Constants: π, e
 * - Log: log, ln
 * - Degree / Radian toggle
 * - "Use Result" button — pastes the result into the answer field
 */

import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUseResult: (value: string) => void;
  darkMode: boolean;
}

type AngleMode = 'DEG' | 'RAD';

// ─── Safe expression evaluator ────────────────────────────────────────────────
function safeEval(expr: string, mode: AngleMode): string {
  try {
    if (!expr || typeof expr !== 'string') return 'Error';

    const _sin  = (x: number) => (mode === 'DEG' ? Math.sin((x * Math.PI) / 180) : Math.sin(x));
    const _cos  = (x: number) => (mode === 'DEG' ? Math.cos((x * Math.PI) / 180) : Math.cos(x));
    const _tan  = (x: number) => (mode === 'DEG' ? Math.tan((x * Math.PI) / 180) : Math.tan(x));
    const _asin = (x: number) => (mode === 'DEG' ? (Math.asin(x) * 180) / Math.PI : Math.asin(x));
    const _acos = (x: number) => (mode === 'DEG' ? (Math.acos(x) * 180) / Math.PI : Math.acos(x));
    const _atan = (x: number) => (mode === 'DEG' ? (Math.atan(x) * 180) / Math.PI : Math.atan(x));
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
      .replace(/%/g, '/100')
      .replace(/\basin\(/g, '_asin(')
      .replace(/\bacos\(/g, '_acos(')
      .replace(/\batan\(/g, '_atan(')
      .replace(/\bsin\(/g,  '_sin(')
      .replace(/\bcos\(/g,  '_cos(')
      .replace(/\btan\(/g,  '_tan(')
      .replace(/\blog\(/g,  '_log(')
      .replace(/\bln\(/g,   '_ln(')
      .replace(/√\(/g,     '_sqrt(')
      .replace(/∛\(/g,     '_cbrt(')
      .replace(/√/g,      '_sqrt(')
      .replace(/∛/g,      '_cbrt(');

    // Implicit multiplication: e.g. 2( -> 2*(, )( -> )*(, )2 -> )*2, 2_sin -> 2*_sin
    e = e
      .replace(/(\d|\))\s*(\()/g, '$1*$2')
      .replace(/(\d|\))\s*(_sin|_cos|_tan|_asin|_acos|_atan|_log|_ln|_sqrt|_cbrt)/g, '$1*$2')
      .replace(/(\))\s*(\d)/g, '$1*$2');

    // Auto-close missing parentheses
    const openParens = (e.match(/\(/g) || []).length;
    const closeParens = (e.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      e += ')'.repeat(openParens - closeParens);
    }

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

export default function ScientificCalculator({ visible, onClose, onUseResult, darkMode }: Props) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const insets = useSafeAreaInsets();

  const C = {
    bg:          darkMode ? '#0a0a0a' : '#f0f0f5',
    displayBg:   darkMode ? '#1a1a1a' : '#ffffff',
    displayText: darkMode ? '#f0f0f0' : '#091426',
    exprText:    darkMode ? '#888888' : '#888888',
    numBg:       darkMode ? '#2a2a2a' : '#ffffff',
    numText:     darkMode ? '#f0f0f0' : '#091426',
    opBg:        darkMode ? '#312e81' : '#e2dfff',
    opText:      darkMode ? '#a5b4fc' : '#4b41e1',
    fnBg:        darkMode ? '#1e2a3a' : '#e8f4ff',
    fnText:      darkMode ? '#7dd3fc' : '#0369a1',
    eqBg:        '#4b41e1',
    eqText:      '#ffffff',
    clearBg:     darkMode ? '#3a1a1a' : '#fee2e2',
    clearText:   '#ef4444',
    border:      darkMode ? '#2e2e2e' : '#e0e0e0',
    modeBg:      darkMode ? '#1a2a1a' : '#d1fae5',
    modeText:    darkMode ? '#4ade80' : '#065f46',
  };

  const append = (val: string) => {
    if (justEvaluated) {
      // If user taps a number after =, start fresh
      // If user taps an operator, continue with result
      if ('0123456789.π e('.includes(val)) {
        setDisplay(val === '0' ? '0' : val);
        setExpression(val);
      } else {
        setExpression(display + val);
        setDisplay(display + val);
      }
      setJustEvaluated(false);
      return;
    }

    const newExpr = (expression === '0' && !['/', '*', '+', '-', '×', '÷', '.'].includes(val))
      ? val
      : expression + val;

    setExpression(newExpr);
    setDisplay(newExpr);
  };

  const appendFn = (fn: string) => {
    const newExpr = justEvaluated ? fn + '(' : expression + fn + '(';
    setExpression(newExpr);
    setDisplay(newExpr);
    setJustEvaluated(false);
  };

  const calculate = () => {
    if (!expression || expression === 'Error') return;
    const result = safeEval(expression, angleMode);
    setDisplay(result);
    setExpression(result);
    setJustEvaluated(true);
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setJustEvaluated(false);
  };

  const backspace = () => {
    if (justEvaluated) { clear(); return; }
    const next = expression.slice(0, -1);
    setExpression(next);
    setDisplay(next || '0');
  };

  const useResult = () => {
    if (display !== 'Error' && display !== '0') {
      onUseResult(display);
      onClose();
    }
  };

  // ─── Button factories ──────────────────────────────────────────────────────
  const Btn = ({
    label, onPress, bg, fg, flex = 1,
  }: { label: string; onPress: () => void; bg: string; fg: string; flex?: number }) => (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, flex, paddingHorizontal: 2 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.btnText, { color: fg }, label.length >= 4 && { fontSize: 12 }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const Num  = (label: string, val?: string) =>
    <Btn label={label} onPress={() => append(val ?? label)} bg={C.numBg} fg={C.numText} />;
  const Op   = (label: string, val?: string) =>
    <Btn label={label} onPress={() => append(val ?? label)} bg={C.opBg}  fg={C.opText}  />;
  const Fn   = (label: string, fn?: string) =>
    <Btn label={label} onPress={() => appendFn(fn ?? label)} bg={C.fnBg} fg={C.fnText}  />;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: C.bg, paddingBottom: Math.max(insets.bottom, 16) }]}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: C.border }]}>
            <Text style={[styles.headerTitle, { color: C.displayText }]}>Calculator</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.modeBtn, { backgroundColor: C.modeBg }]}
                onPress={() => setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')}
              >
                <Text style={[styles.modeBtnText, { color: C.modeText }]}>{angleMode}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: C.exprText }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Display */}
          <View style={[styles.display, { backgroundColor: C.displayBg, borderColor: C.border }]}>
            <Text style={[styles.exprText, { color: C.exprText }]} numberOfLines={1} ellipsizeMode="head">
              {expression || ' '}
            </Text>
            <Text style={[styles.resultText, { color: C.displayText }]} numberOfLines={1} adjustsFontSizeToFit>
              {display}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.grid}>
            <View style={styles.row}>
              {Fn('sin')}{Fn('cos')}{Fn('tan')}
              {Fn('asin')}{Fn('acos')}{Fn('atan')}
            </View>
            <View style={styles.row}>
              {Fn('√')}{Fn('∛')}
              <Btn label="x²" onPress={() => append('²')} bg={C.fnBg} fg={C.fnText} />
              <Btn label="x³" onPress={() => append('³')} bg={C.fnBg} fg={C.fnText} />
              <Btn label="xʸ" onPress={() => append('^')} bg={C.fnBg} fg={C.fnText} />
              {Fn('log')}{Fn('ln')}
            </View>
            <View style={styles.row}>
              <Btn label="π"  onPress={() => append('π')}  bg={C.opBg}    fg={C.opText}    />
              <Btn label="e"  onPress={() => append('e')}  bg={C.opBg}    fg={C.opText}    />
              <Btn label="("  onPress={() => append('(')}  bg={C.numBg}   fg={C.numText}   />
              <Btn label=")"  onPress={() => append(')')}  bg={C.numBg}   fg={C.numText}   />
              <Btn label="⌫"  onPress={backspace}          bg={C.clearBg} fg={C.clearText} />
              <Btn label="AC" onPress={clear}              bg={C.clearBg} fg={C.clearText} />
            </View>
            <View style={styles.row}>
              {Num('7')}{Num('8')}{Num('9')}{Op('÷')}
            </View>
            <View style={styles.row}>
              {Num('4')}{Num('5')}{Num('6')}{Op('×')}
            </View>
            <View style={styles.row}>
              {Num('1')}{Num('2')}{Num('3')}{Op('-')}
            </View>
            <View style={styles.row}>
              {Num('0')}{Num('.')}
              <Btn label="=" onPress={calculate} bg={C.eqBg} fg={C.eqText} />
              {Op('+')}
            </View>
          </View>

          {/* Use Result */}
          <TouchableOpacity
            style={[styles.useBtn, display === 'Error' && styles.useBtnDisabled]}
            onPress={useResult}
            disabled={display === 'Error'}
            activeOpacity={0.85}
          >
            <Text style={styles.useBtnText}>Use Result  ({display})</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
  },
  display: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    justifyContent: 'flex-end',
  },
  exprText: {
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'right',
  },
  grid: {
    paddingHorizontal: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  useBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  useBtnDisabled: {
    opacity: 0.4,
  },
  useBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
