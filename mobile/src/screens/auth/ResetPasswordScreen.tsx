import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { extractApiError } from '../../utils/error';
import type { AuthStackParamList } from '../../types';

type RouteType = RouteProp<AuthStackParamList, 'ResetPassword'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteType>();
  const { resetPassword, isLoading } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});

  async function handleReset() {
    const e: typeof errors = {};
    if (password.length < 8) e.password = 'Minimum 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (Object.keys(e).length > 0) return setErrors(e);
    setErrors({});
    try {
      await resetPassword(params.resetToken, password);
      navigation.navigate('Login');
    } catch (err) {
      setErrors({ general: extractApiError(err) });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.headline}>New Password</Text>
        <Text style={styles.sub}>Choose a strong password for your account.</Text>

        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <Input
          label="New Password"
          placeholder="Min. 8 characters"
          secureTextEntry
          leftIcon="lock-closed-outline"
          value={password}
          onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          placeholder="Repeat new password"
          secureTextEntry
          leftIcon="lock-closed-outline"
          value={confirm}
          onChangeText={(v) => { setConfirm(v); setErrors((p) => ({ ...p, confirm: undefined })); }}
          error={errors.confirm}
          containerStyle={{ marginTop: Spacing.sm }}
        />

        <Button
          label="Reset Password"
          onPress={handleReset}
          loading={isLoading}
          disabled={!password || !confirm}
          fullWidth
          style={styles.btn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex: 1,
    padding: Spacing.screen,
    paddingTop: Spacing.xxxl + Spacing.base,
    gap: Spacing.base,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  errorBanner: {
    backgroundColor: Colors.dangerDim,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorBannerText: { color: Colors.danger, fontSize: 14, fontWeight: '500' },
  btn: { marginTop: Spacing.sm },
});
