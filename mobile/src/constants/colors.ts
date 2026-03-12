export const Colors = {
  // Backgrounds
  bg: '#0F0F0F',
  bgElevated: '#1A1A1A',
  bgCard: '#1E1E1E',
  bgInput: '#252525',

  // Borders
  border: '#2A2A2A',
  borderFocus: '#5A5AF8',

  // Brand
  primary: '#5A5AF8',
  primaryDim: 'rgba(90, 90, 248, 0.15)',
  primaryDark: '#3D3DB5',

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#8A8A9A',
  textMuted: '#4A4A5A',
  textInverse: '#0F0F0F',

  // Status / Priority
  success: '#22C55E',
  successDim: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningDim: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerDim: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoDim: 'rgba(59, 130, 246, 0.15)',

  // Priority colors
  priorityLow: '#22C55E',
  priorityMedium: '#F59E0B',
  priorityHigh: '#F97316',
  priorityCritical: '#EF4444',

  // Habit categories
  categoryHealth: '#22C55E',
  categoryLearning: '#3B82F6',
  categoryWork: '#5A5AF8',
  categoryPersonal: '#A855F7',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
