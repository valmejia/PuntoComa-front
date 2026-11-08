import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { librosApi, prestamosApi } from '../../api/services';
import { Badge, tonoEstadoLibro } from '../../components/Badge';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/Button';
import { ScreenTitle } from '../../components/ScreenTitle';
import { StatCard } from '../../components/StatCard';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';
import { admiteVenta, ESTADOS_LIBRO, FORMATOS, moneda, TIPOS } from '../../utils/format';

/** HU-04: libros que publiqué (estilo "Gestión de Inventario" del Figma). */
export default function MisLibrosScreen() {
  const router = useRouter();
  const datos = useRecurso(async () => {
    const [libros, recibidos] = await Promise.all([librosApi.mios(), prestamosApi.recibidos()]);
    return { libros, prestados: recibidos.filter((p) => p.estado !== 'DEVUELTO').length };
  }, []);
  const publicar = () => router.push('/publicar');

  if (datos.cargando) return <Loading />;
  if (datos.error && !datos.datos) return <ErrorState message={datos.error} onRetry={datos.recargar} />;

  const { libros, prestados } = datos.datos;
  const ejemplares = libros.reduce((s, l) => s + l.stock, 0);

  const header = (
    <View style={styles.header}>
      <ScreenTitle
        title="Mi biblioteca"
        subtitle="Títulos que publicaste para venta o préstamo"
        right={libros.length ? <Button title="Añadir" icon="add" small onPress={publicar} accessibilityLabel="Añadir título" /> : null}
      />
      {libros.length ? (
        <View style={styles.stats}>
          <StatCard icon="library-outline" value={libros.length} label="Títulos" />
          <StatCard icon="layers-outline" value={ejemplares} label="Disponibles" tone="success" />
          <StatCard icon="swap-horizontal-outline" value={prestados} label="Prestados" tone="amber" />
        </View>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={libros}
      keyExtractor={(l) => String(l.id)}
      renderItem={({ item }) => <InventarioCard libro={item} onPress={() => router.push(`/libro/${item.id}`)} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyState
          icon="albums-outline"
          title="Aún no publicas libros"
          message="Publica un libro para venderlo o prestarlo a otros lectores."
          action={<Button title="Publicar mi primer libro" icon="add" onPress={publicar} />}
        />
      }
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={<RefreshControl refreshing={datos.refrescando} onRefresh={datos.refrescar} colors={[colors.primary]} />}
    />
  );
}

function InventarioCard({ libro, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <BookCover libro={libro} width={64} height={92} />
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.categoria} numberOfLines={1}>{libro.genero.toUpperCase()} · {FORMATOS[libro.formato].toUpperCase()}</Text>
          {admiteVenta(libro) && libro.precio != null ? <Text style={styles.precio}>{moneda(libro.precio)}</Text> : null}
        </View>
        <Text style={styles.titulo} numberOfLines={2}>{libro.titulo}</Text>
        <Text style={styles.autor} numberOfLines={1}>{libro.autor}{libro.isbn ? ` · ISBN ${libro.isbn}` : ''}</Text>
        <View style={styles.tags}>
          <Badge label={`Stock: ${libro.stock}`} icon="cube-outline" />
          <Badge label={TIPOS[libro.tipo]} />
          <Badge label={ESTADOS_LIBRO[libro.estado]} tone={tonoEstadoLibro(libro.estado)} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { gap: spacing.lg, marginBottom: spacing.md },
  stats: { flexDirection: 'row', gap: 10 },
  card: {
    flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  info: { flex: 1, gap: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  categoria: { flex: 1, fontFamily: fonts.bold, fontSize: 10, color: colors.secondary, letterSpacing: 0.5 },
  precio: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  titulo: { fontFamily: fonts.title, fontSize: 17, color: colors.text },
  autor: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
});
