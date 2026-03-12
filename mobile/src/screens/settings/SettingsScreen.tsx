import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import ScreenHeader from '../../components/common/ScreenHeader';

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, value, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.danger : Colors.textSecondary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && !danger && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.displayName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.displayName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.levelChip}>
                <Text style={styles.levelChipText}>Lv.{user.level} · {user.xp.toLocaleString()} XP</Text>
              </View>
            </View>
          </View>
        )}

        {/* Preferences */}
        <Text style={styles.groupLabel}>Preferences</Text>
        <View style={styles.group}>
          <SettingRow icon="notifications-outline" label="Notifications" onPress={() => {}} />
          <SettingRow icon="moon-outline" label="Theme" value="Dark" />
          <SettingRow icon="language-outline" label="Language" value="English" />
        </View>

        {/* Account */}
        <Text style={styles.groupLabel}>Account</Text>
        <View style={styles.group}>
          <SettingRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
          <SettingRow icon="lock-closed-outline" label="Change Password" onPress={() => {}} />
        </View>

        {/* About */}
        <Text style={styles.groupLabel}>About</Text>
        <View style={styles.group}>
          <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" />
          <SettingRow icon="document-text-outline" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="shield-checkmark-outline" label="Terms of Service" onPress={() => {}} />
        </View>

        {/* Danger zone */}
        <View style={[styles.group, { marginTop: Spacing.base }]}>
          <SettingRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.screen, paddingBottom: 100 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryDim,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  levelChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  levelChipText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginTop: Spacing.base,
  },
  group: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: Colors.dangerDim },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  rowLabelDanger: { color: Colors.danger },
  rowValue: { fontSize: 14, color: Colors.textMuted },
});
