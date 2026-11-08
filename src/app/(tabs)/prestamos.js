import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { prestamosApi } from '../../api/services';
import { Button } from '../../components/Button';
import { Segmented } from '../../components/Chip';
import { LoanCard } from '../../components/LoanCard';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useDevolucion } from '../../hooks/useDevolucion';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, spacing } from '../../theme/colors';

/** Préstamos que pedí y préstamos de los libros que publiqué (donde registro devoluciones). */
export default function PrestamosScreen() {
  const router = useRouter();
  const [vista, setVista] = useState('mios');
  const lista = useRecurso(() => (vista === 'mios' ? prestamosApi.mios() : prestamosApi.recibidos()), [vista]);
  const { devolver, devolviendoId } = useDevolucion((actualizado) =>
    lista.setDatos((ds) => ds.map((p) => (p.id === actualizado.id ? actualizado : p))));

  const header = (
    <Segmented
      value={vista}
      onChange={setVista}
      options={[{ value: 'mios', label: 'Pedí prestado' }, { value: 'recibidos', label: 'Presté' }]}
    />
  );

  let vacio;
  if (lista.cargando) vacio = <Loading />;
  else if (lista.error && !lista.datos) vacio = <ErrorState message={lista.error} onRetry={lista.recargar} />;
  else if (vista === 'mios') {
    vacio = (
      <EmptyState icon="bookmark-outline" title="No tienes préstamos" message="Explora el catálogo y pide prestado un libro."
        action={<Button title="Ir al catálogo" variant="outline" small onPress={() => router.navigate('/')} />} />
    );
  } else {
    vacio = <EmptyState icon="people-outline" title="Nadie ha pedido tus libros" message="Aquí verás los préstamos de los libros que publicaste." />;
  }

  return (
    <FlatList
      data={lista.cargando || (lista.error && !lista.datos) ? [] : lista.datos ?? []}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <LoanCard
          prestamo={item}
          mostrarUsuario={vista === 'recibidos'}
          onDevolver={() => devolver(item)}
          devolviendo={devolviendoId === item.id}
          onPressLibro={() => router.push(`/libro/${item.libro.id}`)}
        />
      )}
      ListHeaderComponent={<View style={styles.header}>{header}</View>}
      ListEmptyComponent={vacio}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={<RefreshControl refreshing={lista.refrescando} onRefresh={lista.refrescar} colors={[colors.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { marginBottom: spacing.md },
});
