import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../../shared/i18n/useT';
import type { Place } from '../../../shared/types/place';
import { colors } from '../../../shared/theme/colors';
import {
  type SearchState,
  useSearchViewModel,
} from '../hooks/useSearchViewModel';

type Props = {
  // called after a place is picked, so the navigator can close this screen
  onPlaceSelected: () => void;
};

export function SearchScreen({ onPlaceSelected }: Props) {
  const t = useT();
  const { query, setQuery, state, selectPlace } = useSearchViewModel();

  function handleSelect(id: Place['id']) {
    selectPlace(id);
    onPlaceSelected();
  }

  return (
    // the navigator draws the header, so only the bottom needs a safe area
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <TextInput
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={styles.input}
        value={query}
      />
      <SearchResults state={state} onSelect={handleSelect} />
    </SafeAreaView>
  );
}

type ResultsProps = {
  state: SearchState;
  onSelect: (id: Place['id']) => void;
};

function SearchResults({ state, onSelect }: ResultsProps) {
  const t = useT();

  switch (state.status) {
    case 'idle':
      return <Text style={styles.message}>{state.hint}</Text>;
    case 'loading':
      return (
        <ActivityIndicator
          accessibilityLabel={t('search.loading')}
          color={colors.accent}
          style={styles.spinner}
        />
      );
    case 'error':
      return (
        <View style={styles.center}>
          <Text style={styles.message}>{state.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={state.retry}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{t('search.retry')}</Text>
          </Pressable>
        </View>
      );
    case 'empty':
      return <Text style={styles.message}>{state.message}</Text>;
    case 'success':
      return (
        <FlatList
          testID="search-results"
          data={state.results}
          keyExtractor={item => String(item.id)}
          // without this, the first tap on a result only closes the keyboard
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(item.id)}
              style={styles.row}
            >
              <Text style={styles.rowTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              ) : null}
            </Pressable>
          )}
        />
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: 12,
  },
  spinner: {
    paddingTop: 24,
  },
  center: {
    alignItems: 'center',
    paddingTop: 12,
    gap: 12,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
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
});
