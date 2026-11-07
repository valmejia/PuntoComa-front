import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {

    // Simulamos una carga de 3 segundos y luego pasamos al Registro (o Login)
    useEffect(() => {
        const timer = setTimeout(() => {
            // Cambia 'Register' por 'Login' cuando tengas esa pantalla lista
            navigation.replace('Register');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <LinearGradient
            // Degradado sutil de lila a blanco (puedes ajustar los colores aquí)
            colors={['#F8F4FF', '#FFFFFF', '#F3E8FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* HEADER: Volumen y Premium */}
            <View style={styles.header}>
                <View style={styles.volContainer}>
                    <View style={styles.volDot} />
                    <Text style={styles.volText}>VOL. IV</Text>
                </View>
                <View style={styles.premiumBadge}>
                    <Ionicons name="bookmark" size={12} color={COLORS.secondary} />
                    <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
            </View>

            {/* CENTRO: Logo, Título y Frase */}
            <View style={styles.centerContent}>
                {/* Aquí irá tu imagen. Asegúrate de tener logo.png en src/assets */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../assets/logo.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    {/* El badge amarillo de la estrella */}
                    <View style={styles.badgeContainer}>
                        <Ionicons name="star" size={14} color="white" />
                    </View>
                </View>

                <Text style={styles.title}>Punto&Coma</Text>
                <Text style={styles.subtitle}>LIBRERÍA & EDITORIAL DIGITAL</Text>

                <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>“ Historias que dejan huella ”</Text>
                </View>
            </View>

            {/* FOOTER: Barra de carga y créditos */}
            <View style={styles.footer}>
                {/* Barra de progreso (simulada) */}
                <View style={styles.progressBarContainer}>
                    <LinearGradient
                        colors={[COLORS.secondary, COLORS.tertiary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressBarFill}
                    />
                </View>

                <View style={styles.loadingRow}>
                    <View style={styles.loadingDot} />
                    <Text style={styles.loadingText}>Preparando el catálogo editorial...</Text>
                </View>

                <Text style={styles.versionText}>V2.4.0 • EDICIÓN 2024</Text>
                <Text style={styles.companyText}>Punto&Coma Editorial S.L.</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    volContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    volDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.secondary,
        marginRight: 8,
    },
    volText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 12,
        color: COLORS.primary,
        letterSpacing: 1,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBE1F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    premiumText: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 10,
        color: COLORS.secondary,
        marginLeft: 5,
        letterSpacing: 0.5,
    },
    centerContent: {
        alignItems: 'center',
        marginTop: -50, // Ajuste óptico para centrar
    },
    logoWrapper: {
        position: 'relative',
        marginBottom: 30,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    logoImage: {
        width: 140,
        height: 140,
        borderRadius: 30,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        backgroundColor: COLORS.tertiary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 38,
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 12,
        color: COLORS.secondary,
        letterSpacing: 2,
        marginBottom: 40,
    },
    quoteContainer: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    quoteText: {
        fontFamily: 'PlayfairDisplay_700Bold', // O usa una fuente italic si la tienes
        fontStyle: 'italic',
        fontSize: 14,
        color: COLORS.textLight,
    },
    footer: {
        alignItems: 'center',
        width: '100%',
    },
    progressBarContainer: {
        width: width * 0.7,
        height: 4,
        backgroundColor: '#E0D4F5',
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '60%', // Simula el 60% de carga
        height: '100%',
        borderRadius: 2,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.secondary,
        marginRight: 8,
    },
    loadingText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 12,
        color: COLORS.primary,
    },
    versionText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 10,
        color: COLORS.textLight,
        letterSpacing: 1,
        marginBottom: 4,
    },
    companyText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 10,
        color: COLORS.textLight,
    },
});