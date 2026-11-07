import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors'; // Importamos los colores

export default function RegisterScreen({ navigation }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleRegister = async () => {
        if (!nombre || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Por favor llena todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }
        if (!termsAccepted) {
            Alert.alert('Error', 'Debes aceptar los términos y condiciones');
            return;
        }

        try {
            const response = await fetch('http://192.168.1.25:8080/api/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('¡Éxito!', `Usuario ${data.nombre} registrado`);
                setNombre(''); setEmail(''); setPassword(''); setConfirmPassword(''); setTermsAccepted(false);
            } else {
                Alert.alert('Error del servidor', JSON.stringify(data));
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
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

                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. Gabriel García M."
                        placeholderTextColor={COLORS.textLight}
                        value={nombre}
                        onChangeText={setNombre}
                    />
                </View>

                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="tu.lectura@puntocoma.es"
                        placeholderTextColor={COLORS.textLight}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Mínimo 8 caracteres"
                        placeholderTextColor={COLORS.textLight}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirmar contraseña</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Repite tu contraseña"
                        placeholderTextColor={COLORS.textLight}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.termsContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
                    <Ionicons
                        name={termsAccepted ? "checkbox" : "square-outline"}
                        size={24}
                        color={termsAccepted ? COLORS.primary : COLORS.textLight}
                    />
                    <Text style={styles.termsText}>
                        Acepto los <Text style={styles.linkText}>términos de servicio</Text> y el acuerdo de préstamos digitales protegidos por DRM justo.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Crear cuenta →</Text>
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>¿Ya tienes una cuenta activa? </Text>
                    <TouchableOpacity>
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
        paddingTop: 60,
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
    label: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 14,
        color: COLORS.neutral,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 14,
        color: COLORS.neutral,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    termsText: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 13,
        color: COLORS.textLight,
        marginLeft: 10,
        lineHeight: 18,
    },
    linkText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 16,
        color: COLORS.surface,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
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