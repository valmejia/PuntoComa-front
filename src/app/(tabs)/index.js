import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { librosApi } from '../../api/services';
import { BookCard } from '../../components/BookCard';
import { Chip } from '../../components/Chip';
import { EmptyState, ErrorState, Loading } from '../../components/States';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, radius, spacing, fonts } from '../../theme/colors';

const FORMATO_OPC = [{ v: null, l: 'Todos' }, { v: 'FISICO', l: 'Físico' }, { v: 'DIGITAL', l: 'Digital' }];
const TIPO_OPC = [{ v: null, l: 'Todos' }, { v: 'VENTA', l: 'Venta' }, { v: 'PRESTAMO', l: 'Préstamo' }];

/** HU-03 / CU-03: catálogo con búsqueda por título y filtros por autor, género y formato. */
export default function CatalogoScreen() {
  const router = useRouter();
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

  const filtrosActivos = [formato, tipo, genero, autor, soloDisponibles || null].filter(Boolean).length;

  function limpiar() {
    setFormato(null); setTipo(null); setGenero(null); setAutor(null); setSoloDisponibles(false);
  }

  const encabezado = (
    <View style={styles.header}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar por título o autor"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Buscar libros"
          />
          {texto ? (
            <Pressable onPress={() => setTexto('')} accessibilityLabel="Borrar búsqueda" hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setVerFiltros((v) => !v)}
          style={[styles.filterBtn, (verFiltros || filtrosActivos > 0) && styles.filterBtnOn]}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
        >
          <Ionicons name="options-outline" size={22} color={verFiltros || filtrosActivos > 0 ? colors.white : colors.primary} />
          {filtrosActivos > 0 ? <Text style={styles.filterCount}>{filtrosActivos}</Text> : null}
        </Pressable>
      </View>

      {verFiltros ? (
        <View style={styles.filtros}>
          <Fila titulo="Formato">
            {FORMATO_OPC.map((o) => <Chip key={o.l} label={o.l} selected={formato === o.v} onPress={() => setFormato(o.v)} />)}
          </Fila>
          <Fila titulo="Disponible para">
            {TIPO_OPC.map((o) => <Chip key={o.l} label={o.l} selected={tipo === o.v} onPress={() => setTipo(o.v)} />)}
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
            <Chip label="Sólo disponibles" selected={soloDisponibles} onPress={() => setSoloDisponibles((v) => !v)} />
            {filtrosActivos > 0 ? (
              <Pressable onPress={limpiar} hitSlop={8}><Text style={styles.limpiar}>Limpiar filtros</Text></Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {libros.datos ? (
        <Text style={styles.count}>{libros.datos.length} {libros.datos.length === 1 ? 'libro' : 'libros'}</Text>
      ) : null}
    </View>
  );

  let cuerpo = null;
  if (libros.cargando) cuerpo = <Loading />;
  else if (libros.error && !libros.datos) cuerpo = <ErrorState message={libros.error} onRetry={libros.recargar} />;

  return (
    <FlatList
      data={cuerpo ? [] : libros.datos ?? []}
      keyExtractor={(l) => String(l.id)}
      renderItem={({ item }) => <BookCard libro={item} onPress={() => router.push(`/libro/${item.id}`)} />}
      ListHeaderComponent={encabezado}
      ListEmptyComponent={
        cuerpo ?? (
          <EmptyState
            icon="search-outline"
            title="Sin resultados"
            message="No encontramos libros con esos criterios. Prueba con otra búsqueda o quita filtros."
          />
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { gap: spacing.md, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: { fontFamily: fonts.regular, flex: 1, fontSize: 16, color: colors.text, paddingVertical: 10 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnOn: { backgroundColor: colors.primary },
  filterCount: {
    position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.accent, color: colors.text, fontSize: 12, fontFamily: fonts.bold, textAlign: 'center', lineHeight: 20,
  },
  filtros: { gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  fila: { gap: 6 },
  filaTitulo: { fontSize: 13, fontFamily: fonts.bold, color: colors.textMuted, textTransform: 'uppercase' },
  chips: { gap: spacing.sm, paddingRight: spacing.sm },
  filtroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limpiar: { color: colors.danger, fontFamily: fonts.bold },
  count: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 14 },
});
