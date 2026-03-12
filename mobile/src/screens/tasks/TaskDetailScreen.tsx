import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { useTaskStore } from '../../store/taskStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import PriorityBadge from '../../components/ui/PriorityBadge';
import Button from '../../components/ui/Button';
import { formatDeadline, isOverdue } from '../../utils/date';
import type { TaskStackParamList } from '../../types';

type RouteType = RouteProp<TaskStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen() {
  const { params } = useRoute<RouteType>();
  const navigation = useNavigation();
  const { selectedTask, isLoading, fetchTaskById, completeTask, deleteTask, updateTask } =
    useTaskStore();

  useEffect(() => {
    fetchTaskById(params.taskId);
  }, [params.taskId]);

  function handleComplete() {
    if (!selectedTask) return;
    completeTask(selectedTask.id);
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (selectedTask) {
            deleteTask(selectedTask.id);
            navigation.goBack();
          }
        },
      },
    ]);
  }

  if (!selectedTask) return null;

  const task = selectedTask;
  const deadline = task.deadline ? formatDeadline(task.deadline) : null;
  const overdue = task.deadline ? isOverdue(task.deadline) : false;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Task" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={[textStyles.headline, styles.title, task.status === 'done' && styles.doneTitle]}>
          {task.title}
        </Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} showLabel />
          {deadline && (
            <View style={styles.chip}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={overdue ? Colors.danger : Colors.textMuted}
              />
              <Text style={[styles.chipText, overdue && { color: Colors.danger }]}>
                {deadline}
              </Text>
            </View>
          )}
          <View style={styles.chip}>
            <Ionicons name="git-commit-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.chipText}>{task.status.replace('-', ' ')}</Text>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </Text>
            {task.subtasks.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.subtaskRow}
                onPress={() => {
                  const updated = task.subtasks!.map((s) =>
                    s.id === sub.id ? { ...s, completed: !s.completed } : s,
                  );
                  updateTask(task.id, { subtasks: updated });
                }}
              >
                <View style={[styles.subCheck, sub.completed && styles.subCheckDone]}>
                  {sub.completed && <Ionicons name="checkmark" size={10} color={Colors.white} />}
                </View>
                <Text style={[styles.subTitle, sub.completed && styles.subTitleDone]}>
                  {sub.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Extras */}
        {(task.estimatedMinutes || task.energyLevel) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Details</Text>
            <View style={styles.detailRow}>
              {task.estimatedMinutes && (
                <View style={styles.chip}>
                  <Ionicons name="timer-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.chipText}>{task.estimatedMinutes} min</Text>
                </View>
              )}
              {task.energyLevel && (
                <View style={styles.chip}>
                  <Ionicons name="flash-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.chipText}>{task.energyLevel} energy</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        {task.status !== 'done' && (
          <Button label="Mark Complete" onPress={handleComplete} fullWidth />
        )}
        <Button
          label="Delete"
          variant="danger"
          onPress={handleDelete}
          fullWidth
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  title: { color: Colors.textPrimary, marginBottom: Spacing.md },
  doneTitle: { textDecorationLine: 'line-through', color: Colors.textMuted },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  section: { marginBottom: Spacing.xl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  subCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCheckDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  subTitle: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  subTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  detailRow: { flexDirection: 'row', gap: Spacing.sm },
  actions: { padding: Spacing.base, paddingBottom: Spacing.xl },
});
