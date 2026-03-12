import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useHabitStore } from '../../store/habitStore';
import HabitCard from './components/HabitCard';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import { HabitSkeleton } from '../../components/ui/Skeleton';
import type { Habit, HabitStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<HabitStackParamList, 'HabitList'>;

export default function HabitsScreen() {
  const navigation = useNavigation<Nav>();
  const { habits, logs, intelligence, isLoading, isRefreshing, refresh, completeHabit, isCompletedToday } =
    useHabitStore();

  useEffect(() => {
    refresh();
  }, []);

  const completedCount = habits.filter((h) => isCompletedToday(h.id)).length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Habits"
        subtitle={
          habits.length > 0
            ? `${completedCount}/${habits.length} done today`
            : undefined
        }
      />

      {/* Intelligence strip */}
      {intelligence && (
        <View style={styles.statsRow}>
          <StatPill
            label="Consistency"
            value={`${Math.round(intelligence.consistencyScore)}%`}
            color={Colors.primary}
          />
          <StatPill
            label="Weekly"
            value={`${Math.round(intelligence.weeklyCompletionRate)}%`}
            color={Colors.success}
          />
          <StatPill
            label="Best streak"
            value={`${intelligence.longestStreak}d`}
            color={Colors.warning}
          />
          {intelligence.riskCount > 0 && (
            <StatPill
              label="At risk"
              value={`${intelligence.riskCount}`}
              color={Colors.danger}
            />
          )}
        </View>
      )}

      {isLoading && habits.length === 0 ? (
        <View>
          {Array.from({ length: 4 }).map((_, i) => (
            <HabitSkeleton key={i} />
          ))}
        </View>
      ) : habits.length === 0 ? (
        <EmptyState
          icon="repeat-outline"
          title="No habits yet"
          subtitle="Build consistency with daily habits"
        />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              logs={logs[item.id] ?? []}
              completedToday={isCompletedToday(item.id)}
              onComplete={completeHabit}
              onPress={(id) => navigation.navigate('HabitDetail', { habitId: id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[statStyles.pill, { borderColor: color }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  list: { paddingTop: Spacing.sm, paddingBottom: 100 },
});

const statStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    gap: 2,
  },
  value: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
});
