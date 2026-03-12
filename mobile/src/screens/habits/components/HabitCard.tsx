import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import WeeklyGrid from './WeeklyGrid';
import StreakBadge from './StreakBadge';
import type { Habit, HabitLog } from '../../../types';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  completedToday: boolean;
  onComplete: (id: string) => void;
  onPress: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  health: Colors.categoryHealth,
  learning: Colors.categoryLearning,
  work: Colors.categoryWork,
  personal: Colors.categoryPersonal,
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HabitCard({
  habit,
  logs,
  completedToday,
  onComplete,
  onPress,
}: HabitCardProps) {
  const scale = useSharedValue(1);
  const accentColor = CATEGORY_COLORS[habit.category] ?? Colors.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handleComplete() {
    if (completedToday) return;
    scale.value = withSpring(0.96, { damping: 8 }, () => {
      scale.value = withSpring(1);
    });
    onComplete(habit.id);
  }

  return (
    <Animated.View style={[styles.card, { borderLeftColor: accentColor }, animatedStyle]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => onPress(habit.id)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.categoryDot, { backgroundColor: accentColor }]} />
          <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        </View>
        <View style={styles.headerRight}>
          {habit.currentStreak > 0 && (
            <StreakBadge streak={habit.currentStreak} size="sm" />
          )}
          <TouchableOpacity
            style={[
              styles.checkBtn,
              completedToday && styles.checkBtnDone,
              { borderColor: completedToday ? accentColor : Colors.border },
            ]}
            onPress={handleComplete}
          >
            {completedToday && (
              <Ionicons name="checkmark" size={14} color={accentColor} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Weekly grid */}
      <WeeklyGrid logs={logs} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgInput,
  },
  checkBtnDone: { backgroundColor: 'transparent' },
});
