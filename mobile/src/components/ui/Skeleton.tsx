import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: Colors.bgInput },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function TaskSkeleton() {
  return (
    <View style={skeletonStyles.taskRow}>
      <Skeleton width={20} height={20} borderRadius={Radius.full} />
      <View style={skeletonStyles.taskBody}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function HabitSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Skeleton width="50%" height={16} />
        <Skeleton width={60} height={24} borderRadius={Radius.full} />
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={32} height={32} borderRadius={Radius.sm} />
        ))}
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  taskBody: { flex: 1 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.sm,
  },
});
