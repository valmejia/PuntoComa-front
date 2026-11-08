import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme/colors';
import { diasHasta, fecha, moneda } from '../utils/format';
import { iniciales } from './AppHeader';
import { Badge } from './Badge';
import { BookCover } from './BookCover';
import { Button } from './Button';

/** Datos de progreso: día actual y duración total del préstamo. */
export function progresoPrestamo(p) {
  const total = Math.max(1, -diasHastaEntre(p.fechaPrestamo, p.fechaDevolucionEsperada));
  const transcurridos = Math.max(0, -diasHasta(p.fechaPrestamo));
  return { total, dia: Math.min(total, transcurridos + 1), restantes: diasHasta(p.fechaDevolucionEsperada) };
}

function diasHastaEntre(desde, hasta) {
  return diasHasta(desde) - diasHasta(hasta);
}

function etiquetaTiempo(p) {
  if (p.estado === 'DEVUELTO') return { label: 'Devuelto', tone: 'neutral', icon: 'checkmark-circle' };
  if (p.estado === 'VENCIDO') return { label: 'Vencido', tone: 'danger', icon: 'warning' };
  const r = diasHasta(p.fechaDevolucionEsperada);
  if (r === 0) return { label: 'Vence hoy', tone: 'warning', icon: 'alarm' };
  if (r <= 2) return { label: 'Por vencer', tone: 'warning', icon: 'time' };
  return { label: 'A tiempo', tone: 'success' };
}

/** Tarjeta de préstamo para el lector ("Mis préstamos"). `mostrarUsuario`: vista del dueño del libro. */
export function LoanCard({ prestamo: p, mostrarUsuario = false, onDevolver, devolviendo, onPressLibro }) {
  const activo = p.estado !== 'DEVUELTO';
  const t = etiquetaTiempo(p);
  const prog = progresoPrestamo(p);
  const urgente = p.estado === 'VENCIDO' || (activo && prog.restantes <= 2);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Pressable onPress={onPressLibro} accessibilityRole="button" accessibilityLabel={`Ver ${p.libro.titulo}`}>
          <BookCover libro={p.libro} width={62} height={90} />
        </Pressable>
        <View style={styles.info}>
          <View style={styles.tags}>
            <Badge label={p.libro.formato === 'DIGITAL' ? 'Digital' : activo ? 'Físico en mano' : 'Físico'} icon={p.libro.formato === 'DIGITAL' ? 'tablet-portrait-outline' : undefined} />
            <Badge label={t.label} tone={t.tone} icon={t.icon} />
          </View>
          <Text style={styles.title} numberOfLines={2}>{p.libro.titulo}</Text>
          <Text style={styles.muted} numberOfLines={1}>{p.libro.autor}</Text>
          {mostrarUsuario ? (
            <Text style={styles.muted} numberOfLines={1}>Prestado a: <Text style={styles.strong}>{p.usuario.nombre}</Text></Text>
          ) : null}
          {activo ? (
            <View style={styles.limiteRow}>
              <Text style={[styles.small, p.estado === 'VENCIDO' && { color: colors.danger }]}>Límite: {fecha(p.fechaDevolucionEsperada)}</Text>
              {p.estado !== 'VENCIDO' ? <Text style={styles.dia}>Día {prog.dia} de {prog.total}</Text> : null}
            </View>
          ) : (
            <Text style={styles.small}>Devuelto el {fecha(p.fechaDevolucionReal)}</Text>
          )}
        </View>
      </View>

      {activo && p.estado !== 'VENCIDO' ? (
        <View style={styles.barra} accessibilityLabel={`Día ${prog.dia} de ${prog.total}`}>
          <View style={[styles.barraFill, { width: `${Math.round((prog.dia / prog.total) * 100)}%` }, urgente && { backgroundColor: colors.amber }]} />
        </View>
      ) : null}

      {p.diasRetraso > 0 ? (
        <View style={styles.aviso}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
          <Text style={styles.avisoText}>
            {activo ? 'Política de retraso: ' : 'Multa por retraso: '}
            <Text style={styles.strong}>{p.diasRetraso} día{p.diasRetraso === 1 ? '' : 's'} · {moneda(p.multa)}</Text>
            {activo ? ' acumulados. Devuélvelo cuanto antes.' : ''}
          </Text>
        </View>
      ) : null}

      {activo && onDevolver ? (
        <Button
          title={urgente ? 'Devolver ahora' : 'Registrar devolución'}
          icon="return-down-back"
          variant={urgente ? 'primary' : 'secondary'}
          small
          loading={devolviendo}
          onPress={onDevolver}
        />
      ) : null}
    </View>
  );
}

function lineaCirculacion(p) {
  if (p.estado === 'DEVUELTO') return { text: `DEVUELTO · ${fecha(p.fechaDevolucionReal)}`, color: colors.success, icon: 'checkmark-done' };
  if (p.estado === 'VENCIDO') return { text: `MORA: ${p.diasRetraso} DÍA${p.diasRetraso === 1 ? '' : 'S'} DE RETRASO`, color: colors.warning, icon: 'alert-circle-outline' };
  const r = diasHasta(p.fechaDevolucionEsperada);
  if (r === 0) return { text: 'VENCE HOY', color: colors.primary, icon: 'time-outline' };
  return { text: `VENCE EN ${r} DÍA${r === 1 ? '' : 'S'} · ${fecha(p.fechaDevolucionEsperada).toUpperCase()}`, color: colors.secondary, icon: 'calendar-outline' };
}

/** Tarjeta de "Control de Circulación" (vendedor / admin). */
export function CirculationCard({ prestamo: p, onRecibir, recibiendo, onPressLibro }) {
  const l = lineaCirculacion(p);
  const activo = p.estado !== 'DEVUELTO';
  return (
    <View style={[styles.card, p.estado === 'VENCIDO' && styles.mora]}>
      <View style={styles.top}>
        <Pressable onPress={onPressLibro} accessibilityRole="button" accessibilityLabel={`Ver ${p.libro.titulo}`}>
          <BookCover libro={p.libro} width={56} height={80} />
        </Pressable>
        <View style={styles.info}>
          <View style={styles.lineaRow}>
            <Ionicons name={l.icon} size={13} color={l.color} />
            <Text style={[styles.linea, { color: l.color }]} numberOfLines={1}>{l.text}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{p.libro.titulo}</Text>
          <Text style={styles.muted} numberOfLines={1}>{p.libro.autor}</Text>
          <View style={styles.socio}>
            <View style={styles.socioAvatar}><Text style={styles.socioIni}>{iniciales(p.usuario.nombre)}</Text></View>
            <Text style={styles.socioNombre} numberOfLines={1}>{p.usuario.nombre}</Text>
            <Text style={styles.socioId}>#PC-{String(p.id).padStart(4, '0')}</Text>
          </View>
        </View>
      </View>
      {Number(p.multa) > 0 || activo ? (
        <View style={styles.pie}>
          {Number(p.multa) > 0 ? (
            <View style={styles.flex}>
              <Text style={styles.small}>{activo ? 'Tarifa mora devengada' : 'Multa cobrada'}</Text>
              <Text style={styles.multa}>{moneda(p.multa)}</Text>
            </View>
          ) : <View style={styles.flex} />}
          {activo && onRecibir ? (
            <Button title="Recibir ejemplar" icon="checkmark-done" small loading={recibiendo} onPress={onRecibir} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  mora: { borderLeftWidth: 4, borderLeftColor: colors.amber },
  top: { flexDirection: 'row', gap: 12 },
  info: { flex: 1, gap: 3 },
  flex: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  title: { fontFamily: fonts.title, fontSize: 17, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  strong: { fontFamily: fonts.bold, color: colors.text },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  limiteRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dia: { fontFamily: fonts.semibold, fontSize: 12, color: colors.secondary },
  barra: { height: 6, borderRadius: 3, backgroundColor: colors.lilacStrong, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  aviso: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: colors.lilac, borderRadius: radius.md, padding: 10 },
  avisoText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.text, lineHeight: 17 },
  lineaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linea: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.3, flexShrink: 1 },
  socio: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  socioAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.lilacStrong, alignItems: 'center', justifyContent: 'center' },
  socioIni: { fontFamily: fonts.bold, fontSize: 9, color: colors.primary },
  socioNombre: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, flexShrink: 1 },
  socioId: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  pie: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.lilac, borderRadius: radius.md, padding: 10 },
  multa: { fontFamily: fonts.bold, fontSize: 16, color: colors.warning },
});
