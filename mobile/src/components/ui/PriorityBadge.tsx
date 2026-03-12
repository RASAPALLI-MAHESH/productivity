import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/spacing';
import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  style?: ViewStyle;
  showLabel?: boolean;
}

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string; dot: string }> = {
  low: { color: Colors.priorityLow, label: 'Low', dot: Colors.priorityLow },
  medium: { color: Colors.priorityMedium, label: 'Medium', dot: Colors.priorityMedium },
  high: { color: Colors.priorityHigh, label: 'High', dot: Colors.priorityHigh },
  critical: { color: Colors.priorityCritical, label: 'Critical', dot: Colors.priorityCritical },
};

export default function PriorityBadge({ priority, style, showLabel = false }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <View style={[styles.badge, { borderColor: config.color }, style]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
