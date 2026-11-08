import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { prestamosApi } from '../../api/services';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { LoanCard } from '../../components/LoanCard';
import { ScreenTitle } from '../../components/ScreenTitle';
import { StatCard } from '../../components/StatCard';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useDevolucion } from '../../hooks/useDevolucion';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';
import { diasHasta, fecha, moneda } from '../../utils/format';

/** HU-05 / HU-14: mis préstamos y devoluciones (Figma "Préstamos y Devoluciones"). */
export default function PrestamosScreen() {
  const router = useRouter();
  const [vista, setVista] = useState('curso');
  const datos = useRecurso(async () => {
    const [mios, recibidos] = await Promise.all([prestamosApi.mios(), prestamosApi.recibidos()]);
    return { mios, recibidos };
  }, []);
  const { devolver, devolviendoId } = useDevolucion(() => datos.recargar());

  const mios = datos.datos?.mios ?? [];
  const recibidos = datos.datos?.recibidos ?? [];
  const enCurso = mios.filter((p) => p.estado !== 'DEVUELTO');
  const historial = mios.filter((p) => p.estado === 'DEVUELTO');
  const prestadosActivos = recibidos.filter((p) => p.estado !== 'DEVUELTO');
  const porVencer = enCurso.filter((p) => p.estado === 'VENCIDO' || diasHasta(p.fechaDevolucionEsperada) <= 2);
  const multas = mios.reduce((s, p) => s + Number(p.multa || 0), 0);
  // El préstamo más urgente se destaca arriba, como en el Figma ("VENCE EN 48 HORAS").
  const urgente = [...porVencer].sort((a, b) => a.fechaDevolucionEsperada.localeCompare(b.fechaDevolucionEsperada))[0];

  const lista = vista === 'curso' ? enCurso : vista === 'historial' ? historial : recibidos;

  const header = (
    <View style={styles.header}>
      <ScreenTitle
        title="Mis préstamos"
        subtitle={enCurso.length ? `${enCurso.length} título${enCurso.length === 1 ? '' : 's'} te acompaña${enCurso.length === 1 ? '' : 'n'}` : 'Pide prestado un libro del catálogo'}
      />
      <View style={styles.stats}>
        <StatCard icon="book-outline" value={enCurso.length} label="Activos" />
        <StatCard icon="time-outline" value={porVencer.length} label="Por vencer" tone="amber" />
        <StatCard icon="receipt-outline" value={moneda(multas)} label="Multas" tone={multas > 0 ? 'danger' : 'primary'} />
      </View>

      {urgente ? (
        <View style={styles.urgente}>
          <BookCover libro={urgente.libro} width={52} height={74} />
          <View style={styles.flex}>
            <View style={styles.urgenteTagRow}>
              <View style={styles.urgenteDot} />
              <Text style={styles.urgenteTag}>
                {urgente.estado === 'VENCIDO' ? 'PLAZO VENCIDO' : diasHasta(urgente.fechaDevolucionEsperada) === 0 ? 'VENCE HOY' : 'VENCE EN 48 HORAS'}
              </Text>
            </View>
            <Text style={styles.urgenteTitulo} numberOfLines={1}>{urgente.libro.titulo}</Text>
            <Text style={styles.muted}>Devolución: {fecha(urgente.fechaDevolucionEsperada)}</Text>
            <Button title="Devolver ahora" icon="return-down-back" small style={styles.urgenteBtn}
              loading={devolviendoId === urgente.id} onPress={() => devolver(urgente)} />
          </View>
        </View>
      ) : null}

      <View style={styles.tabs}>
        <Chip label={`En curso (${enCurso.length})`} selected={vista === 'curso'} onPress={() => setVista('curso')} />
        <Chip label="Historial / Devueltos" selected={vista === 'historial'} onPress={() => setVista('historial')} />
        <Chip label={`Presté (${prestadosActivos.length})`} selected={vista === 'preste'} onPress={() => setVista('preste')} />
      </View>
    </View>
  );

  const footer = datos.datos ? (
    <View style={styles.info}>
      <View style={styles.infoHeader}>
        <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.infoTitulo}>¿Cómo funcionan las devoluciones?</Text>
      </View>
      <Regla icon="calendar-outline" titulo="Plazos flexibles" texto="Elige de 7 a 30 días al pedir el libro. Puedes tener hasta 3 préstamos activos." />
      <Regla icon="cash-outline" titulo="Multas transparentes" texto="Sin cargos sorpresa: $10.00 por cada día de retraso, calculados al registrar la devolución." />
      <Regla icon="people-outline" titulo="Entre lectores" texto="Quien publicó el libro también puede registrar la devolución cuando se lo entregues." />
    </View>
  ) : null;

  let vacio;
  if (datos.cargando) vacio = <Loading />;
  else if (datos.error && !datos.datos) vacio = <ErrorState message={datos.error} onRetry={datos.recargar} />;
  else if (vista === 'curso') {
    vacio = (
      <EmptyState icon="bookmark-outline" title="No tienes préstamos activos" message="Explora el catálogo y pide prestado un libro."
        action={<Button title="Ir al catálogo" variant="secondary" small onPress={() => router.navigate('/')} />} />
    );
  } else if (vista === 'historial') {
    vacio = <EmptyState icon="time-outline" title="Sin historial" message="Aquí verás los libros que ya devolviste." />;
  } else {
    vacio = <EmptyState icon="people-outline" title="Nadie ha pedido tus libros" message="Aquí verás los préstamos de los libros que publicaste." />;
  }

  return (
    <FlatList
      data={datos.cargando || (datos.error && !datos.datos) ? [] : lista}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <LoanCard
          prestamo={item}
          mostrarUsuario={vista === 'preste'}
          onDevolver={() => devolver(item)}
          devolviendo={devolviendoId === item.id}
          onPressLibro={() => router.push(`/libro/${item.libro.id}`)}
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={vacio}
      ListFooterComponent={footer}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={<RefreshControl refreshing={datos.refrescando} onRefresh={datos.refrescar} colors={[colors.primary]} />}
    />
  );
}

function Regla({ icon, titulo, texto }) {
  return (
    <View style={styles.regla}>
      <Ionicons name={icon} size={17} color={colors.secondary} />
      <View style={styles.flex}>
        <Text style={styles.reglaTitulo}>{titulo}</Text>
        <Text style={styles.reglaTexto}>{texto}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  header: { gap: spacing.lg, marginBottom: spacing.md },
  stats: { flexDirection: 'row', gap: 10 },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  urgente: {
    flexDirection: 'row', gap: 14, padding: 14, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  urgenteTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgenteDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.amber },
  urgenteTag: { fontFamily: fonts.bold, fontSize: 11, color: colors.warning, letterSpacing: 0.4 },
  urgenteTitulo: { fontFamily: fonts.title, fontSize: 17, color: colors.text, marginTop: 2 },
  urgenteBtn: { alignSelf: 'flex-start', marginTop: 8 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  info: {
    marginTop: spacing.xl, padding: 16, gap: 10, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTitulo: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  regla: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.lilac },
  reglaTitulo: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  reglaTexto: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
});
