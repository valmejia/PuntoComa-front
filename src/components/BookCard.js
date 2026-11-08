import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme/colors';
import { admitePrestamo, admiteVenta, FORMATOS, moneda } from '../utils/format';
import { StatusDot } from './Badge';
import { BookCover } from './BookCover';

/** Estado legible con color, según stock y formato. */
export function estadoLibro(libro) {
  if (libro.stock > 0) {
    const unidad = libro.formato === 'DIGITAL' ? 'licencia' : 'ejempl.';
    const plural = libro.formato === 'DIGITAL' && libro.stock !== 1 ? 'licencias' : unidad;
    return { label: `Disponible (${libro.stock} ${plural})`, tone: 'success' };
  }
  if (libro.estado === 'PRESTADO') return { label: 'Todos prestados', tone: 'warning' };
  return { label: 'Agotado', tone: 'danger' };
}

/** Texto de precio del Figma: "$18.50 / Préstamo", "Préstamo gratis". */
function precioTexto(libro) {
  if (admiteVenta(libro) && libro.precio != null) return moneda(libro.precio);
  return 'Préstamo';
}

/** Tarjeta de "Recomendados para ti" / resultados del catálogo. */
/** propio: el libro lo publicó la persona actual (no puede pedírselo a sí misma). */
export function BookCard({ libro, onPress, extra, propio = false }) {
  const estado = estadoLibro(libro);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.coverWrap}>
        <BookCover libro={libro} width={78} height={112} />
      </View>
      <View style={styles.info}>
        <StatusDot label={estado.label} tone={estado.tone} />
        <Text style={styles.title} numberOfLines={2}>{libro.titulo}</Text>
        <Text style={styles.author} numberOfLines={1}>{libro.autor}</Text>
        <Text style={styles.meta} numberOfLines={1}>{FORMATOS[libro.formato]} · {libro.genero}</Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.price}>{precioTexto(libro)}</Text>
            {admiteVenta(libro) && admitePrestamo(libro) ? <Text style={styles.priceSub}>o préstamo</Text> : null}
            {!admiteVenta(libro) ? <Text style={styles.priceSub}>sin costo</Text> : null}
          </View>
          <View style={styles.ver}>
            <Text style={styles.verText}>{!propio && admitePrestamo(libro) && libro.stock > 0 ? 'Pedir' : 'Ver'}</Text>
          </View>
        </View>
        {extra}
      </View>
    </Pressable>
  );
}

/** Portada vertical del carrusel "Agregados recientemente". */
export function BookTile({ libro, onPress }) {
  const estado = estadoLibro(libro);
  const linea = libro.stock === 0
    ? estado.label
    : libro.formato === 'DIGITAL' ? 'Descarga inmediata' : admitePrestamo(libro) ? 'Préstamo disponible' : 'A la venta';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${libro.titulo}, de ${libro.autor}`} style={styles.tile}>
      <View>
        <BookCover libro={libro} width={118} height={168} />
        <Text style={styles.tileTag}>{libro.formato === 'DIGITAL' ? 'eBook' : 'Físico'}</Text>
      </View>
      <Text style={styles.tileTitle} numberOfLines={1}>{libro.titulo}</Text>
      <Text style={styles.tileAuthor} numberOfLines={1}>{libro.autor}</Text>
      <Text style={[styles.tileEstado, { color: libro.stock === 0 ? colors.danger : libro.formato === 'DIGITAL' ? colors.secondary : colors.warning }]} numberOfLines={1}>
        {linea}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 14, padding: 14,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  pressed: { opacity: 0.9 },
  coverWrap: { borderRadius: 8, ...shadow, shadowOpacity: 0.15 },
  info: { flex: 1, gap: 3 },
  flex: { flex: 1 },
  title: { fontFamily: fonts.title, fontSize: 17, color: colors.text, marginTop: 2 },
  author: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 'auto', paddingTop: 6, gap: 8 },
  price: { fontFamily: fonts.bold, fontSize: 17, color: colors.primary },
  priceSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  ver: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  verText: { fontFamily: fonts.bold, fontSize: 13, color: colors.white },
  tile: { width: 118, gap: 2 },
  tileTag: {
    position: 'absolute', left: 6, bottom: 6, fontFamily: fonts.semibold, fontSize: 10, color: colors.primary,
    backgroundColor: colors.surface, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden',
  },
  tileTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginTop: 6 },
  tileAuthor: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  tileEstado: { fontFamily: fonts.semibold, fontSize: 11 },
});
