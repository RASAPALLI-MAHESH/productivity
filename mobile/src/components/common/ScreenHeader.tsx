import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: { icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void };
}

export default function ScreenHeader({ title, subtitle, showBack, rightAction }: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.center}>
          <Text style={[textStyles.title, { color: Colors.textPrimary }]}>{title}</Text>
          {subtitle && (
            <Text style={[textStyles.caption, { color: Colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.rightBtn}>
            <Ionicons name={rightAction.icon} size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightBtn} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backBtn: { width: 40 },
  center: { flex: 1, alignItems: 'center' },
  rightBtn: { width: 40, alignItems: 'flex-end' },
});
