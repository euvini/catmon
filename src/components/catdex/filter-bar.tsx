import { CatColors } from '@/constants/colors';
import { CatTemperament } from '@/types/domain';
import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterBarProps {
  selectedTemperament: CatTemperament | 'all';
  onSelectTemperament: (temperament: CatTemperament | 'all') => void;
}

export function FilterBar({ selectedTemperament, onSelectTemperament }: FilterBarProps) {
  const items: { key: CatTemperament | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos os Gatos' },
    { key: 'friendly', label: 'Dóceis' },
    { key: 'playful', label: 'Brincalhões' },
    { key: 'sleeper', label: 'Dorminhocos' },
    { key: 'shy', label: 'Tímidos' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item) => {
          const isSelected = selectedTemperament === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectTemperament(item.key);
              }}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: CatColors.primary,
    borderColor: CatColors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: CatColors.textMuted,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
