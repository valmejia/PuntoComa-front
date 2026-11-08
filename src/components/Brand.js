import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

/** Marca de Punto&Coma: el "&" blanco sobre el cuadro morado del logo. */
export function BrandMark({ size = 72 }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.24 }]}>
      <Text style={[styles.amp, { fontFamily: fonts.regular, fontSize: size * 0.62, lineHeight: size * 0.8 }]}>&amp;</Text>
    </View>
  );
}

export function Brand({ size = 72, subtitle }) {
  return (
    <View style={styles.wrap}>
      <BrandMark size={size} />
      <Text style={styles.name}>Punto<Text style={styles.nameAmp}>&amp;</Text>Coma</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  mark: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  amp: { color: colors.white, fontFamily: 'serif', fontWeight: '700' },
  name: { fontSize: 28, fontFamily: fonts.title, color: colors.primary, marginTop: 4 },
  nameAmp: { fontFamily: 'serif', color: colors.accent },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
