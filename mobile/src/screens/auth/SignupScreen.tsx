import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { signup, isLoading } = useAuthStore();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSignup() {
    const e = validate();
    if (Object.keys(e).length > 0) return setErrors(e);
    try {
      const { maskedEmail, expiresInSeconds } = await signup(
        form.email.trim().toLowerCase(),
        form.password,
        form.name.trim(),
      );
      navigation.navigate('OtpVerify', {
        email: form.email.trim().toLowerCase(),
        maskedEmail,
        mode: 'signup',
      });
    } catch (err) {
      setErrors({ general: extractApiError(err) });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headline}>Create account</Text>
        <Text style={styles.sub}>Start building better habits and hitting goals.</Text>

        <View style={styles.form}>
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Full Name"
            placeholder="Alex Johnson"
            leftIcon="person-outline"
            autoCapitalize="words"
            value={form.name}
            onChangeText={(v) => set('name', v)}
            error={errors.name}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            value={form.email}
            onChangeText={(v) => set('email', v)}
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="Min. 8 characters"
            secureTextEntry
            leftIcon="lock-closed-outline"
            value={form.password}
            onChangeText={(v) => set('password', v)}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            secureTextEntry
            leftIcon="lock-closed-outline"
            value={form.confirm}
            onChangeText={(v) => set('confirm', v)}
            error={errors.confirm}
          />

          <Button
            label="Create Account"
            onPress={handleSignup}
            loading={isLoading}
            fullWidth
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: Spacing.screen, paddingTop: Spacing.xxxl + Spacing.xl },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  sub: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.xxxl },
  form: { gap: Spacing.base },
  errorBanner: {
    backgroundColor: Colors.dangerDim,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorBannerText: { color: Colors.danger, fontSize: 14, fontWeight: '500' },
  submitBtn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  footerLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
