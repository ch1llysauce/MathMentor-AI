import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme as useThemeColors } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useThemeColors();

  const combinedStyles = [
    { color: theme[themeColor ?? 'text'] },
    type === 'default' && styles.default,
    type === 'title' && styles.title,
    type === 'small' && styles.small,
    type === 'smallBold' && styles.smallBold,
    type === 'subtitle' && styles.subtitle,
    type === 'link' && styles.link,
    type === 'linkPrimary' && styles.linkPrimary,
    type === 'code' && styles.code,
    style,
  ];

  return (
    <Text
      style={combinedStyles}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#0a7ea4',
  },
  linkPrimary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b41e1',
    fontWeight: '600',
  },
  code: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
});
