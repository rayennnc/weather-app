import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';
import type { Place } from '../../../shared/types/place';
import {
  type MyLocationState,
  useLocationsViewModel,
} from '../hooks/useLocationsViewModel';

type Props = {
  // opens the search, so the navigator decides where "add" goes
  onAddPress: () => void;
  // called after another place became active, so the navigator can close this screen
  onLocationSelected: () => void;
};

export function LocationsScreen({ onAddPress, onLocationSelected }: Props) {
  const t = useT();
  const {
    locations,
    canRemove,
    selectLocation,
    removeLocation,
    myLocation,
    locateMe,
    openSettings,
  } = useLocationsViewModel();
  const isLocating = myLocation.status === 'locating';

  function handleSelect(id: Place['id']) {
    selectLocation(id);
    onLocationSelected();
  }

  async function handleLocateMe() {
    if (await locateMe()) {
      onLocationSelected();
    }
  }

  return (
    // the navigator draws the header, so only the bottom needs a safe area
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: isLocating, disabled: isLocating }}
          disabled={isLocating}
          onPress={handleLocateMe}
          style={[styles.primaryButton, isLocating && styles.busy]}
        >
          {isLocating ? <ActivityIndicator color={colors.onAccent} /> : null}
          <Text style={styles.primaryButtonText}>
            {isLocating
              ? t('locations.locating')
              : t('locations.useMyLocation')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onAddPress}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>{t('locations.add')}</Text>
        </Pressable>
        <MyLocationMessage
          myLocation={myLocation}
          onOpenSettings={openSettings}
        />
      </View>
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

type MessageProps = {
  myLocation: MyLocationState;
  onOpenSettings: () => void;
};

// why "use my location" did not work, and what to do next
function MyLocationMessage({ myLocation, onOpenSettings }: MessageProps) {
  const t = useT();

  if (myLocation.status === 'idle' || myLocation.status === 'locating') {
    return null;
  }

  return (
    // a live region, so a screen reader says it when it appears
    <View accessibilityLiveRegion="polite" style={styles.message}>
      <Text style={styles.messageText}>{myLocation.message}</Text>
      {myLocation.status === 'blocked' ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsButtonText}>
            {t('locations.openSettings')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12,
  },
  actions: {
    gap: 8,
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  busy: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    gap: 4,
    paddingHorizontal: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  settingsButtonText: {
    color: colors.accent,
    fontSize: 15,
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
