import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { extractApiError } from '../../utils/error';
import type { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email.trim()) return setError('Email is required');
    setError('');
    try {
      const { maskedEmail } = await forgotPassword(email.trim().toLowerCase());
      navigation.navigate('OtpVerify', {
        email: email.trim().toLowerCase(),
        maskedEmail,
        mode: 'reset',
      });
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headline}>Reset Password</Text>
        <Text style={styles.sub}>
          Enter your email and we'll send a verification code to reset your password.
        </Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
          value={email}
          onChangeText={(v) => { setEmail(v); setError(''); }}
          error={error}
        />

        <Button
          label="Send Reset Code"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!email.trim()}
          fullWidth
          style={styles.btn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, padding: Spacing.screen, paddingTop: Spacing.xxxl + Spacing.base },
  backBtn: { marginBottom: Spacing.xl },
  backText: { fontSize: 15, color: Colors.primary, fontWeight: '500' },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  sub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
  btn: { marginTop: Spacing.lg },
});
