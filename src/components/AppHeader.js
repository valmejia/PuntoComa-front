import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme/colors';
import { BrandInline } from './Brand';

export function iniciales(nombre = '') {
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** Encabezado de las pestañas: logo a la izquierda y avatar (lleva al perfil) a la derecha. */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { usuario } = useAuth();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <BrandInline />
      <Pressable
        onPress={() => router.navigate('/perfil')}
        accessibilityRole="button"
        accessibilityLabel="Ir a mi perfil"
        style={styles.avatar}
        hitSlop={8}
      >
        <Text style={styles.avatarText}>{iniciales(usuario?.nombre)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, color: colors.white, fontSize: 13 },
});
