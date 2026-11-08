import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';
import { iniciales } from './AppHeader';

const FONDOS = ['#502583', '#7C43BD', '#8A5A12', '#2F5D50', '#7C2D3E', '#1F3A5F'];

/** "Gabriel García Márquez" -> "G. Márquez" */
function nombreCorto(nombre) {
  const partes = nombre.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0][0]}. ${partes[partes.length - 1]}` : nombre;
}

/** Avatar circular de "Top autores". */
export function AuthorAvatar({ nombre, index = 0, selected, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Libros de ${nombre}`} accessibilityState={{ selected }} style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: FONDOS[index % FONDOS.length] }, selected && styles.selected]}>
        <Text style={styles.ini}>{iniciales(nombre)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{nombreCorto(nombre)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 70, alignItems: 'center', gap: 6 },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.surface },
  selected: { borderColor: colors.amber },
  ini: { fontFamily: fonts.title, fontSize: 18, color: colors.white },
  name: { fontFamily: fonts.semibold, fontSize: 11, color: colors.text },
});
