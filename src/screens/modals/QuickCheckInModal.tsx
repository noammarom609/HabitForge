import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';

const ENERGY_LEVELS = ['נמוך', 'בינוני', 'גבוה'];
const LOAD_LEVELS = ['קל', 'בינוני', 'כבד'];

export function QuickCheckInModal() {
  const { colors } = useTheme();
  const [energy, setEnergy] = useState<string | null>(null);
  const [load, setLoad] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="title" style={{ color: colors.text, marginBottom: 8 }}>צ'ק-אין מהיר</Text>
      <Text variant="body" style={{ color: colors.textSecondary, marginBottom: 16 }}>מצב היום</Text>

      <Text variant="caption" style={{ color: colors.textTertiary, marginBottom: 8 }}>אנרגיה</Text>
      <View style={styles.chips}>
        {ENERGY_LEVELS.map((e) => (
          <Chip key={e} label={e} selected={energy === e} onPress={() => setEnergy(e)} />
        ))}
      </View>

      <Text variant="caption" style={{ color: colors.textTertiary, marginTop: 16, marginBottom: 8 }}>עומס</Text>
      <View style={styles.chips}>
        {LOAD_LEVELS.map((l) => (
          <Chip key={l} label={l} selected={load === l} onPress={() => setLoad(l)} />
        ))}
      </View>

      <Button title="שמור" onPress={() => {}} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { marginTop: 24 },
});
