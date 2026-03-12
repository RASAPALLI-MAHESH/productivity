import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { extractApiError } from '../../utils/error';
import { authApi } from '../../api/auth';
import type { AuthStackParamList } from '../../types';

type RouteType = RouteProp<AuthStackParamList, 'OtpVerify'>;
type Nav = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;

const OTP_LENGTH = 6;

export default function OtpVerifyScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<Nav>();
  const { verifyOtp, verifyResetOtp, isLoading } = useAuthStore();

  const { email, maskedEmail, mode } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(300);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function handleChange(value: string, index: number) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;
    setError('');
    try {
      if (mode === 'signup') {
        await verifyOtp(email, code);
        // RootNavigator will redirect to App automatically
      } else {
        const resetToken = await verifyResetOtp(email, code);
        navigation.navigate('ResetPassword', { resetToken, email });
      }
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  async function handleResend() {
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(300);
    setError('');
    await authApi.resendOtp(email);
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const full = otp.join('').length === OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headline}>Verify your email</Text>
        <Text style={styles.sub}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.email}>{maskedEmail}</Text>
        </Text>

        {/* OTP inputs */}
        <View style={styles.otpRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputRefs.current[i] = ref)}
              style={[styles.otpBox, otp[i] && styles.otpBoxFilled]}
              value={otp[i]}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
              keyboardAppearance="dark"
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Countdown */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Resend in {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendBtn}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          label="Verify"
          onPress={handleVerify}
          loading={isLoading}
          disabled={!full}
          fullWidth
          style={styles.verifyBtn}
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
  sub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xxl },
  email: { color: Colors.textPrimary, fontWeight: '600' },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryDim },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginBottom: Spacing.sm },
  resendRow: { alignItems: 'center', marginBottom: Spacing.xl },
  countdownText: { fontSize: 13, color: Colors.textMuted },
  resendBtn: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  verifyBtn: { marginTop: Spacing.sm },
});
