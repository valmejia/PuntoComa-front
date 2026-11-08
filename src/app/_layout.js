import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Bienvenida from '../screens/SplashScreen';
import { colors, fonts } from '../theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Tiempo mínimo que se ve la pantalla de bienvenida al abrir la app. */
const BIENVENIDA_MS = 2000;

function RootNavigator() {
  const { sesion, cargando } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const fuentesListas = fontsLoaded || Boolean(fontError);
  const [tiempoCumplido, setTiempoCumplido] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTiempoCumplido(true), BIENVENIDA_MS);
    return () => clearTimeout(t);
  }, []);

  // El splash nativo se oculta en cuanto hay fuentes para dibujar la bienvenida.
  useEffect(() => {
    if (fuentesListas) SplashScreen.hideAsync().catch(() => {});
  }, [fuentesListas]);

  if (!fuentesListas) return null;
  if (cargando || !tiempoCumplido) return <Bienvenida />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.title, color: colors.primary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Sin sesión: sólo login y registro */}
      <Stack.Protected guard={!sesion} redirectTo="/">
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Con sesión: la app según el rol */}
      <Stack.Protected guard={!!sesion} redirectTo="/bienvenida">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="libro/[id]" options={{ title: 'Detalle del libro' }} />
        <Stack.Screen name="publicar" options={{ title: 'Añadir título', presentation: 'modal' }} />
        <Stack.Screen name="admin/usuarios" options={{ title: '' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
