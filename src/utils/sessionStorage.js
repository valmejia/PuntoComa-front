import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'puntocoma.sesion';

// expo-secure-store no funciona en web; ahí usamos localStorage.
export async function guardarSesion(sesion) {
  const valor = JSON.stringify(sesion);
  if (Platform.OS === 'web') {
    try { globalThis.localStorage?.setItem(KEY, valor); } catch {}
    return;
  }
  await SecureStore.setItemAsync(KEY, valor);
}

export async function leerSesion() {
  try {
    const valor = Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

export async function borrarSesion() {
  if (Platform.OS === 'web') {
    try { globalThis.localStorage?.removeItem(KEY); } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
