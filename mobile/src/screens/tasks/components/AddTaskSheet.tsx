import React, { useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type BottomSheetType from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import Button from '../../../components/ui/Button';
import type { TaskPriority, CreateTaskPayload } from '../../../types';

interface AddTaskSheetProps {
  sheetRef: React.RefObject<BottomSheetType>;
  onAdd: (payload: CreateTaskPayload) => void;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export default function AddTaskSheet({ sheetRef, onAdd }: AddTaskSheetProps) {
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const snapPoints = useMemo(() => ['45%'], []);

  const handleAdd = useCallback(() => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority });
    setTitle('');
    setPriority('medium');
    sheetRef.current?.close();
  }, [title, priority, onAdd, sheetRef]);

  const renderBackdrop = useCallback(
    (props: object) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.sheetTitle}>New Task</Text>

        <TextInput
          style={styles.titleInput}
          placeholder="Task title..."
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          selectionColor={Colors.primary}
          keyboardAppearance="dark"
          multiline
        />

        <View style={styles.priorityRow}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityOptions}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityBtn,
                  priority === p && styles.priorityBtnActive,
                ]}
              >
                <PriorityBadge priority={p} showLabel />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          label="Add Task"
          onPress={handleAdd}
          fullWidth
          disabled={!title.trim()}
          style={styles.addBtn}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: { backgroundColor: Colors.border, width: 36 },
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxxl : Spacing.xl,
    gap: Spacing.base,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  titleInput: {
    fontSize: 17,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    lineHeight: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  priorityRow: { gap: Spacing.sm },
  priorityOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  priorityBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  priorityBtnActive: {
    borderColor: Colors.borderFocus,
    backgroundColor: Colors.primaryDim,
  },
  addBtn: { marginTop: Spacing.xs },
});
