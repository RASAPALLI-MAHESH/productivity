import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { useTaskStore } from '../../store/taskStore';
import { useHabitStore } from '../../store/habitStore';
import { useAuthStore } from '../../store/authStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import Card from '../../components/ui/Card';

export default function InsightsScreen() {
  const { tasks, fetchTasks } = useTaskStore();
  const { habits, intelligence, fetchDashboard } = useHabitStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
    fetchDashboard();
  }, []);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityBreakdown = {
    critical: tasks.filter((t) => t.priority === 'critical').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Insights" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* XP / Level */}
        {user && (
          <Card style={styles.xpCard}>
            <View style={styles.xpRow}>
              <View>
                <Text style={styles.levelLabel}>LEVEL</Text>
                <Text style={styles.levelValue}>{user.level}</Text>
              </View>
              <View style={styles.xpRight}>
                <Text style={styles.xpValue}>{user.xp.toLocaleString()} XP</Text>
                <Text style={styles.xpSub}>Total earned</Text>
              </View>
            </View>
            {/* XP bar */}
            <View style={styles.xpBarBg}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${Math.min(100, (user.xp % 1000) / 10)}%` },
                ]}
              />
            </View>
          </Card>
        )}

        {/* Task completion */}
        <Text style={styles.sectionTitle}>Tasks</Text>
        <View style={styles.statGrid}>
          <StatBox value={totalTasks} label="Total" color={Colors.primary} />
          <StatBox value={completedTasks} label="Done" color={Colors.success} />
          <StatBox value={`${completionRate}%`} label="Rate" color={Colors.warning} />
          <StatBox value={user?.totalTasksCompleted ?? 0} label="All time" color={Colors.info} />
        </View>

        {/* Priority breakdown */}
        <Text style={styles.sectionTitle}>Priority Breakdown</Text>
        <Card>
          {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
            const count = priorityBreakdown[p];
            const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
            const colors = {
              critical: Colors.priorityCritical,
              high: Colors.priorityHigh,
              medium: Colors.priorityMedium,
              low: Colors.priorityLow,
            };
            return (
              <View key={p} style={styles.priorityRow}>
                <View style={styles.priorityLabelRow}>
                  <View style={[styles.priorityDot, { backgroundColor: colors[p] }]} />
                  <Text style={styles.priorityLabel}>{p}</Text>
                  <Text style={styles.priorityCount}>{count}</Text>
                </View>
                <View style={styles.barBg}>
                  <View
                    style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors[p] }]}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        {/* Habits */}
        {intelligence && (
          <>
            <Text style={styles.sectionTitle}>Habits</Text>
            <View style={styles.statGrid}>
              <StatBox
                value={`${Math.round(intelligence.consistencyScore)}%`}
                label="Consistency"
                color={Colors.primary}
              />
              <StatBox
                value={`${Math.round(intelligence.weeklyCompletionRate)}%`}
                label="This week"
                color={Colors.success}
              />
              <StatBox
                value={`${intelligence.longestStreak}d`}
                label="Best streak"
                color={Colors.warning}
              />
              <StatBox
                value={user?.streakBest ?? 0}
                label="All time"
                color={Colors.info}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <View style={[statStyles.box, { borderColor: color + '40' }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.screen, paddingBottom: 100, gap: Spacing.sm },
  xpCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary + '40',
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelLabel: { fontSize: 10, color: Colors.primary, fontWeight: '700', letterSpacing: 1 },
  levelValue: { fontSize: 40, fontWeight: '800', color: Colors.primary },
  xpRight: { alignItems: 'flex-end' },
  xpValue: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  xpSub: { fontSize: 12, color: Colors.textMuted },
  xpBarBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  priorityRow: { gap: 6, marginBottom: Spacing.sm },
  priorityLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary, textTransform: 'capitalize' },
  priorityCount: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  barBg: { height: 4, backgroundColor: Colors.bgInput, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
});
