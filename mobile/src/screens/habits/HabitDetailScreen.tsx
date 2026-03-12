import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { useHabitStore } from '../../store/habitStore';
import { habitsApi } from '../../api/habits';
import ScreenHeader from '../../components/common/ScreenHeader';
import StreakBadge from './components/StreakBadge';
import Button from '../../components/ui/Button';
import type { HabitStackParamList } from '../../types';

type RouteType = RouteProp<HabitStackParamList, 'HabitDetail'>;

const DIFFICULTY_LABELS = ['', 'Novice', 'Easy', 'Medium', 'Hard', 'Legend'];
const CATEGORY_COLORS: Record<string, string> = {
  health: Colors.categoryHealth,
  learning: Colors.categoryLearning,
  work: Colors.categoryWork,
  personal: Colors.categoryPersonal,
};

export default function HabitDetailScreen() {
  const { params } = useRoute<RouteType>();
  const navigation = useNavigation();
  const { habits, completeHabit, deleteHabit, isCompletedToday } = useHabitStore();

  const habit = habits.find((h) => h.id === params.habitId);

  function handleDelete() {
    Alert.alert('Delete Habit', 'This will remove all logs. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (habit) {
            deleteHabit(habit.id);
            navigation.goBack();
          }
        },
      },
    ]);
  }

  if (!habit) return null;

  const completedToday = isCompletedToday(habit.id);
  const accent = CATEGORY_COLORS[habit.category] ?? Colors.primary;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Habit" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Card */}
        <View style={[styles.heroCard, { borderLeftColor: accent }]}>
          <Text style={[textStyles.headline, { color: Colors.textPrimary }]}>
            {habit.name}
          </Text>
          {habit.description && (
            <Text style={styles.desc}>{habit.description}</Text>
          )}
          <View style={styles.badgeRow}>
            <StreakBadge streak={habit.currentStreak} />
            <View style={styles.chip}>
              <Text style={styles.chipText}>{habit.frequency}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{habit.category}</Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatBox label="Curr. Streak" value={`${habit.currentStreak}d`} />
          <StatBox label="Best Streak" value={`${habit.longestStreak}d`} />
          <StatBox label="Difficulty" value={DIFFICULTY_LABELS[habit.difficulty] ?? `${habit.difficulty}`} />
          <StatBox label="Freeze avail." value={`${habit.streakFreezeAvailable}`} />
        </View>

        {/* Motivation */}
        {habit.motivation && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Why this habit?</Text>
            <Text style={styles.motivationText}>"{habit.motivation}"</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {!completedToday && (
          <Button
            label="Mark Done for Today"
            onPress={() => {
              completeHabit(habit.id);
              navigation.goBack();
            }}
            fullWidth
          />
        )}
        {completedToday && (
          <View style={styles.doneBanner}>
            <Text style={styles.doneText}>✓ Completed today</Text>
          </View>
        )}
        <Button
          label="Delete Habit"
          variant="danger"
          onPress={handleDelete}
          fullWidth
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  desc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    backgroundColor: Colors.bgInput,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  section: { marginBottom: Spacing.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  motivationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  actions: { padding: Spacing.base, paddingBottom: Spacing.xl },
  doneBanner: {
    backgroundColor: Colors.successDim,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  doneText: { fontSize: 15, color: Colors.success, fontWeight: '600' },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  value: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
});
