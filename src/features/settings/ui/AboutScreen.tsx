import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
import { useAboutViewModel } from '../hooks/useAboutViewModel';

export function AboutScreen() {
  const { sources, openLink } = useAboutViewModel();
  const styles = useThemedStyles(createStyles);

  return (
    // the navigator draws the header, so only the bottom needs a safe area
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {sources.map(source => (
          <View key={source.id} style={styles.card}>
            <Text accessibilityRole="header" style={styles.title}>
              {source.title}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => openLink(source.creditUrl)}
              style={styles.link}
            >
              <Text style={styles.linkText}>{source.credit}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() => openLink(source.licenseUrl)}
              style={styles.link}
            >
              <Text style={styles.linkText}>{source.license}</Text>
            </Pressable>
            {source.note ? (
              <Text style={styles.note}>{source.note}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      padding: 16,
      gap: 16,
    },
    card: {
      padding: 16,
      gap: 4,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    link: {
      minHeight: 44,
      justifyContent: 'center',
    },
    linkText: {
      fontSize: 16,
      color: colors.accent,
      textDecorationLine: 'underline',
    },
    note: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}
