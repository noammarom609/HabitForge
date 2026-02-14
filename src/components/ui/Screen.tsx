import React from 'react';
import { SafeAreaView, ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function Screen({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      {...rest}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    />
  );
}
