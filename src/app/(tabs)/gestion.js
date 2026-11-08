import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { prestamosApi } from '../../api/services';
import { Chip } from '../../components/Chip';
import { LoanCard } from '../../components/LoanCard';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useDevolucion } from '../../hooks/useDevolucion';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, spacing } from '../../theme/colors';

const FILTROS = [{ v: null, l: 'Todos' }, { v: 'ACTIVO', l: 'Activos' }, { v: 'DEVUELTO', l: 'Devueltos' }];

/** VENDEDOR / ADMIN: todos los préstamos del sistema y registro de devoluciones. */
export default function GestionScreen() {
  const { esStaff } = useAuth();
  if (!esStaff) return <Redirect href="/" />;
  return <GestionPrestamos />;
}

function GestionPrestamos() {
  const router = useRouter();
  const [estado, setEstado] = useState(null);
  const lista = useRecurso(() => prestamosApi.todos(estado), [estado]);
  const { devolver, devolviendoId } = useDevolucion(() => lista.recargar());

  const vencidos = (lista.datos ?? []).filter((p) => p.estado === 'VENCIDO').length;

  let vacio;
  if (lista.cargando) vacio = <Loading />;
  else if (lista.error && !lista.datos) vacio = <ErrorState message={lista.error} onRetry={lista.recargar} />;
  else vacio = <EmptyState icon="clipboard-outline" title="Sin préstamos" message="No hay préstamos con este filtro." />;

  return (
    <FlatList
      data={lista.cargando || (lista.error && !lista.datos) ? [] : lista.datos ?? []}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <LoanCard prestamo={item} mostrarUsuario onDevolver={() => devolver(item)} devolviendo={devolviendoId === item.id}
          onPressLibro={() => router.push(`/libro/${item.libro.id}`)} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.chips}>
            {FILTROS.map((f) => <Chip key={f.l} label={f.l} selected={estado === f.v} onPress={() => setEstado(f.v)} />)}
          </View>
          {vencidos > 0 ? <Text style={styles.vencidos}>{vencidos} préstamo(s) vencido(s)</Text> : null}
        </View>
      }
      ListEmptyComponent={vacio}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={<RefreshControl refreshing={lista.refrescando} onRefresh={lista.refrescar} colors={[colors.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  vencidos: { color: colors.danger, fontFamily: fonts.bold },
});
