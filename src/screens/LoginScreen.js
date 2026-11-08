import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, Pressable, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, colors, fonts, shadow } from '../theme/colors';
import { IconInput } from '../components/IconInput';
import { LogoMark } from '../components/Brand';
import { BookCover } from '../components/BookCover';
import { Segmented } from '../components/Chip';
import { publicoApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { avisar } from '../utils/dialogs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** HU-02 / CU-02: inicio de sesión (Figma "Iniciar Sesión"). El menú que se muestra depende del rol. */
export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { iniciarSesion } = useAuth();
    const [perfil, setPerfil] = useState('lector');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [recordar, setRecordar] = useState(true);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [destacado, setDestacado] = useState(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        publicoApi.portada().then((p) => setDestacado(p.destacados?.[0] ?? null)).catch(() => {});
    }, []);

    const handleLogin = async () => {
        const e = {};
        if (!EMAIL_RE.test(email.trim())) e.email = 'Ingresa un email válido';
        if (!password) e.password = 'Ingresa tu contraseña';
        setErrores(e);
        setErrorGeneral(null);
        if (Object.keys(e).length) return;

        setEnviando(true);
        try {
            await iniciarSesion(email, password, { recordar, requiereStaff: perfil === 'staff' });
        } catch (err) {
            setErrorGeneral(err.message);
        } finally {
            setEnviando(false);
        }
    };

    const volver = () => (router.canGoBack() ? router.back() : router.replace('/bienvenida'));

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity style={styles.backButton} onPress={volver} accessibilityRole="button" accessibilityLabel="Volver">
                    <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={styles.logoContainer}><LogoMark size={56} /></View>
                <Text style={styles.title}>Punto&Coma</Text>
                <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

                <View style={styles.segmento}>
                    <Segmented
                        value={perfil}
                        onChange={setPerfil}
                        options={[
                            { value: 'lector', label: 'Lector', icon: 'book-outline' },
                            { value: 'staff', label: 'Vendedor / Admin', icon: 'storefront-outline' },
                        ]}
                    />
                </View>

                {errorGeneral ? (
                    <View style={styles.errorBanner} accessibilityRole="alert">
                        <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                        <Text style={styles.errorBannerText}>{errorGeneral}</Text>
                    </View>
                ) : null}

                <View style={styles.fields}>
                    <IconInput
                        label="Correo electrónico"
                        icon="mail-outline"
                        placeholder="ejemplo@puntocoma.es"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        value={email}
                        onChangeText={(v) => { setEmail(v); setErrores((x) => ({ ...x, email: undefined })); }}
                        error={errores.email}
                    />
                    <IconInput
                        ref={passwordRef}
                        label="Contraseña"
                        labelRight={
                            <Text
                                style={styles.olvido}
                                onPress={() => avisar('Recuperar contraseña', 'Por ahora pide a un administrador que restablezca tu cuenta. La recuperación por correo llegará en una próxima versión.')}
                                accessibilityRole="button"
                            >
                                ¿Olvidaste tu contraseña?
                            </Text>
                        }
                        icon="lock-closed-outline"
                        placeholder="••••••••••"
                        password
                        autoComplete="password"
                        returnKeyType="go"
                        onSubmitEditing={handleLogin}
                        value={password}
                        onChangeText={(v) => { setPassword(v); setErrores((x) => ({ ...x, password: undefined })); }}
                        error={errores.password}
                    />
                </View>

                <View style={styles.recordarRow}>
                    <Pressable
                        style={styles.recordar}
                        onPress={() => setRecordar(!recordar)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: recordar }}
                        accessibilityLabel="Recordar sesión"
                    >
                        <Ionicons name={recordar ? 'checkbox' : 'square-outline'} size={22} color={COLORS.primary} />
                        <Text style={styles.recordarText}>Recordar sesión</Text>
                    </Pressable>
                    <View style={styles.seguro}>
                        <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.textLight} />
                        <Text style={styles.seguroText}>Seguro</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, enviando && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={enviando}
                    accessibilityRole="button"
                    accessibilityLabel="Iniciar Sesión"
                >
                    {enviando
                        ? <ActivityIndicator color={COLORS.surface} />
                        : <Text style={styles.buttonText}>Iniciar Sesión →</Text>}
                </TouchableOpacity>

                {destacado ? (
                    <View style={styles.destacado} accessible accessibilityLabel={`Lectura destacada: ${destacado.titulo}`}>
                        <BookCover libro={destacado} width={40} height={58} />
                        <View style={styles.flex}>
                            <Text style={styles.destacadoTag}>LECTURA DESTACADA DEL MES</Text>
                            <Text style={styles.destacadoTitulo} numberOfLines={1}>{destacado.titulo}</Text>
                            <Text style={styles.destacadoSub} numberOfLines={1}>{destacado.autor} · Inicia sesión para verlo</Text>
                        </View>
                    </View>
                ) : null}

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.replace('/registro')} accessibilityRole="link">
                        <Text style={styles.registerLink}>Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 24, width: '100%', maxWidth: 480, alignSelf: 'center' },
    backButton: {
        backgroundColor: COLORS.surface, width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...shadow,
    },
    logoContainer: { alignItems: 'center', marginBottom: 14 },
    title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: COLORS.neutral, textAlign: 'center' },
    subtitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: COLORS.textLight, textAlign: 'center', marginTop: 4, marginBottom: 24 },
    segmento: { marginBottom: 22 },
    errorBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FCE8E6',
        borderRadius: 10, padding: 12, marginBottom: 18,
    },
    errorBannerText: { flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: COLORS.error },
    fields: { gap: 18 },
    olvido: { fontFamily: fonts.semibold, fontSize: 12, color: COLORS.secondary },
    recordarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 22 },
    recordar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36 },
    recordarText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: COLORS.neutral },
    seguro: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seguroText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: COLORS.textLight },
    button: {
        backgroundColor: COLORS.primary, minHeight: 54, justifyContent: 'center', borderRadius: 999,
        alignItems: 'center', marginBottom: 22,
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: COLORS.surface },
    destacado: {
        flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 22,
        backgroundColor: colors.lilac, borderRadius: 16, borderWidth: 1, borderColor: '#C9DAF8',
    },
    destacadoTag: { fontFamily: fonts.bold, fontSize: 10, color: COLORS.tertiary, letterSpacing: 0.5 },
    destacadoTitulo: { fontFamily: fonts.title, fontSize: 17, color: COLORS.neutral },
    destacadoSub: { fontFamily: fonts.regular, fontSize: 12, color: COLORS.textLight },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    registerText: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: COLORS.textLight },
    registerLink: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: COLORS.primary },
});
