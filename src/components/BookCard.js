import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fonts } from '../theme/colors';
import { admiteVenta, ESTADOS_LIBRO, FORMATOS, moneda, TIPOS } from '../utils/format';
import { Badge, tonoEstadoLibro } from './Badge';
import { BookCover } from './BookCover';

export function BookCard({ libro, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <BookCover libro={libro} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{libro.titulo}</Text>
        <Text style={styles.author} numberOfLines={1}>{libro.autor}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {libro.genero} · {FORMATOS[libro.formato]} · {TIPOS[libro.tipo]}
        </Text>
        <View style={styles.row}>
          <Badge label={ESTADOS_LIBRO[libro.estado]} tone={tonoEstadoLibro(libro.estado)} />
          {admiteVenta(libro) && libro.precio != null ? <Text style={styles.price}>{moneda(libro.precio)}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  info: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  author: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 },
  price: { fontSize: 16, fontFamily: fonts.bold, color: colors.primary },
});
