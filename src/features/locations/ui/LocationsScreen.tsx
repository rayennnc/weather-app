import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';
import type { Place } from '../../../shared/types/place';
import { useLocationsViewModel } from '../hooks/useLocationsViewModel';

type Props = {
  // opens the search, so the navigator decides where "add" goes
  onAddPress: () => void;
  // called after another saved place became active, so the navigator can close this screen
  onLocationSelected: () => void;
};

export function LocationsScreen({ onAddPress, onLocationSelected }: Props) {
  const t = useT();
  const { locations, canRemove, selectLocation, removeLocation } =
    useLocationsViewModel();

  function handleSelect(id: Place['id']) {
    selectLocation(id);
    onLocationSelected();
  }

  return (
    // the navigator draws the header, so only the bottom needs a safe area
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={onAddPress}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>{t('locations.add')}</Text>
      </Pressable>
      <FlatList
        testID="locations-list"
        data={locations}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: item.isActive }}
              onPress={() => handleSelect(item.id)}
              style={styles.rowMain}
            >
              <Text style={styles.rowTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              ) : null}
              {item.isActive ? (
                <Text style={styles.activeLabel}>{t('locations.active')}</Text>
              ) : null}
            </Pressable>
            {canRemove ? (
              <Pressable
                accessibilityLabel={t('locations.removeLabel', {
                  name: item.title,
                })}
                accessibilityRole="button"
                onPress={() => removeLocation(item.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>{t('locations.remove')}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12,
  },
  addButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  rowMain: {
    flex: 1,
    padding: 16,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  removeButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  removeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
