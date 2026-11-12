import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';
import type { UnitOption } from '../hooks/useSettingsViewModel';

type Props<Value extends string> = {
  // names the group for a screen reader, e.g. "Temperature"
  label: string;
  options: UnitOption<Value>[];
  onSelect: (value: Value) => void;
};

// choices side by side, exactly one of them selected
export function SegmentedControl<Value extends string>({
  label,
  options,
  onSelect,
}: Props<Value>) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      style={styles.container}
    >
      {options.map(option => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{ checked: option.isSelected }}
          onPress={() => onSelect(option.value)}
          style={[styles.segment, option.isSelected && styles.selected]}
        >
          <Text style={[styles.text, option.isSelected && styles.selectedText]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selected: {
    backgroundColor: colors.accent,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedText: {
    color: colors.onAccent,
  },
});
