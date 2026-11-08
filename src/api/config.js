import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACK_PORT = 8080;

/**
 * URL del backend:
 * 1. EXPO_PUBLIC_API_URL si está definida (por ejemplo en un archivo .env).
 * 2. En desarrollo, la IP de la computadora que corre Expo (sirve en un celular físico con Expo Go).
 * 3. Emulador Android -> 10.0.2.2; web/iOS simulador -> localhost.
 */
function resolverApiUrl() {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/+$/, '');

  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${BACK_PORT}`;
    }
    if (Platform.OS === 'android') return `http://10.0.2.2:${BACK_PORT}`;
  }
  return `http://localhost:${BACK_PORT}`;
}

export const API_URL = resolverApiUrl();
