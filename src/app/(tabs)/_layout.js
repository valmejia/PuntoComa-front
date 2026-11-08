import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts } from '../../theme/colors';

function icono(nombre, nombreActivo) {
  return function TabIcon({ color, size, focused }) {
    return <Ionicons name={focused ? nombreActivo : nombre} color={color} size={size - 2} />;
  };
}

/** HU-02: el menú cambia según el rol. Gestión sólo aparece para VENDEDOR y ADMIN. */
export default function TabsLayout() {
  const { esStaff } = useAuth();
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icono('library-outline', 'library') }} />
      <Tabs.Screen name="prestamos" options={{ title: 'Préstamos', tabBarIcon: icono('bookmarks-outline', 'bookmarks') }} />
      <Tabs.Screen name="mis-libros" options={{ title: 'Biblioteca', tabBarIcon: icono('albums-outline', 'albums') }} />
      <Tabs.Screen
        name="gestion"
        options={{ title: 'Gestión', tabBarIcon: icono('clipboard-outline', 'clipboard'), href: esStaff ? undefined : null }}
      />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icono('person-circle-outline', 'person-circle') }} />
    </Tabs>
  );
}
