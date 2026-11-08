// Paleta del diseño en Figma (CA-08).
export const COLORS = {
    primary: '#502583',
    secondary: '#7C43BD',
    tertiary: '#F59E0B', // Amarillo (útil para alertas o estrellas)
    neutral: '#1E1B2E',  // Color oscuro para textos principales
    background: '#F1EBFF', // El lila claro que me indicaste
    surface: '#FFFFFF',  // Blanco para tarjetas o inputs
    textLight: '#7C7C7C', // Gris para textos secundarios
    border: '#D1C4E9',   // Un lila grisáceo para bordes
    error: '#ba1a1a',    // Rojo para errores
    success: '#388E3C',  // Verde para éxito
};

// Nombres usados por los componentes de la app; todos salen de COLORS.
export const colors = {
  primary: COLORS.primary,
  primaryDark: '#3A1A62',
  primaryLight: '#EBE1F5',
  secondary: COLORS.secondary,
  accent: COLORS.tertiary,
  background: COLORS.background,
  surface: COLORS.surface,
  text: COLORS.neutral,
  textMuted: COLORS.textLight,
  border: COLORS.border,
  success: COLORS.success,
  successLight: '#E4F2E5',
  warning: '#B26A00',
  warningLight: '#FFF1DB',
  danger: COLORS.error,
  dangerLight: '#FCE8E6',
  white: '#FFFFFF',
};

// Tipografías del diseño (se cargan en src/app/_layout.js).
export const fonts = {
  title: 'PlayfairDisplay_700Bold',
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
