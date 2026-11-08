import { Redirect } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { adminApi } from '../../api/services';
import { Badge } from '../../components/Badge';
import { Chip } from '../../components/Chip';
import { ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useRecurso } from '../../hooks/useRecurso';
import { colors, fonts, radius, shadow, spacing } from '../../theme/colors';
import { iniciales } from '../../components/AppHeader';
import { ScreenTitle } from '../../components/ScreenTitle';
import { avisar, confirmar } from '../../utils/dialogs';
import { ROLES } from '../../utils/format';

/** ADMIN: gestión de roles (Usuario, Vendedor, Administrador) y bloqueo de cuentas. */
export default function UsuariosScreen() {
  const { esAdmin } = useAuth();
  if (!esAdmin) return <Redirect href="/" />;
  return <ListaUsuarios />;
}

function ListaUsuarios() {
  const { usuario: yo } = useAuth();
  const lista = useRecurso(() => adminApi.usuarios(), []);
  const [ocupado, setOcupado] = useState(null);

  const reemplazar = (u) => lista.setDatos((ds) => ds.map((x) => (x.id === u.id ? u : x)));

  async function cambiarRol(u, rol) {
    if (u.rol === rol) return;
    const ok = await confirmar('Cambiar rol', `¿Asignar el rol ${ROLES[rol]} a ${u.nombre}?`, 'Cambiar');
    if (!ok) return;
    setOcupado(u.id);
    try { reemplazar(await adminApi.cambiarRol(u.id, rol)); } catch (e) { avisar('Error', e.message); } finally { setOcupado(null); }
  }

  async function cambiarEstado(u, activo) {
    setOcupado(u.id);
    try { reemplazar(await adminApi.cambiarEstado(u.id, activo)); } catch (e) { avisar('Error', e.message); } finally { setOcupado(null); }
  }

  if (lista.cargando) return <Loading />;
  if (lista.error && !lista.datos) return <ErrorState message={lista.error} onRetry={lista.recargar} />;

  return (
    <FlatList
      data={lista.datos}
      keyExtractor={(u) => String(u.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <ScreenTitle title="Usuarios y roles" subtitle={`${lista.datos.length} cuentas · asigna Vendedor o Administrador y bloquea accesos`} />
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      refreshControl={<RefreshControl refreshing={lista.refrescando} onRefresh={lista.refrescar} colors={[colors.primary]} />}
      renderItem={({ item: u }) => {
        const soyYo = u.id === yo.id;
        return (
          <View style={[styles.card, !u.activo && styles.inactivo]}>
            <View style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{iniciales(u.nombre)}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.nombre}>{u.nombre}{soyYo ? ' (tú)' : ''}</Text>
                <Text style={styles.email}>{u.email}</Text>
              </View>
              {u.activo ? <Badge label="Activo" tone="success" /> : <Badge label="Bloqueado" tone="danger" />}
            </View>
            {soyYo ? null : (
              <>
                <View style={styles.chips}>
                  {Object.keys(ROLES).map((r) => (
                    <Chip key={r} label={ROLES[r]} selected={u.rol === r} onPress={() => ocupado !== u.id && cambiarRol(u, r)} />
                  ))}
                </View>
                <View style={styles.row}>
                  <Text style={styles.email}>Cuenta habilitada</Text>
                  <Switch
                    value={u.activo}
                    disabled={ocupado === u.id}
                    onValueChange={(v) => cambiarEstado(u, v)}
                    trackColor={{ true: colors.primary, false: colors.border }}
                    thumbColor={colors.white}
                    activeThumbColor={colors.white}
                    accessibilityLabel={`Cuenta de ${u.nombre} habilitada`}
                  />
                </View>
              </>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colors.cardBorder, ...shadow },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lilacStrong, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  inactivo: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  flex: { flex: 1 },
  nombre: { fontSize: 17, fontFamily: fonts.title, color: colors.text },
  email: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
