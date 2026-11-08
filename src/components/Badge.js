import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, fonts } from '../theme/colors';

const TONOS = {
  neutral: { bg: colors.primaryLight, fg: colors.primary },
  success: { bg: colors.successLight, fg: colors.success },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
};

export function Badge({ label, tone = 'neutral' }) {
  const t = TONOS[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export const tonoEstadoLibro = (estado) =>
  estado === 'DISPONIBLE' ? 'success' : estado === 'PRESTADO' ? 'warning' : 'danger';

export const tonoEstadoPrestamo = (estado) =>
  estado === 'ACTIVO' ? 'success' : estado === 'VENCIDO' ? 'danger' : 'neutral';

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontFamily: fonts.bold },
});
