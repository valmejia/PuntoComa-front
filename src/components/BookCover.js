import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, fonts } from '../theme/colors';

const FONDOS = ['#4A2878', '#6B3FA0', '#2E5E8C', '#8C3B5E', '#2E7D6B', '#9C5B1F'];

/** Portada del libro; si no hay URL (o falla) se dibuja una portada generada con el título. */
export function BookCover({ libro, width = 72, height = 104 }) {
  const [fallo, setFallo] = useState(false);
  if (libro.portadaUrl && !fallo) {
    return (
      <Image
        source={{ uri: libro.portadaUrl }}
        style={[styles.cover, { width, height }]}
        onError={() => setFallo(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  const fondo = FONDOS[(libro.id ?? 0) % FONDOS.length];
  return (
    <View style={[styles.cover, styles.placeholder, { width, height, backgroundColor: fondo }]}>
      <Ionicons name={libro.formato === 'DIGITAL' ? 'tablet-portrait-outline' : 'book-outline'} size={width * 0.3} color="#FFFFFFCC" />
      {width >= 70 ? (
        <Text numberOfLines={3} style={[styles.title, { fontFamily: fonts.regular, fontSize: width * 0.12 }]}>{libro.titulo}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { borderRadius: radius.sm, backgroundColor: colors.border },
  placeholder: { alignItems: 'center', justifyContent: 'center', padding: 6, gap: 4 },
  title: { color: colors.white, fontFamily: fonts.bold, textAlign: 'center' },
});
