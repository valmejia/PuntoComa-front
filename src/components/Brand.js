import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

/** Logotipo del diseño: ";" blanco sobre el cuadro morado. */
export function LogoMark({ size = 60 }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.27 }]}>
      <Text style={[styles.semicolon, { fontSize: size * 0.53, marginTop: -size * 0.08 }]}>;</Text>
    </View>
  );
}

/** Logo pequeño con nombre, usado en el encabezado de la app. */
export function BrandInline() {
  return (
    <View style={styles.inline}>
      <LogoMark size={32} />
      <View>
        <Text style={styles.inlineName}>Punto&amp;Coma</Text>
        <Text style={styles.inlineSub}>LIBRERÍA &amp; BIBLIOTECA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  semicolon: { color: colors.white, fontWeight: 'bold' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineName: { fontFamily: fonts.title, fontSize: 15, color: colors.primary },
  inlineSub: { fontFamily: fonts.semibold, fontSize: 8, color: colors.secondary, letterSpacing: 0.5 },
});
