import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md';
}

export default function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const isSm = size === 'sm';
  return (
    <View style={[styles.badge, isSm && styles.badgeSm]}>
      <Text style={isSm ? styles.flameSm : styles.flame}>🔥</Text>
      <Text style={[styles.count, isSm && styles.countSm]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.warningDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  badgeSm: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  flame: { fontSize: 13 },
  flameSm: { fontSize: 11 },
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warning,
  },
  countSm: { fontSize: 11 },
});
