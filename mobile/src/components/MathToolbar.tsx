/**
 * MathToolbar
 *
 * A grid of math symbol buttons shown above the keyboard for free-response
 * questions. Symbols are laid out in fixed rows (no scrolling).
 */

import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  onInsert: (symbol: string) => void;
  darkMode: boolean;
}

const ROWS: { label: string; value: string }[][] = [
  [
    { label: 'π',  value: 'π'  },
    { label: '√',  value: '√'  },
    { label: 'θ',  value: 'θ'  },
    { label: '°',  value: '°'  },
    { label: '²',  value: '²'  },
    { label: '³',  value: '³'  },
    { label: '/',  value: '/'  },
    { label: '.',  value: '.'  },
  ],
  [
    { label: '×',  value: '×'  },
    { label: '÷',  value: '÷'  },
    { label: '±',  value: '±'  },
    { label: '≈',  value: '≈'  },
    { label: '≠',  value: '≠'  },
    { label: '≤',  value: '≤'  },
    { label: '≥',  value: '≥'  },
    { label: '∞',  value: '∞'  },
  ],
  [
    { label: 'α',  value: 'α'  },
    { label: 'β',  value: 'β'  },
    { label: 'λ',  value: 'λ'  },
    { label: 'μ',  value: 'μ'  },
    { label: 'σ',  value: 'σ'  },
    { label: 'Δ',  value: 'Δ'  },
    { label: 'Σ',  value: 'Σ'  },
    { label: 'Ω',  value: 'Ω'  },
  ],
];

export default function MathToolbar({ onInsert, darkMode }: Props) {
  const bg        = darkMode ? '#1a1a1a' : '#f0eeff';
  const border    = darkMode ? '#2e2e2e' : '#ddd9ff';
  const btnBg     = darkMode ? '#2a2a2a' : '#ffffff';
  const btnBorder = darkMode ? '#3a3a3a' : '#c8c4f0';
  const textColor = darkMode ? '#c4b5fd' : '#4b41e1';

  return (
    <View style={[styles.wrapper, { backgroundColor: bg, borderTopColor: border }]}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((sym) => (
            <TouchableOpacity
              key={sym.value}
              style={[styles.btn, { backgroundColor: btnBg, borderColor: btnBorder }]}
              onPress={() => onInsert(sym.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, { color: textColor }]}>{sym.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b41e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
});
