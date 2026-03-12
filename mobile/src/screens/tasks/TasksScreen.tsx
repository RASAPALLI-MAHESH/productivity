import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  SectionList,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type BottomSheetType from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useTaskStore } from '../../store/taskStore';
import TaskItem from './components/TaskItem';
import AddTaskSheet from './components/AddTaskSheet';
import FAB from '../../components/ui/FAB';
import EmptyState from '../../components/common/EmptyState';
import { TaskSkeleton } from '../../components/ui/Skeleton';
import ScreenHeader from '../../components/common/ScreenHeader';
import type { Task, TaskStackParamList, CreateTaskPayload } from '../../types';

type Nav = NativeStackNavigationProp<TaskStackParamList, 'TaskList'>;

interface Section {
  title: string;
  data: Task[];
}

export default function TasksScreen() {
  const navigation = useNavigation<Nav>();
  const addSheetRef = useRef<BottomSheetType>(null);
  const { tasks, isLoading, isRefreshing, fetchTasks, fetchTodayTasks, fetchOverdueTasks, refresh, completeTask, deleteTask, createTask, todayTasks, overdueTasks } =
    useTaskStore();

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = useCallback(
    async (payload: CreateTaskPayload) => {
      await createTask(payload);
    },
    [createTask],
  );

  const sections: Section[] = [];
  if (overdueTasks.length > 0) {
    sections.push({ title: '⚠ Overdue', data: overdueTasks });
  }
  if (todayTasks.length > 0) {
    sections.push({ title: 'Today', data: todayTasks });
  }
  const others = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      !todayTasks.find((x) => x.id === t.id) &&
      !overdueTasks.find((x) => x.id === t.id),
  );
  if (others.length > 0) {
    sections.push({ title: 'Upcoming', data: others });
  }

  const totalPending = tasks.filter((t) => t.status !== 'done').length;

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScreenHeader
        title="Tasks"
        subtitle={totalPending > 0 ? `${totalPending} pending` : 'All clear!'}
      />

      {isLoading && tasks.length === 0 ? (
        <View>
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </View>
      ) : sections.length === 0 ? (
        <EmptyState
          icon="checkmark-circle-outline"
          title="No tasks yet"
          subtitle="Tap + to add your first task"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onComplete={completeTask}
              onDelete={deleteTask}
              onPress={(id) => navigation.navigate('TaskDetail', { taskId: id })}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          stickySectionHeadersEnabled={false}
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

      <FAB onPress={() => addSheetRef.current?.expand()} />

      <AddTaskSheet sheetRef={addSheetRef} onAdd={handleAdd} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  list: {
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
