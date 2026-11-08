import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../theme/colors';

function icono(nombre) {
  return function TabIcon({ color, size }) {
    return <Ionicons name={nombre} color={color} size={size} />;
  };
}

/** HU-02: el menú cambia según el rol (USUARIO, VENDEDOR, ADMIN). */
export default function TabsLayout() {
  const { esStaff, esAdmin } = useAuth();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.bold },
        tabBarLabelStyle: { fontFamily: fonts.semibold },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Catálogo', tabBarIcon: icono('library-outline') }} />
      <Tabs.Screen name="mis-libros" options={{ title: 'Mis libros', tabBarIcon: icono('albums-outline') }} />
      <Tabs.Screen name="prestamos" options={{ title: 'Préstamos', tabBarIcon: icono('swap-horizontal-outline') }} />
      <Tabs.Screen
        name="gestion"
        options={{ title: 'Gestión', headerTitle: 'Gestión de préstamos', tabBarIcon: icono('clipboard-outline'), href: esStaff ? undefined : null }}
      />
      <Tabs.Screen
        name="usuarios"
        options={{ title: 'Usuarios', tabBarIcon: icono('people-outline'), href: esAdmin ? undefined : null }}
      />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icono('person-circle-outline') }} />
    </Tabs>
  );
}
