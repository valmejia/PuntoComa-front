import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../../api/config';
import { iniciales } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';
import { confirmar } from '../../utils/dialogs';
import { fecha, ROLES } from '../../utils/format';

export default function PerfilScreen() {
  const router = useRouter();
  const { usuario, cerrarSesion, esStaff, esAdmin } = useAuth();

  async function salir() {
    if (await confirmar('Cerrar sesión', '¿Seguro que quieres salir?', 'Salir', true)) cerrarSesion();
  }

  const accesos = [
    { icon: 'bookmarks-outline', titulo: 'Mis préstamos', ruta: '/prestamos' },
    { icon: 'albums-outline', titulo: 'Mi biblioteca', ruta: '/mis-libros' },
    { icon: 'add-circle-outline', titulo: 'Añadir título', ruta: '/publicar' },
    ...(esStaff ? [{ icon: 'clipboard-outline', titulo: 'Control de circulación', ruta: '/gestion' }] : []),
    ...(esAdmin ? [{ icon: 'people-outline', titulo: 'Usuarios y roles', ruta: '/admin/usuarios' }] : []),
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{iniciales(usuario.nombre)}</Text></View>
        <Text style={styles.nombre}>{usuario.nombre}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
        <Badge label={ROLES[usuario.rol]} icon={esStaff ? 'storefront-outline' : 'book-outline'} />
        {usuario.fechaRegistro ? <Text style={styles.muted}>Miembro desde {fecha(usuario.fechaRegistro)}</Text> : null}
      </View>

      <View style={styles.lista}>
        {accesos.map((a, i) => (
          <Pressable key={a.ruta} onPress={() => router.push(a.ruta)} accessibilityRole="button"
            style={({ pressed }) => [styles.item, i > 0 && styles.itemBorde, pressed && { backgroundColor: colors.lilac }]}>
            <View style={styles.itemIcon}><Ionicons name={a.icon} size={18} color={colors.primary} /></View>
            <Text style={styles.itemText}>{a.titulo}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Button title="Cerrar sesión" icon="log-out-outline" variant="outline" onPress={salir} />
      <Text style={styles.server}>Servidor: {API_URL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
  card: {
    alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 22, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.cardBorder, ...shadow,
  },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarText: { fontFamily: fonts.title, fontSize: 28, color: colors.white },
  nombre: { fontFamily: fonts.title, fontSize: 22, color: colors.text },
  email: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  lista: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 56 },
  itemBorde: { borderTopWidth: 1, borderTopColor: colors.cardBorder },
  itemIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.lilacStrong, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  server: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
});
