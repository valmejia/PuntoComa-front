import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { librosApi, prestamosApi } from '../../api/services';
import { Badge, StatusDot } from '../../components/Badge';
import { estadoLibro } from '../../components/BookCard';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';
import { avisar, confirmar } from '../../utils/dialogs';
import { admitePrestamo, admiteVenta, fecha, FORMATOS, moneda, TIPOS } from '../../utils/format';

const PLAZOS = [7, 14, 21, 30];

export default function LibroDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario, esStaff } = useAuth();
  const [dias, setDias] = useState(14);
  const [solicitando, setSolicitando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const { datos: libro, error, cargando, recargar } = useRecurso(() => librosApi.detalle(id), [id]);

  if (cargando) return <Loading />;
  if (error && !libro) return <ErrorState message={error} onRetry={recargar} />;

  const esMio = libro.publicadoPor.id === usuario?.id;
  const puedeGestionar = esMio || esStaff;
  const prestable = admitePrestamo(libro);
  const estado = estadoLibro(libro);

  /** HU-05 / CU-05: solicitar préstamo. */
  async function solicitar() {
    const ok = await confirmar('Confirmar préstamo', `¿Solicitar "${libro.titulo}" por ${dias} días?`, 'Solicitar');
    if (!ok) return;
    setSolicitando(true);
    try {
      const p = await prestamosApi.solicitar(libro.id, dias);
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
      <Stack.Screen options={{ title: '' }} />
      <LinearGradient colors={['#EDE3FF', colors.background]} style={styles.hero}>
        <View style={styles.cover}><BookCover libro={libro} width={140} height={204} /></View>
      </LinearGradient>

      <View style={styles.cabecera}>
        <View style={styles.tags}>
          <Badge label={libro.genero} />
          <Badge label={FORMATOS[libro.formato]} icon={libro.formato === 'DIGITAL' ? 'tablet-portrait-outline' : 'book-outline'} />
          <Badge label={TIPOS[libro.tipo]} />
        </View>
        <Text style={styles.title} accessibilityRole="header">{libro.titulo}</Text>
        <Text style={styles.author}>{libro.autor}</Text>
        <StatusDot label={estado.label} tone={estado.tone} />
        {admiteVenta(libro) && libro.precio != null ? <Text style={styles.price}>{moneda(libro.precio)}</Text> : null}
      </View>

      {libro.descripcion ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.body}>{libro.descripcion}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        {libro.editorial ? <Dato icon="business-outline" label="Editorial" valor={libro.editorial} /> : null}
        {libro.anioPublicacion ? <Dato icon="calendar-outline" label="Año" valor={String(libro.anioPublicacion)} /> : null}
        {libro.isbn ? <Dato icon="barcode-outline" label="ISBN" valor={libro.isbn} /> : null}
        <Dato icon="person-outline" label="Publicado por" valor={esMio ? 'Ti' : libro.publicadoPor.nombre} />
        <Dato icon="time-outline" label="En catálogo desde" valor={fecha(libro.fechaPublicacion)} />
      </View>

      {prestable && !esMio ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Pedir prestado</Text>
          </View>
          {libro.disponible ? (
            <>
              <Text style={styles.muted}>Elige por cuántos días lo quieres:</Text>
              <View style={styles.chips}>
                {PLAZOS.map((d) => <Chip key={d} label={`${d} días`} selected={dias === d} onPress={() => setDias(d)} />)}
              </View>
              <View style={styles.aviso}>
                <Ionicons name="information-circle-outline" size={16} color={colors.secondary} />
                <Text style={styles.avisoText}>Multa de $10.00 por cada día de retraso.</Text>
              </View>
              <Button title="Solicitar préstamo" icon="bookmark" onPress={solicitar} loading={solicitando} />
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
          <Button title="Eliminar" icon="trash-outline" variant="dangerOutline" style={styles.flex}
            onPress={eliminar} loading={eliminando} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function Dato({ icon, label, valor }) {
  return (
    <View style={styles.dato}>
      <Ionicons name={icon} size={16} color={colors.secondary} />
      <Text style={styles.datoLabel}>{label}</Text>
      <Text style={styles.datoValor} numberOfLines={1}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xxl, gap: spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 24 },
  cover: { ...shadow, shadowOpacity: 0.3, shadowRadius: 18, borderRadius: 8 },
  cabecera: { alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  title: { fontFamily: fonts.title, fontSize: 26, color: colors.text, textAlign: 'center', marginTop: 4 },
  author: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  price: { fontFamily: fonts.bold, fontSize: 24, color: colors.primary, marginTop: 4 },
  section: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 23 },
  card: {
    marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md,
    borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  datoLabel: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14 },
  datoValor: { flex: 1, fontFamily: fonts.semibold, color: colors.text, fontSize: 14, textAlign: 'right' },
  muted: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.lilac, borderRadius: radius.md, padding: 10 },
  avisoText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  nota: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
});
