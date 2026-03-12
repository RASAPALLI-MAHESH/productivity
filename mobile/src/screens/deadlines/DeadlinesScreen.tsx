import React, { useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { useTaskStore } from '../../store/taskStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { TaskSkeleton } from '../../components/ui/Skeleton';
import { formatDeadline, daysUntil, isOverdue, isDueToday } from '../../utils/date';
import type { Task } from '../../types';

interface Section {
  title: string;
  accent: string;
  data: Task[];
}

export default function DeadlinesScreen() {
  const { tasks, overdueTasks, isLoading, isRefreshing, refresh, fetchTasks, fetchOverdueTasks } =
    useTaskStore();

  useEffect(() => {
    Promise.all([fetchTasks(), fetchOverdueTasks()]);
  }, []);

  const withDeadlines = tasks.filter((t) => t.deadline && t.status !== 'done');
  const today = withDeadlines.filter((t) => isDueToday(t.deadline));
  const upcoming = withDeadlines.filter(
    (t) => !isDueToday(t.deadline) && !isOverdue(t.deadline),
  ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const sections: Section[] = [];
  if (overdueTasks.length > 0) {
    sections.push({ title: 'Overdue', accent: Colors.danger, data: overdueTasks });
  }
  if (today.length > 0) {
    sections.push({ title: 'Due Today', accent: Colors.warning, data: today });
  }
  if (upcoming.length > 0) {
    sections.push({ title: 'Upcoming', accent: Colors.primary, data: upcoming });
  }

  const totalCount = overdueTasks.length + today.length + upcoming.length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Deadlines"
        subtitle={totalCount > 0 ? `${totalCount} with deadlines` : 'Nothing due!'}
      />

      {isLoading && tasks.length === 0 ? (
        <View>
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </View>
      ) : sections.length === 0 ? (
        <EmptyState
          icon="alarm-outline"
          title="No deadlines"
          subtitle="Tasks with due dates will appear here"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, section }) => (
            <DeadlineCard task={item} accent={(section as Section).accent} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionAccentBar, { backgroundColor: (section as Section).accent }]} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={[styles.sectionCount, { color: (section as Section).accent }]}>
                {section.data.length}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
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

function DeadlineCard({ task, accent }: { task: Task; accent: string }) {
  const days = task.deadline ? daysUntil(task.deadline) : null;
  const overdue = task.deadline ? isOverdue(task.deadline) : false;
  const dateLabel = task.deadline ? formatDeadline(task.deadline) : '';

  let urgencyLabel = '';
  if (overdue) urgencyLabel = `${Math.abs(days!)}d overdue`;
  else if (days === 0) urgencyLabel = 'Due today';
  else if (days === 1) urgencyLabel = 'Due tomorrow';
  else if (days !== null) urgencyLabel = `${days}d left`;

  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{task.title}</Text>
        <View style={styles.cardMeta}>
          <PriorityBadge priority={task.priority} />
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={accent} />
            <Text style={[styles.dateText, { color: accent }]}>{dateLabel}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.urgencyBadge, { backgroundColor: accent + '22', borderColor: accent }]}>
        <Text style={[styles.urgencyText, { color: accent }]}>{urgencyLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  list: {
    paddingTop: Spacing.sm,
    paddingBottom: 100,
    paddingHorizontal: Spacing.screen,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionAccentBar: { width: 3, height: 16, borderRadius: 2 },
  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCount: { fontSize: 13, fontWeight: '700' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardContent: { flex: 1, gap: Spacing.xs },
  cardTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, lineHeight: 21 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, fontWeight: '600' },
  urgencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  urgencyText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
