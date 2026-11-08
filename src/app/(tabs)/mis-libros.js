import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { librosApi } from '../../api/services';
import { BookCard } from '../../components/BookCard';
import { Button } from '../../components/Button';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, spacing } from '../../theme/colors';

export default function MisLibrosScreen() {
  const router = useRouter();
  const libros = useRecurso(() => librosApi.mios(), []);
  const publicar = () => router.push('/publicar');

  if (libros.cargando) return <Loading />;
  if (libros.error && !libros.datos) return <ErrorState message={libros.error} onRetry={libros.recargar} />;

  return (
    <FlatList
      data={libros.datos}
      keyExtractor={(l) => String(l.id)}
      renderItem={({ item }) => <BookCard libro={item} onPress={() => router.push(`/libro/${item.id}`)} />}
      ListHeaderComponent={libros.datos.length ? <Button title="Publicar un libro" icon="add" onPress={publicar} /> : null}
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
      refreshControl={<RefreshControl refreshing={libros.refrescando} onRefresh={libros.refrescar} colors={[colors.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
});
