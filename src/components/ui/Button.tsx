import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  const { colors, radius, spacing } = useTheme();

  const base: ViewStyle = {
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[16],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    opacity: disabled ? 0.5 : 1,
  };

  const variants: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.primary, borderColor: colors.primary },
    secondary: { backgroundColor: colors.surface, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger },
  };

  const textColor =
    variant === 'secondary' || variant === 'ghost' ? colors.text : '#FFFFFF';

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[base, variants[variant], style]}>
      <Text style={{ color: textColor }} variant="h2">{title}</Text>
    </Pressable>
  );
}
