import { StyleSheet } from 'react-native';

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const textStyles = StyleSheet.create({
  displayLg: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  displayMd: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyMd: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  captionMd: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
});
