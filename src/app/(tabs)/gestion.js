import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { prestamosApi } from '../../api/services';
import { Chip } from '../../components/Chip';
import { CirculationCard } from '../../components/LoanCard';
import { ScreenTitle } from '../../components/ScreenTitle';
import { StatCard } from '../../components/StatCard';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useDevolucion } from '../../hooks/useDevolucion';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';
import { diasHasta, moneda } from '../../utils/format';

// Deben coincidir con app.prestamos.* del backend.
const PARAMETROS = [
  { label: 'Mora diaria', valor: '$10.00', sub: 'Por día de retraso' },
  { label: 'Plazo máximo', valor: '30 días', sub: '14 por defecto' },
  { label: 'Límite cupo', valor: '3 libros', sub: 'Simultáneos' },
];

/** VENDEDOR / ADMIN: "Control de Circulación" del Figma. */
export default function GestionScreen() {
  const { esStaff } = useAuth();
  if (!esStaff) return <Redirect href="/" />;
  return <ControlCirculacion />;
}

function ControlCirculacion() {
  const router = useRouter();
  const { esAdmin } = useAuth();
  const [filtro, setFiltro] = useState('vencidos');
  const lista = useRecurso(() => prestamosApi.todos(), []);
  const { devolver, devolviendoId } = useDevolucion(() => lista.recargar());

  const todos = lista.datos ?? [];
  const activos = todos.filter((p) => p.estado !== 'DEVUELTO');
  const vencidos = activos.filter((p) => p.estado === 'VENCIDO');
  const hoy = activos.filter((p) => p.estado === 'ACTIVO' && diasHasta(p.fechaDevolucionEsperada) === 0);
  const devueltos = todos.filter((p) => p.estado === 'DEVUELTO');
  // Multas: las cobradas en devoluciones más las que se están acumulando en préstamos vencidos.
  const multas = todos.reduce((s, p) => s + Number(p.multa || 0), 0);

  const FILTROS = [
    { v: 'vencidos', l: 'Vencidos / Mora', n: vencidos.length, datos: vencidos },
    { v: 'hoy', l: 'Retornos hoy', n: hoy.length, datos: hoy },
    { v: 'activos', l: 'Activos', n: activos.length, datos: activos },
    { v: 'devueltos', l: 'Devueltos', n: devueltos.length, datos: devueltos },
    { v: 'todos', l: 'Todos', n: todos.length, datos: todos },
  ];
  const actual = FILTROS.find((f) => f.v === filtro);

  const header = (
    <View style={styles.header}>
      <ScreenTitle title="Control de Circulación" subtitle="Gestión de préstamos activos, recepción de ejemplares y liquidación de moras." />
      <View style={styles.grid}>
        <StatCard icon="book-outline" tag="Total" value={activos.length} label="Préstamos activos" />
        <StatCard icon="calendar-outline" tag="Hoy" value={hoy.length} label="Retornos previstos" />
      </View>
      <View style={styles.grid}>
        <StatCard icon="warning-outline" tag="Críticos" tone={vencidos.length ? 'amber' : 'primary'} value={vencidos.length} label="Préstamos vencidos" />
        <StatCard icon="cash-outline" tag="Caja" value={moneda(multas)} label="Multas acumuladas" />
      </View>

      <Accion
        principal
        icon="add-circle-outline"
        titulo="Añadir título al catálogo"
        sub="Publica un libro para venta o préstamo"
        onPress={() => router.push('/publicar')}
      />
      {esAdmin ? (
        <Accion icon="people-outline" titulo="Usuarios y roles" sub="Asignar Vendedor / Admin y bloquear cuentas" onPress={() => router.push('/admin/usuarios')} />
      ) : null}

      <View style={styles.chips}>
        {FILTROS.map((f) => <Chip key={f.v} label={f.l} count={f.n} selected={filtro === f.v} onPress={() => setFiltro(f.v)} />)}
      </View>
    </View>
  );

  const footer = lista.datos ? (
    <View style={styles.params}>
      <View style={styles.paramsHeader}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        <Text style={styles.paramsTitulo}>Parámetros de Biblioteca</Text>
      </View>
      <Text style={styles.muted}>Reglas de préstamo vigentes para todos los lectores de Punto&amp;Coma.</Text>
      <View style={styles.grid}>
        {PARAMETROS.map((p) => (
          <View key={p.label} style={styles.param}>
            <Text style={styles.paramLabel}>{p.label}</Text>
            <Text style={styles.paramValor}>{p.valor}</Text>
            <Text style={styles.paramSub}>{p.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  ) : null;

  let vacio;
  if (lista.cargando) vacio = <Loading />;
  else if (lista.error && !lista.datos) vacio = <ErrorState message={lista.error} onRetry={lista.recargar} />;
  else vacio = <EmptyState icon="checkmark-done-outline" title="Nada pendiente" message="No hay préstamos con este filtro." />;

  return (
    <FlatList
      data={lista.cargando || (lista.error && !lista.datos) ? [] : actual.datos}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <CirculationCard prestamo={item} onRecibir={() => devolver(item)} recibiendo={devolviendoId === item.id}
          onPressLibro={() => router.push(`/libro/${item.libro.id}`)} />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={vacio}
      ListFooterComponent={footer}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={<RefreshControl refreshing={lista.refrescando} onRefresh={lista.refrescar} colors={[colors.primary]} />}
    />
  );
}

function Accion({ icon, titulo, sub, onPress, principal }) {
  const fg = principal ? colors.white : colors.primary;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={titulo}
      style={({ pressed }) => [styles.accion, principal ? styles.accionPrincipal : styles.accionSecundaria, pressed && { opacity: 0.9 }]}>
      <View style={[styles.accionIcon, principal && { backgroundColor: '#FFFFFF22' }]}>
        <Ionicons name={icon} size={20} color={fg} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.accionTitulo, { color: principal ? colors.white : colors.text }]}>{titulo}</Text>
        <Text style={[styles.accionSub, { color: principal ? '#FFFFFFB3' : colors.textMuted }]}>{sub}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  header: { gap: spacing.md, marginBottom: spacing.md },
  grid: { flexDirection: 'row', gap: 10 },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  accion: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 999, paddingVertical: 10, paddingLeft: 10, paddingRight: 18 },
  accionPrincipal: { backgroundColor: colors.primary, ...shadow, shadowOpacity: 0.25 },
  accionSecundaria: { backgroundColor: colors.lilacStrong },
  accionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  accionTitulo: { fontFamily: fonts.bold, fontSize: 14 },
  accionSub: { fontFamily: fonts.regular, fontSize: 11 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  params: { marginTop: spacing.xl, padding: 16, gap: 10, backgroundColor: colors.lilacStrong, borderRadius: radius.lg },
  paramsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paramsTitulo: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  param: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 4 },
  paramLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  paramValor: { fontVariant: ['lining-nums'], fontFamily: fonts.bold, fontSize: 15, color: colors.primary, marginVertical: 2 },
  paramSub: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, textAlign: 'center' },
});
