import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { librosApi } from '../api/services';
import { Button } from '../components/Button';
import { Segmented } from '../components/Chip';
import { ErrorBanner, ErrorState, Loading } from '../components/States';
import { TextField } from '../components/TextField';
import { colors, spacing, fonts } from '../theme/colors';
import { avisar } from '../utils/dialogs';

const VACIO = {
  titulo: '', autor: '', genero: '', descripcion: '', editorial: '', isbn: '', anioPublicacion: '',
  formato: 'FISICO', tipo: 'AMBOS', precio: '', stock: '1', portadaUrl: '',
};

/** HU-04 / CU-04: publicar un libro para venta o préstamo. Con ?id= edita uno existente. */
export default function PublicarScreen() {
  const { id } = useLocalSearchParams();
  const editando = Boolean(id);
  const router = useRouter();
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(editando);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    librosApi.detalle(id)
      .then((l) => setForm({
        titulo: l.titulo, autor: l.autor, genero: l.genero, descripcion: l.descripcion ?? '',
        editorial: l.editorial ?? '', isbn: l.isbn ?? '', anioPublicacion: l.anioPublicacion ? String(l.anioPublicacion) : '',
        formato: l.formato, tipo: l.tipo, precio: l.precio != null ? String(l.precio) : '', stock: String(l.stock),
        portadaUrl: l.portadaUrl ?? '',
      }))
      .catch((e) => setErrorCarga(e.message))
      .finally(() => setCargando(false));
  }, [editando, id]);

  const set = (campo) => (valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };
  const necesitaPrecio = form.tipo !== 'PRESTAMO';

  function validar() {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio';
    if (!form.autor.trim()) e.autor = 'El autor es obligatorio';
    if (!form.genero.trim()) e.genero = 'El género es obligatorio';
    const stock = Number(form.stock);
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) e.stock = 'Ingresa un número entero (0 o más)';
    if (necesitaPrecio) {
      const precio = Number(form.precio.replace(',', '.'));
      if (!form.precio || Number.isNaN(precio) || precio <= 0) e.precio = 'Ingresa un precio mayor a 0';
    }
    if (form.anioPublicacion) {
      const a = Number(form.anioPublicacion);
      if (!Number.isInteger(a) || a < 1000 || a > 2100) e.anioPublicacion = 'Año inválido';
    }
    return e;
  }

  async function guardar() {
    const e = validar();
    setErrores(e);
    setError(null);
    if (Object.keys(e).length) {
      setError('Revisa los campos marcados');
      return;
    }
    const cuerpo = {
      titulo: form.titulo.trim(),
      autor: form.autor.trim(),
      genero: form.genero.trim(),
      descripcion: form.descripcion.trim() || null,
      editorial: form.editorial.trim() || null,
      isbn: form.isbn.trim() || null,
      anioPublicacion: form.anioPublicacion ? Number(form.anioPublicacion) : null,
      formato: form.formato,
      tipo: form.tipo,
      precio: necesitaPrecio ? Number(form.precio.replace(',', '.')) : null,
      stock: Number(form.stock),
      portadaUrl: form.portadaUrl.trim() || null,
    };
    setGuardando(true);
    try {
      const libro = editando ? await librosApi.actualizar(id, cuerpo) : await librosApi.publicar(cuerpo);
      avisar(editando ? 'Cambios guardados' : '¡Libro publicado!', editando ? undefined : 'Ya aparece en el catálogo.');
      if (editando) router.back();
      else router.replace(`/libro/${libro.id}`);
    } catch (err) {
      if (err.errores) setErrores(err.errores);
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Loading />;
  if (errorCarga) return <ErrorState message={errorCarga} />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: editando ? 'Editar libro' : 'Publicar libro' }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={error} />

        <Text style={styles.section}>¿Cómo lo ofreces?</Text>
        <Segmented
          value={form.tipo}
          onChange={set('tipo')}
          options={[{ value: 'VENTA', label: 'Venta' }, { value: 'PRESTAMO', label: 'Préstamo' }, { value: 'AMBOS', label: 'Ambos' }]}
        />
        <Segmented
          value={form.formato}
          onChange={set('formato')}
          options={[{ value: 'FISICO', label: 'Físico' }, { value: 'DIGITAL', label: 'Digital (PDF/EPUB)' }]}
        />

        <Text style={styles.section}>Datos del libro</Text>
        <TextField label="Título *" value={form.titulo} onChangeText={set('titulo')} placeholder="Ej. Cien años de soledad" error={errores.titulo} />
        <TextField label="Autor *" value={form.autor} onChangeText={set('autor')} placeholder="Ej. Gabriel García Márquez" error={errores.autor} />
        <TextField label="Género *" value={form.genero} onChangeText={set('genero')} placeholder="Ej. Novela" error={errores.genero} />
        <TextField label="Descripción" value={form.descripcion} onChangeText={set('descripcion')} placeholder="Estado del libro, edición, etc." multiline error={errores.descripcion} />

        <View style={styles.row}>
          {necesitaPrecio ? (
            <TextField style={styles.flex} label="Precio (MXN) *" value={form.precio} onChangeText={set('precio')} placeholder="0.00" keyboardType="decimal-pad" error={errores.precio} />
          ) : null}
          <TextField style={styles.flex} label={form.formato === 'DIGITAL' ? 'Copias / licencias *' : 'Ejemplares *'} value={form.stock} onChangeText={set('stock')} keyboardType="number-pad" error={errores.stock} />
        </View>

        <Text style={styles.section}>Opcional</Text>
        <TextField label="Editorial" value={form.editorial} onChangeText={set('editorial')} error={errores.editorial} />
        <View style={styles.row}>
          <TextField style={styles.flex} label="ISBN" value={form.isbn} onChangeText={set('isbn')} error={errores.isbn} />
          <TextField style={styles.flex} label="Año" value={form.anioPublicacion} onChangeText={set('anioPublicacion')} keyboardType="number-pad" error={errores.anioPublicacion} />
        </View>
        <TextField label="URL de la portada" value={form.portadaUrl} onChangeText={set('portadaUrl')} placeholder="https://..." autoCapitalize="none" keyboardType="url" error={errores.portadaUrl} />

        <Button title={editando ? 'Guardar cambios' : 'Publicar'} icon="cloud-upload-outline" onPress={guardar} loading={guardando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  section: { fontSize: 15, fontFamily: fonts.bold, color: colors.primary, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
});
