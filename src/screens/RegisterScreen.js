import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors'; // Importamos los colores
import { IconInput } from '../components/IconInput';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** HU-01 / CU-01: registro (rol USUARIO por defecto). Al terminar inicia sesión automáticamente. */
export default function RegisterScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { registrarse } = useAuth();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState(null);
    const [enviando, setEnviando] = useState(false);

    // Al escribir en un campo se borra su error.
    const cambiar = (setter, campo) => (valor) => {
        setter(valor);
        setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
    };

    const handleRegister = async () => {
        const e = {};
        if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
        if (!EMAIL_RE.test(email.trim())) e.email = 'El formato del email no es válido';
        if (password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres';
        if (confirmPassword !== password) e.confirmPassword = 'Las contraseñas no coinciden';
        if (!termsAccepted) e.terms = 'Debes aceptar los términos y condiciones';
        setErrores(e);
        setErrorGeneral(null);
        if (Object.keys(e).length) return;

        setEnviando(true);
        try {
            await registrarse({ nombre, email, password });
            // Con la sesión iniciada, el layout raíz lleva al catálogo.
        } catch (err) {
            if (err.errores) setErrores(err.errores);
            setErrorGeneral(err.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace('/login')}
                    accessibilityRole="button"
                    accessibilityLabel="Volver a iniciar sesión"
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>;</Text>
                    </View>
                </View>

                <Text style={styles.title}>Punto&Coma</Text>
                <Text style={styles.subtitleBold}>Crea tu cuenta</Text>
                <Text style={styles.subtitleText}>
                    Únete a la comunidad de lectores apasionados y libros independientes.
                </Text>

                {errorGeneral ? (
                    <View style={styles.errorBanner} accessibilityRole="alert">
                        <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                        <Text style={styles.errorBannerText}>{errorGeneral}</Text>
                    </View>
                ) : null}

                <View style={styles.fields}>
                    <IconInput
                        label="Nombre completo"
                        icon="person-outline"
                        placeholder="Ej. Gabriel García M."
                        autoComplete="name"
                        value={nombre}
                        onChangeText={cambiar(setNombre, 'nombre')}
                        error={errores.nombre}
                    />
                    <IconInput
                        label="Correo electrónico"
                        icon="mail-outline"
                        placeholder="tu.lectura@puntocoma.es"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={email}
                        onChangeText={cambiar(setEmail, 'email')}
                        error={errores.email}
                    />
                    <IconInput
                        label="Contraseña"
                        icon="lock-closed-outline"
                        placeholder="Mínimo 8 caracteres"
                        password
                        autoComplete="new-password"
                        value={password}
                        onChangeText={cambiar(setPassword, 'password')}
                        error={errores.password}
                    />
                    <IconInput
                        label="Confirmar contraseña"
                        icon="lock-closed-outline"
                        placeholder="Repite tu contraseña"
                        password
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChangeText={cambiar(setConfirmPassword, 'confirmPassword')}
                        error={errores.confirmPassword}
                    />
                </View>

                <TouchableOpacity
                    style={styles.termsContainer}
                    onPress={() => { setTermsAccepted(!termsAccepted); setErrores((e) => ({ ...e, terms: undefined })); }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: termsAccepted }}
                >
                    <Ionicons
                        name={termsAccepted ? "checkbox" : "square-outline"}
                        size={24}
                        color={termsAccepted ? COLORS.primary : errores.terms ? COLORS.error : COLORS.textLight}
                    />
                    <Text style={styles.termsText}>
                        Acepto los <Text style={styles.linkText}>términos de servicio</Text> y el acuerdo de préstamos digitales protegidos por DRM justo.
                    </Text>
                </TouchableOpacity>
                {errores.terms ? <Text style={styles.termsError}>{errores.terms}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, enviando && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={enviando}
                    accessibilityRole="button"
                    accessibilityLabel="Crear cuenta"
                >
                    {enviando
                        ? <ActivityIndicator color={COLORS.surface} />
                        : <Text style={styles.buttonText}>Crear cuenta →</Text>}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>¿Ya tienes una cuenta activa? </Text>
                    <TouchableOpacity onPress={() => router.replace('/login')} accessibilityRole="link">
                        <Text style={styles.loginLink}>Inicia sesión</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    backButton: {
        backgroundColor: COLORS.surface,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    logoBox: {
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: COLORS.surface,
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: -5,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold', // Tipografía del diseño
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
    fields: {
        gap: 20,
        marginBottom: 25,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    termsText: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: COLORS.textLight,
        marginLeft: 10,
        lineHeight: 18,
    },
    termsError: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: COLORS.error,
        marginLeft: 34,
    },
    linkText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        minHeight: 54,
        justifyContent: 'center',
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 17,
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: COLORS.surface,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 30,
    },
    loginText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: COLORS.textLight,
    },
    loginLink: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 14,
        color: COLORS.primary,
    },
});
