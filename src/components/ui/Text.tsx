import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type TypographyVariant = keyof typeof import('../../theme/tokens').typography;

type Props = RNTextProps & {
  variant?: TypographyVariant;
};

export function Text({ variant = 'body', style, ...rest }: Props) {
  const { colors, typography: typo } = useTheme();
  const typoStyle = typo[variant];
  return (
    <RNText
      {...rest}
      style={[
        { color: colors.text },
        typoStyle,
        style,
      ]}
    />
  );
}
