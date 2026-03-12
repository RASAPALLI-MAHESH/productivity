import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { getWeekDays, toISODateString } from '../../../utils/date';
import { format } from 'date-fns';
import type { HabitLog } from '../../../types';

interface WeeklyGridProps {
  logs: HabitLog[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeeklyGrid({ logs }: WeeklyGridProps) {
  const days = getWeekDays();
  const today = toISODateString(new Date());

  const logMap = new Map(logs.map((l) => [l.date, l.completed]));

  return (
    <View style={styles.row}>
      {days.map((day, i) => {
        const dateStr = toISODateString(day);
        const completed = logMap.get(dateStr) ?? false;
        const isToday = dateStr === today;
        const isFuture = day > new Date();

        return (
          <View key={dateStr} style={styles.dayCol}>
            <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
              {DAY_LABELS[i]}
            </Text>
            <View
              style={[
                styles.dot,
                completed && styles.dotCompleted,
                isToday && !completed && styles.dotToday,
                isFuture && styles.dotFuture,
              ]}
            >
              {completed && (
                <View style={styles.innerDot} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  dayCol: { alignItems: 'center', gap: 4, flex: 1 },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  dayLabelToday: { color: Colors.primary },
  dot: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotCompleted: {
    backgroundColor: Colors.successDim,
    borderColor: Colors.success,
  },
  dotToday: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  dotFuture: { opacity: 0.4 },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
});
