import { Alert, Platform } from 'react-native';

// Alert.alert con botones no funciona en web; usamos window.confirm / window.alert ahí.

export function avisar(titulo, mensaje) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    return;
  }
  Alert.alert(titulo, mensaje);
}

export function confirmar(titulo, mensaje, textoConfirmar = 'Confirmar', destructivo = false) {
  if (Platform.OS === 'web') {
    return Promise.resolve(Boolean(globalThis.confirm?.(mensaje ? `${titulo}\n\n${mensaje}` : titulo)));
  }
  return new Promise((resolve) => {
    Alert.alert(titulo, mensaje, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: textoConfirmar, style: destructivo ? 'destructive' : 'default', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
