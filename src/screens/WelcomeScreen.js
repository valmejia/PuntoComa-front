import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { publicoApi } from '../api/services';
import { BrandInline } from '../components/Brand';
import { BookCover } from '../components/BookCover';
import { Button } from '../components/Button';
import { colors, COLORS, fonts, radius, shadow } from '../theme/colors';

// Portadas de respaldo mientras carga o si el servidor no responde.
const RESPALDO = [
  { id: 3, titulo: 'El arte de la calma', autor: 'Ed. ilustrada' },
  { id: 0, titulo: 'Punto&Coma', autor: 'Selección' },
  { id: 6, titulo: 'Universo fractal', autor: 'Ensayo' },
];

const FUNCIONES = [
  { icon: 'cube-outline', titulo: 'Libro Físico', sub: 'Préstamo y venta' },
  { icon: 'tablet-portrait-outline', titulo: 'E-Book', sub: 'PDF y EPUB' },
  { icon: 'repeat-outline', titulo: 'Préstamo', sub: 'Hasta 30 días' },
];

/** Pantalla de bienvenida (Figma "Bienvenida"). Usa datos reales públicos del back. */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [portada, setPortada] = useState(null);

  useEffect(() => {
    publicoApi.portada().then(setPortada).catch(() => setPortada(null));
  }, []);

  const libros = [...(portada?.destacados ?? []), ...RESPALDO].slice(0, 3);
  // El libro más reciente va al centro, al frente.
  const abanico = [libros[1], libros[0], libros[2]];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
    >
      <BrandInline />

      <LinearGradient colors={['#FFFFFF', '#F3ECFF']} style={styles.hero}>
        <View style={styles.seleccion}>
          <Ionicons name="star" size={11} color={COLORS.tertiary} />
          <Text style={styles.seleccionText}>SELECCIÓN EDITORIAL DEL MES</Text>
        </View>
        <View style={styles.abanico} accessible accessibilityLabel={`Libros destacados: ${libros.map((l) => l.titulo).join(', ')}`}>
          <View style={[styles.lateral, { transform: [{ rotate: '-9deg' }, { translateX: 22 }] }]}>
            <BookCover libro={abanico[0]} width={92} height={132} />
          </View>
          <View style={styles.central}>
            <BookCover libro={abanico[1]} width={104} height={150} />
          </View>
          <View style={[styles.lateral, { transform: [{ rotate: '9deg' }, { translateX: -22 }] }]}>
            <BookCover libro={abanico[2]} width={92} height={132} />
          </View>
        </View>
        <View style={styles.stats}>
          <Stat valor={portada?.titulos} etiqueta="Títulos" />
          <View style={styles.sep} />
          <Stat valor={portada?.autores} etiqueta="Autores" />
          <View style={styles.sep} />
          <Stat valor={portada?.lectores} etiqueta="Lectores" />
        </View>
      </LinearGradient>

      <View style={styles.pill}>
        <Ionicons name="book-outline" size={13} color={colors.primary} />
        <Text style={styles.pillText}>LIBRERÍA • BIBLIOTECA</Text>
      </View>

      <Text style={styles.titulo} accessibilityRole="header">
        Tu próxima gran <Text style={styles.tituloItalica}>lectura</Text> te espera
      </Text>
      <Text style={styles.descripcion}>
        Encuentra ejemplares en papel, consigue ediciones digitales al instante o pide préstamos de la comunidad de lectores.
      </Text>

      <View style={styles.funciones}>
        {FUNCIONES.map((f) => (
          <View key={f.titulo} style={styles.funcion}>
            <View style={styles.funcionIcon}><Ionicons name={f.icon} size={18} color={colors.primary} /></View>
            <Text style={styles.funcionTitulo}>{f.titulo}</Text>
            <Text style={styles.funcionSub}>{f.sub}</Text>
          </View>
        ))}
      </View>

      <Button title="Comenzar a explorar" iconRight="arrow-forward" onPress={() => router.push('/registro')} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ya tengo una cuenta</Text>
        <Text style={styles.footerDot}>•</Text>
        <Pressable onPress={() => router.push('/login')} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.footerLink}>Iniciar Sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ valor, etiqueta }) {
  return (
    <Text style={styles.stat}>
      <Text style={styles.statValor}>{valor ?? '—'}</Text> {etiqueta}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, gap: 18, width: '100%', maxWidth: 480, alignSelf: 'center' },
  hero: { borderRadius: 24, paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center', gap: 14, ...shadow },
  seleccion: {
    flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#F7D58A',
    backgroundColor: colors.amberLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
  },
  seleccionText: { fontFamily: fonts.bold, fontSize: 10, color: colors.warning, letterSpacing: 0.6 },
  abanico: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 160 },
  lateral: { ...shadow, shadowOpacity: 0.2, marginBottom: 4 },
  central: { zIndex: 2, ...shadow, shadowOpacity: 0.3, shadowRadius: 16 },
  stats: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.cardBorder,
  },
  stat: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  statValor: { fontFamily: fonts.bold, fontSize: 12, color: colors.text },
  sep: { width: 1, height: 12, backgroundColor: colors.border },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
    backgroundColor: colors.lilacStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
  },
  pillText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary, letterSpacing: 0.6 },
  titulo: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, textAlign: 'center' },
  tituloItalica: { fontFamily: fonts.title, fontStyle: 'italic', color: colors.secondary },
  descripcion: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  funciones: { flexDirection: 'row', gap: 10 },
  funcion: {
    flex: 1, alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 14, paddingHorizontal: 6, borderWidth: 1, borderColor: colors.cardBorder,
  },
  funcionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.lilacStrong, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  funcionTitulo: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, textAlign: 'center' },
  funcionSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: colors.lilac, borderRadius: 999, paddingVertical: 10,
  },
  footerText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  footerDot: { color: colors.secondary },
  footerLink: { fontFamily: fonts.bold, fontSize: 13, color: colors.secondary },
});
