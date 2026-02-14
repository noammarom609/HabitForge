import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Card({ style, ...rest }: ViewProps) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing[16],
        },
        style,
      ]}
    />
  );
}
