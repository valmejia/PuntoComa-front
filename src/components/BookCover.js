import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

// Portadas generadas con la paleta editorial del Figma.
const FONDOS = ['#502583', '#1F3A5F', '#7C2D3E', '#2F5D50', '#8A5A12', '#3B2F63', '#5B2A86'];

/** Portada del libro; si no hay URL (o falla) se dibuja una portada editorial con título y autor. */
export function BookCover({ libro, width = 72, height = 104 }) {
  const [fallo, setFallo] = useState(false);
  const r = Math.max(4, width * 0.06);
  if (libro.portadaUrl && !fallo) {
    return (
      <Image
        source={{ uri: libro.portadaUrl }}
        style={[styles.cover, { width, height, borderRadius: r }]}
        onError={() => setFallo(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  const fondo = FONDOS[(libro.id ?? 0) % FONDOS.length];
  const grande = width >= 90;
  return (
    <View style={[styles.cover, styles.generada, { width, height, borderRadius: r, backgroundColor: fondo }]}>
      <View style={styles.lomo} />
      {width >= 64 ? (
        <>
          <Text numberOfLines={grande ? 4 : 3} style={[styles.titulo, { fontSize: Math.max(9, width * 0.12) }]}>
            {libro.titulo}
          </Text>
          <View style={styles.filete} />
          {grande && libro.autor ? (
            <Text numberOfLines={1} style={[styles.autor, { fontSize: Math.max(8, width * 0.07) }]}>{libro.autor}</Text>
          ) : null}
        </>
      ) : (
        <Ionicons name={libro.formato === 'DIGITAL' ? 'tablet-portrait-outline' : 'book-outline'} size={width * 0.38} color="#FFFFFFCC" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { backgroundColor: colors.border, overflow: 'hidden' },
  generada: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingLeft: 12, gap: 6 },
  lomo: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: '#00000033' },
  titulo: { fontFamily: fonts.title, color: colors.white, textAlign: 'center' },
  filete: { width: '35%', height: 1, backgroundColor: '#FFFFFF88' },
  autor: { fontFamily: fonts.semibold, color: '#FFFFFFCC', textAlign: 'center', letterSpacing: 0.5 },
});
