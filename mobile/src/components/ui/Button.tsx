import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.textInverse : Colors.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.dangerDim, borderWidth: 1, borderColor: Colors.danger },

  // Sizes
  size_sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, minHeight: 32 },
  size_md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, minHeight: 44 },
  size_lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minHeight: 52 },

  // Labels
  label: { fontWeight: '600' },
  label_primary: { color: Colors.textInverse },
  label_secondary: { color: Colors.textPrimary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: Colors.danger },

  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 17 },
});
