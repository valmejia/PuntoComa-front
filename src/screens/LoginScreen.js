import React, { useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { IconInput } from '../components/IconInput';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** HU-02 / CU-02: inicio de sesión. El menú que se muestra depende del rol. */
export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { iniciarSesion } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const passwordRef = useRef(null);

    const handleLogin = async () => {
        const e = {};
        if (!EMAIL_RE.test(email.trim())) e.email = 'Ingresa un email válido';
        if (!password) e.password = 'Ingresa tu contraseña';
        setErrores(e);
        setErrorGeneral(null);
        if (Object.keys(e).length) return;

        setEnviando(true);
        try {
            await iniciarSesion(email, password);
        } catch (err) {
            setErrorGeneral(err.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/logo.png')} style={styles.logo} accessibilityIgnoresInvertColors />
                </View>

                <Text style={styles.title}>Punto&Coma</Text>
                <Text style={styles.subtitleBold}>Bienvenida de nuevo</Text>
                <Text style={styles.subtitleText}>Inicia sesión para explorar el catálogo y tus préstamos.</Text>

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
                        placeholder="tu.lectura@puntocoma.es"
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
                        icon="lock-closed-outline"
                        placeholder="Tu contraseña"
                        password
                        autoComplete="password"
                        returnKeyType="go"
                        onSubmitEditing={handleLogin}
                        value={password}
                        onChangeText={(v) => { setPassword(v); setErrores((x) => ({ ...x, password: undefined })); }}
                        error={errores.password}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, enviando && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={enviando}
                    accessibilityRole="button"
                    accessibilityLabel="Entrar"
                >
                    {enviando
                        ? <ActivityIndicator color={COLORS.surface} />
                        : <Text style={styles.buttonText}>Entrar →</Text>}
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.replace('/registro')} accessibilityRole="link">
                        <Text style={styles.registerLink}>Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    logoContainer: { alignItems: 'center', marginBottom: 16 },
    logo: { width: 88, height: 88 },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 36,
        color: COLORS.neutral,
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitleBold: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitleText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FCE8E6',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    errorBannerText: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: COLORS.error,
    },
    fields: { gap: 20, marginBottom: 30 },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        minHeight: 54,
        justifyContent: 'center',
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: COLORS.surface,
    },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    registerText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: COLORS.textLight,
    },
    registerLink: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: COLORS.primary,
    },
});
