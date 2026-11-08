import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme/colors';

/** Chip de filtro (relleno lila; seleccionado morado). `count` muestra una burbuja ámbar. */
export function Chip({ label, selected, onPress, icon, count }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count != null ? `${label} (${count})` : label}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? colors.white : colors.primary} /> : null}
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
      {count != null ? (
        <View style={[styles.count, selected && styles.countSelected]}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Selector segmentado: pista lila con la opción activa en blanco ("Lector | Vendedor / Admin"). */
export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, sel && styles.segmentSelected]}
          >
            {o.icon ? <Ionicons name={o.icon} size={15} color={sel ? colors.primary : colors.textMuted} /> : null}
            <Text style={[styles.segmentText, sel && styles.segmentTextSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, minHeight: 36,
    borderRadius: radius.pill, backgroundColor: colors.lilacStrong,
  },
  selected: { backgroundColor: colors.primary },
  text: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  textSelected: { color: colors.white },
  count: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  countSelected: { backgroundColor: colors.amber },
  countText: { fontFamily: fonts.bold, fontSize: 10, color: colors.text },
  segmented: { flexDirection: 'row', backgroundColor: colors.lilacStrong, borderRadius: radius.pill, padding: 4, gap: 4 },
  segment: {
    flex: 1, minHeight: 42, flexDirection: 'row', gap: 6,
    alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: 8,
  },
  segmentSelected: { backgroundColor: colors.surface, ...shadow },
  segmentText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  segmentTextSelected: { color: colors.primary, fontFamily: fonts.bold },
});
