import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

/** Título serif + subtítulo, como "Control de Circulación" en el Figma. */
export function ScreenTitle({ title, subtitle, right }) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/** Encabezado de sección: "Top autores ........ Ver todos". */
export function SectionHeader({ title, action, onAction, accent }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
        {accent ? <View style={styles.dot} /> : null}
      </View>
      {action ? (
        <Text style={styles.action} onPress={onAction} accessibilityRole="button" suppressHighlighting>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.title, fontSize: 24, color: colors.primary },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontFamily: fonts.title, fontSize: 19, color: colors.text },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.amber },
  action: { fontFamily: fonts.semibold, fontSize: 13, color: colors.secondary },
});
