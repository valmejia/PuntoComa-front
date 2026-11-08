import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fonts } from '../theme/colors';
import { diasHasta, ESTADOS_PRESTAMO, fecha, moneda } from '../utils/format';
import { Badge, tonoEstadoPrestamo } from './Badge';
import { BookCover } from './BookCover';
import { Button } from './Button';

/** Tarjeta de préstamo. mostrarUsuario: muestra quién lo pidió (vista del dueño / vendedor). */
export function LoanCard({ prestamo, mostrarUsuario = false, onDevolver, devolviendo, onPressLibro }) {
  const p = prestamo;
  const activo = p.estado !== 'DEVUELTO';
  const restantes = activo ? diasHasta(p.fechaDevolucionEsperada) : null;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Pressable onPress={onPressLibro} accessibilityRole="button" accessibilityLabel={`Ver ${p.libro.titulo}`}>
          <BookCover libro={p.libro} width={56} height={80} />
        </Pressable>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{p.libro.titulo}</Text>
            <Badge label={ESTADOS_PRESTAMO[p.estado]} tone={tonoEstadoPrestamo(p.estado)} />
          </View>
          <Text style={styles.muted} numberOfLines={1}>{p.libro.autor}</Text>
          {mostrarUsuario ? <Text style={styles.muted} numberOfLines={1}>Prestado a: {p.usuario.nombre}</Text> : null}
        </View>
      </View>

      <View style={styles.fechas}>
        <Dato label="Préstamo" valor={fecha(p.fechaPrestamo)} />
        <Dato label="Devolver antes de" valor={fecha(p.fechaDevolucionEsperada)} />
        {p.fechaDevolucionReal ? <Dato label="Devuelto" valor={fecha(p.fechaDevolucionReal)} /> : null}
      </View>

      {activo && restantes >= 0 ? (
        <Text style={styles.aviso}>
          {restantes === 0 ? 'Vence hoy' : `Quedan ${restantes} día${restantes === 1 ? '' : 's'}`}
        </Text>
      ) : null}
      {p.diasRetraso > 0 ? (
        <Text style={[styles.aviso, styles.multa]}>
          {p.diasRetraso} día{p.diasRetraso === 1 ? '' : 's'} de retraso · Multa {activo ? 'acumulada' : ''} {moneda(p.multa)}
        </Text>
      ) : null}

      {activo && onDevolver ? (
        <Button title="Registrar devolución" icon="return-down-back" variant="outline" small loading={devolviendo} onPress={onDevolver} />
      ) : null}
    </View>
  );
}

function Dato({ label, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoLabel}>{label}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  fechas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  dato: { gap: 2 },
  datoLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  datoValor: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text },
  aviso: { fontSize: 14, color: colors.success, fontFamily: fonts.semibold },
  multa: { color: colors.danger },
});
