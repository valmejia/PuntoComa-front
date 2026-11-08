import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/colors';

const TONOS = {
  neutral: { bg: colors.lilacStrong, fg: colors.primary },
  success: { bg: colors.successLight, fg: colors.success },
  warning: { bg: colors.amberLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
};

/** Pill de estado/categoría ("Físico en mano", "A tiempo", "Vencido"). */
export function Badge({ label, tone = 'neutral', icon }) {
  const t = TONOS[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon ? <Ionicons name={icon} size={11} color={t.fg} /> : null}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

/** Texto de estado con punto de color: "● Disponible (3 ejempl.)". */
export function StatusDot({ label, tone = 'success' }) {
  const color = tone === 'success' ? colors.success : tone === 'warning' ? colors.amber : colors.danger;
  return (
    <View style={styles.dotRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.dotText, { color: tone === 'warning' ? colors.warning : color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export const tonoEstadoLibro = (estado) =>
  estado === 'DISPONIBLE' ? 'success' : estado === 'PRESTADO' ? 'warning' : 'danger';

export const tonoEstadoPrestamo = (estado) =>
  estado === 'ACTIVO' ? 'success' : estado === 'VENCIDO' ? 'danger' : 'neutral';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  text: { fontFamily: fonts.semibold, fontSize: 11 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotText: { fontFamily: fonts.semibold, fontSize: 12, flexShrink: 1 },
});
