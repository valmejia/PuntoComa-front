import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../../api/config';
import { Badge } from '../../components/Badge';
import { BrandMark } from '../../components/Brand';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, fonts } from '../../theme/colors';
import { confirmar } from '../../utils/dialogs';
import { fecha, ROLES } from '../../utils/format';

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAuth();

  async function salir() {
    if (await confirmar('Cerrar sesión', '¿Seguro que quieres salir?', 'Salir', true)) cerrarSesion();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <BrandMark size={64} />
        <Text style={styles.nombre}>{usuario.nombre}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
        <Badge label={ROLES[usuario.rol]} />
        {usuario.fechaRegistro ? <Text style={styles.muted}>Miembro desde {fecha(usuario.fechaRegistro)}</Text> : null}
      </View>
      <Button title="Cerrar sesión" icon="log-out-outline" variant="outline" onPress={salir} />
      <Text style={styles.server}>Servidor: {API_URL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
  card: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  nombre: { fontSize: 20, fontFamily: fonts.bold, color: colors.text, marginTop: spacing.sm },
  email: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  server: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
