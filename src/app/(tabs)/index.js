import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { librosApi } from '../../api/services';
import { AuthorAvatar } from '../../components/AuthorAvatar';
import { BookCard, BookTile } from '../../components/BookCard';
import { BookCover } from '../../components/BookCover';
import { Chip } from '../../components/Chip';
import { SectionHeader } from '../../components/ScreenTitle';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';

const FORMATOS = [
  { v: null, l: 'Todos', icon: 'library-outline' },
  { v: 'FISICO', l: 'Físico', icon: 'book-outline' },
  { v: 'DIGITAL', l: 'Digital (EPUB)', icon: 'tablet-portrait-outline' },
];
const TIPOS = [{ v: null, l: 'Todos' }, { v: 'VENTA', l: 'Venta' }, { v: 'PRESTAMO', l: 'Préstamo' }];

/** HU-03 / CU-03: catálogo (Figma "Catálogo de Libros y Búsqueda"). */
export default function CatalogoScreen() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [formato, setFormato] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [genero, setGenero] = useState(null);
  const [autor, setAutor] = useState(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [verFiltros, setVerFiltros] = useState(false);

  // Espera 400 ms después de escribir antes de buscar.
  useEffect(() => {
    const t = setTimeout(() => setQ(texto.trim()), 400);
    return () => clearTimeout(t);
  }, [texto]);

  const libros = useRecurso(
    () => librosApi.catalogo({ q, formato, tipo, genero, autor, disponible: soloDisponibles || undefined }),
    [q, formato, tipo, genero, autor, soloDisponibles],
  );
  const opciones = useRecurso(async () => {
    const [generos, autores] = await Promise.all([librosApi.generos(), librosApi.autores()]);
    return { generos, autores };
  }, []);

  const filtrosPanel = [tipo, genero, autor, soloDisponibles || null].filter(Boolean).length;
  // Sin búsqueda ni filtros se muestra el "inicio" con secciones; si no, sólo resultados.
  const modoInicio = !q && filtrosPanel === 0;
  const datos = libros.datos ?? [];
  const recientes = datos.slice(0, 8);
  const destacado = datos.find((l) => l.stock > 0) ?? datos[0];

  // Autores con más títulos en el catálogo.
  const topAutores = useMemo(() => {
    const cuenta = new Map();
    for (const l of libros.datos ?? []) cuenta.set(l.autor, (cuenta.get(l.autor) ?? 0) + 1);
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([a]) => a);
  }, [libros.datos]);

  function limpiar() {
    setTipo(null); setGenero(null); setAutor(null); setSoloDisponibles(false); setTexto('');
  }

  const irA = (l) => router.push(`/libro/${l.id}`);

  const encabezado = (
    <View style={styles.header}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar título, autor o ISBN..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Buscar libros"
          />
          {texto ? (
            <Pressable onPress={() => setTexto('')} accessibilityLabel="Borrar búsqueda" hitSlop={10}>
              <Ionicons name="close-circle" size={19} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setVerFiltros((v) => !v)}
          style={[styles.filterBtn, (verFiltros || filtrosPanel > 0) && styles.filterBtnOn]}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
        >
          <Ionicons name="options-outline" size={21} color={verFiltros || filtrosPanel > 0 ? colors.white : colors.primary} />
          {filtrosPanel > 0 ? <Text style={styles.filterCount}>{filtrosPanel}</Text> : null}
        </Pressable>
      </View>

      {verFiltros ? (
        <View style={styles.filtros}>
          <Fila titulo="Disponible para">
            {TIPOS.map((o) => <Chip key={o.l} label={o.l} selected={tipo === o.v} onPress={() => setTipo(o.v)} />)}
          </Fila>
          <Fila titulo="Género">
            <Chip label="Todos" selected={!genero} onPress={() => setGenero(null)} />
            {(opciones.datos?.generos ?? []).map((g) => (
              <Chip key={g} label={g} selected={genero === g} onPress={() => setGenero(genero === g ? null : g)} />
            ))}
          </Fila>
          <Fila titulo="Autor">
            <Chip label="Todos" selected={!autor} onPress={() => setAutor(null)} />
            {(opciones.datos?.autores ?? []).map((a) => (
              <Chip key={a} label={a} selected={autor === a} onPress={() => setAutor(autor === a ? null : a)} />
            ))}
          </Fila>
          <View style={styles.filtroFooter}>
            <Chip label="Sólo disponibles" icon="checkmark-circle-outline" selected={soloDisponibles} onPress={() => setSoloDisponibles((v) => !v)} />
            {filtrosPanel > 0 ? (
              <Pressable onPress={limpiar} hitSlop={8}><Text style={styles.limpiar}>Limpiar filtros</Text></Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {modoInicio && destacado ? (
        <View style={styles.hero}>
          <View style={styles.flex}>
            <Text style={styles.heroTag}>SELECCIÓN{'\n'}CURADA</Text>
            <Text style={styles.heroTitulo}>Descubre las joyas literarias del mes</Text>
            <Pressable style={styles.heroBtn} onPress={() => irA(destacado)} accessibilityRole="button" accessibilityLabel={`Explorar ${destacado.titulo}`}>
              <Text style={styles.heroBtnText}>Explorar</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <View style={styles.heroCover}><BookCover libro={destacado} width={92} height={130} /></View>
        </View>
      ) : null}

      <View style={styles.formatoHeader}>
        <Text style={styles.formatoTitulo}>Explorar por Formato</Text>
        {opciones.datos ? <Text style={styles.muted}>{opciones.datos.generos.length} categorías</Text> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FORMATOS.map((f) => (
          <Chip key={f.l} label={f.l} icon={f.icon} selected={formato === f.v} onPress={() => setFormato(f.v)} />
        ))}
      </ScrollView>

      {modoInicio && recientes.length ? (
        <>
          <SectionHeader title="Agregados recientemente" accent />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carrusel}>
            {recientes.map((l) => <BookTile key={l.id} libro={l} onPress={() => irA(l)} />)}
          </ScrollView>
        </>
      ) : null}

      {modoInicio && topAutores.length ? (
        <>
          <SectionHeader title="Top autores" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carrusel}>
            {topAutores.map((a, i) => (
              <AuthorAvatar key={a} nombre={a} index={i} onPress={() => setAutor(a)} />
            ))}
          </ScrollView>
        </>
      ) : null}

      {libros.datos ? (
        modoInicio ? (
          <SectionHeader title="Recomendados para ti" action="Catálogo abierto" onAction={() => setVerFiltros(true)} />
        ) : (
          <SectionHeader
            title={`${datos.length} ${datos.length === 1 ? 'resultado' : 'resultados'}`}
            action={filtrosPanel > 0 || q ? 'Limpiar' : undefined}
            onAction={limpiar}
          />
        )
      ) : null}
    </View>
  );

  let cuerpo = null;
  if (libros.cargando) cuerpo = <Loading />;
  else if (libros.error && !libros.datos) cuerpo = <ErrorState message={libros.error} onRetry={libros.recargar} />;

  return (
    <FlatList
      data={cuerpo ? [] : datos}
      keyExtractor={(l) => String(l.id)}
      renderItem={({ item }) => <BookCard libro={item} propio={item.publicadoPor.id === usuario?.id} onPress={() => irA(item)} />}
      ListHeaderComponent={encabezado}
      ListEmptyComponent={
        cuerpo ?? (
          <EmptyState icon="search-outline" title="Sin resultados" message="No encontramos libros con esos criterios. Prueba con otra búsqueda o quita filtros." />
        )
      }
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={libros.refrescando} onRefresh={libros.refrescar} colors={[colors.primary]} />}
    />
  );
}

function Fila({ titulo, children }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaTitulo}>{titulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingTop: 4, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  header: { gap: spacing.lg, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  search: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 16, minHeight: 48,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, paddingVertical: 10, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  filterBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lilacStrong, alignItems: 'center', justifyContent: 'center' },
  filterBtnOn: { backgroundColor: colors.primary },
  filterCount: {
    position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, overflow: 'hidden',
    backgroundColor: colors.amber, color: colors.text, fontFamily: fonts.bold, fontSize: 11, textAlign: 'center', lineHeight: 20,
  },
  filtros: { gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.cardBorder },
  fila: { gap: 6 },
  filaTitulo: { fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
  chips: { gap: spacing.sm, paddingRight: spacing.sm },
  filtroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limpiar: { color: colors.danger, fontFamily: fonts.bold },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primary,
    borderRadius: 22, padding: 18, ...shadow, shadowOpacity: 0.2,
  },
  heroTag: { fontFamily: fonts.bold, fontSize: 12, color: colors.amber, letterSpacing: 1, lineHeight: 17 },
  heroTitulo: { fontFamily: fonts.title, fontSize: 20, color: colors.white, marginTop: 6, lineHeight: 26 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 14,
    backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
  },
  heroBtnText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  heroCover: { transform: [{ rotate: '4deg' }], ...shadow, shadowOpacity: 0.35 },
  formatoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -8 },
  formatoTitulo: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  carrusel: { gap: 14, paddingRight: spacing.lg },
});
