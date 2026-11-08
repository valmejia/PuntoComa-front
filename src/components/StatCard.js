import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme/colors';

const TONOS = {
  primary: { icon: colors.primary, iconBg: colors.lilacStrong, value: colors.text },
  amber: { icon: colors.amber, iconBg: colors.amberLight, value: colors.text },
  danger: { icon: colors.danger, iconBg: colors.dangerLight, value: colors.danger },
  success: { icon: colors.success, iconBg: colors.successLight, value: colors.text },
};

/** Tarjeta de indicador: ícono, valor grande en serif y etiqueta. `tag` es la pill de la esquina ("Hoy", "Total"). */
export function StatCard({ icon, value, label, tone = 'primary', tag, style }) {
  const t = TONOS[tone];
  return (
    <View style={[styles.card, style]} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: t.iconBg }]}>
          <Ionicons name={icon} size={16} color={t.icon} />
        </View>
        {tag ? <Text style={[styles.tag, tone === 'amber' && styles.tagAmber]}>{tag}</Text> : null}
      </View>
      <Text style={[styles.value, { color: t.value }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={[styles.label, tone === 'danger' && { color: colors.danger }]} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, minWidth: 0, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, gap: 4,
    borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tag: {
    fontFamily: fonts.semibold, fontSize: 10, color: colors.primary, backgroundColor: colors.lilacStrong,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden',
  },
  tagAmber: { color: colors.warning, backgroundColor: colors.amberLight },
  value: { fontFamily: fonts.title, fontSize: 22, marginTop: 4, fontVariant: ['lining-nums'] },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
