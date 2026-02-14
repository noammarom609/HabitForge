import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from './Text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  const { colors, radius, spacing } = useTheme();

  const style: ViewStyle = {
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[12],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: selected ? colors.primary : colors.border,
    backgroundColor: selected ? colors.primary : 'transparent',
  };

  return (
    <Pressable onPress={onPress} style={style}>
      <Text variant="caption" style={{ color: selected ? '#fff' : colors.textTertiary }}>
        {label}
      </Text>
    </Pressable>
  );
}
