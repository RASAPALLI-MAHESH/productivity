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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    return e;
  }

  async function handleLogin() {
    const e = validate();
    if (Object.keys(e).length > 0) return setErrors(e);
    setErrors({});
    try {
      await login(email.trim().toLowerCase(), password);
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
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <Text style={styles.brandMark}>P</Text>
          <Text style={styles.brandName}>Productiv</Text>
          <Text style={styles.brandTagline}>Get things done, relentlessly.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Your password"
            secureTextEntry
            autoComplete="current-password"
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
            error={errors.password}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.screen,
    paddingVertical: Spacing.xxxl,
  },
  brand: { alignItems: 'center', marginBottom: Spacing.xxxl },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 64,
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  form: { gap: Spacing.base },
  errorBanner: {
    backgroundColor: Colors.dangerDim,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorBannerText: { color: Colors.danger, fontSize: 14, fontWeight: '500' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -Spacing.xs },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  submitBtn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  footerLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
