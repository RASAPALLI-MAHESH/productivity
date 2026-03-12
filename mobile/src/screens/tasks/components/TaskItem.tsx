import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import { formatDeadline, isOverdue } from '../../../utils/date';
import type { Task } from '../../../types';

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 72;

type GestureContext = { startX: number };

export default function TaskItem({ task, onComplete, onDelete, onPress }: TaskItemProps) {
  const translateX = useSharedValue(0);
  const isDone = task.status === 'done';

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      // Clamp: right swipe to +ACTION_WIDTH, left swipe to -ACTION_WIDTH
      translateX.value = Math.max(-ACTION_WIDTH, Math.min(ACTION_WIDTH, newX));
    },
    onEnd: (event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right → complete
        translateX.value = withTiming(ACTION_WIDTH);
        runOnJS(onComplete)(task.id);
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → delete
        translateX.value = withTiming(-ACTION_WIDTH);
        runOnJS(onDelete)(task.id);
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedRow = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deadline = task.deadline ? formatDeadline(task.deadline) : null;
  const overdue = task.deadline ? isOverdue(task.deadline) : false;

  return (
    <View style={styles.wrapper}>
      {/* Left action (complete) */}
      <View style={[styles.actionLeft, isDone && styles.actionLeftDone]}>
        <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
      </View>
      {/* Right action (delete) */}
      <View style={styles.actionRight}>
        <Ionicons name="trash" size={22} color={Colors.danger} />
      </View>

      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]}>
        <Animated.View style={[styles.row, animatedRow, isDone && styles.rowDone]}>
          <Pressable
            onPress={() => {
              if (!isDone) onComplete(task.id);
            }}
            style={styles.checkbox}
          >
            <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
              {isDone && <Ionicons name="checkmark" size={12} color={Colors.white} />}
            </View>
          </Pressable>

          <TouchableOpacity style={styles.content} onPress={() => onPress(task.id)}>
            <Text
              style={[styles.title, isDone && styles.titleDone]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <View style={styles.meta}>
              <PriorityBadge priority={task.priority} />
              {deadline && (
                <View style={styles.dateChip}>
                  <Ionicons name="calendar-outline" size={11} color={overdue ? Colors.danger : Colors.textMuted} />
                  <Text style={[styles.dateText, overdue && styles.dateOverdue]}>
                    {deadline}
                  </Text>
                </View>
              )}
              {task.subtasks && task.subtasks.length > 0 && (
                <View style={styles.subtaskChip}>
                  <Ionicons name="git-branch-outline" size={11} color={Colors.textMuted} />
                  <Text style={styles.subtaskCount}>
                    {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: Spacing.screen,
    marginBottom: 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  actionLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: Colors.successDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  actionLeftDone: { backgroundColor: Colors.bgInput },
  actionRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: Colors.dangerDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  rowDone: { opacity: 0.5 },
  checkbox: { padding: 2 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  content: { flex: 1, gap: Spacing.xs },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dateOverdue: { color: Colors.danger },
  subtaskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  subtaskCount: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
