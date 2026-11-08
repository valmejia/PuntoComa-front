import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { librosApi, prestamosApi } from '../../api/services';
import { Badge, tonoEstadoLibro } from '../../components/Badge';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, radius, spacing, fonts } from '../../theme/colors';
import { avisar, confirmar } from '../../utils/dialogs';
import { admitePrestamo, admiteVenta, ESTADOS_LIBRO, fecha, FORMATOS, moneda, TIPOS } from '../../utils/format';

const PLAZOS = [7, 14, 21, 30];

export default function LibroDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario, esStaff } = useAuth();
  const [dias, setDias] = useState(14);
  const [solicitando, setSolicitando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const { datos: libro, setDatos, error, cargando, recargar } = useRecurso(() => librosApi.detalle(id), [id]);

  if (cargando) return <Loading />;
  if (error && !libro) return <ErrorState message={error} onRetry={recargar} />;

  const esMio = libro.publicadoPor.id === usuario?.id;
  const puedeGestionar = esMio || esStaff;
  const prestable = admitePrestamo(libro);

  /** HU-05 / CU-05: solicitar préstamo. */
  async function solicitar() {
    const ok = await confirmar('Confirmar préstamo', `¿Solicitar "${libro.titulo}" por ${dias} días?`, 'Solicitar');
    if (!ok) return;
    setSolicitando(true);
    try {
      const p = await prestamosApi.solicitar(libro.id, dias);
      setDatos({ ...libro, stock: libro.stock - 1, disponible: libro.stock - 1 > 0, estado: libro.stock - 1 > 0 ? 'DISPONIBLE' : 'PRESTADO' });
      avisar('¡Préstamo registrado!', `Devuélvelo a más tardar el ${fecha(p.fechaDevolucionEsperada)}.`);
      router.navigate('/prestamos');
    } catch (e) {
      avisar('No se pudo solicitar', e.message);
      recargar();
    } finally {
      setSolicitando(false);
    }
  }

  async function eliminar() {
    const ok = await confirmar('Eliminar libro', `"${libro.titulo}" dejará de aparecer en el catálogo.`, 'Eliminar', true);
    if (!ok) return;
    setEliminando(true);
    try {
      await librosApi.eliminar(libro.id);
      router.back();
    } catch (e) {
      avisar('No se pudo eliminar', e.message);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View style={styles.top}>
        <BookCover libro={libro} width={120} height={174} />
        <View style={styles.topInfo}>
          <Text style={styles.title}>{libro.titulo}</Text>
          <Text style={styles.author}>{libro.autor}</Text>
          <Badge label={ESTADOS_LIBRO[libro.estado]} tone={tonoEstadoLibro(libro.estado)} />
          {admiteVenta(libro) && libro.precio != null ? <Text style={styles.price}>{moneda(libro.precio)}</Text> : null}
          <Text style={styles.stock}>
            {libro.stock > 0 ? `${libro.stock} ejemplar${libro.stock === 1 ? '' : 'es'} disponible${libro.stock === 1 ? '' : 's'}` : 'Sin ejemplares disponibles'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Dato label="Género" valor={libro.genero} />
        <Dato label="Formato" valor={FORMATOS[libro.formato]} />
        <Dato label="Disponible para" valor={TIPOS[libro.tipo]} />
        {libro.editorial ? <Dato label="Editorial" valor={libro.editorial} /> : null}
        {libro.anioPublicacion ? <Dato label="Año" valor={String(libro.anioPublicacion)} /> : null}
        {libro.isbn ? <Dato label="ISBN" valor={libro.isbn} /> : null}
        <Dato label="Publicado por" valor={esMio ? 'Ti' : libro.publicadoPor.nombre} />
      </View>

      {libro.descripcion ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.body}>{libro.descripcion}</Text>
        </View>
      ) : null}

      {prestable && !esMio ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pedir prestado</Text>
          {libro.disponible ? (
            <>
              <Text style={styles.muted}>Elige por cuántos días lo quieres:</Text>
              <View style={styles.chips}>
                {PLAZOS.map((d) => <Chip key={d} label={`${d} días`} selected={dias === d} onPress={() => setDias(d)} />)}
              </View>
              <Text style={styles.muted}>Multa de $10.00 por cada día de retraso.</Text>
              <Button title="Solicitar préstamo" icon="bookmark-outline" onPress={solicitar} loading={solicitando} />
            </>
          ) : (
            <Text style={styles.muted}>Todos los ejemplares están prestados. Vuelve a intentarlo más tarde.</Text>
          )}
        </View>
      ) : null}

      {admiteVenta(libro) && !esMio ? (
        <Text style={styles.nota}>La compra con carrito estará disponible próximamente.</Text>
      ) : null}

      {puedeGestionar ? (
        <View style={styles.actions}>
          <Button title="Editar" icon="create-outline" variant="secondary" style={styles.flex}
            onPress={() => router.push({ pathname: '/publicar', params: { id: libro.id } })} />
          <Button title="Eliminar" icon="trash-outline" variant="outline" style={[styles.flex, styles.danger]}
            onPress={eliminar} loading={eliminando} />
        </View>
      ) : null}
    </ScrollView>
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
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', gap: spacing.lg },
  topInfo: { flex: 1, gap: spacing.sm },
  title: { fontSize: 24, fontFamily: fonts.title, color: colors.text },
  author: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted },
  price: { fontSize: 22, fontFamily: fonts.bold, color: colors.primary },
  stock: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  dato: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  datoLabel: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 15 },
  datoValor: { color: colors.text, fontSize: 15, fontFamily: fonts.semibold, flexShrink: 1, textAlign: 'right' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 22 },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  nota: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  danger: { borderColor: colors.danger },
});
