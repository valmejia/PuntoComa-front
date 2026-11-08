import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, fonts } from '../theme/colors';
import { Button } from './Button';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({ icon = 'book-outline', title, message, action }) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={48} color={colors.border} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action}
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
      <Text style={styles.title}>Algo salió mal</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Reintentar" variant="outline" small onPress={onRetry} /> : null}
    </View>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm, minHeight: 240 },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  message: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.dangerLight,
  },
  bannerText: { fontFamily: fonts.regular, flex: 1, color: colors.danger, fontSize: 14 },
});
