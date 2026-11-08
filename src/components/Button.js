import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme/colors';

const VARIANTES = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  secondary: { bg: colors.lilacStrong, fg: colors.primary, border: colors.lilacStrong },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
  dangerOutline: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
};

/** Botón tipo pill del diseño. `iconRight` coloca el ícono a la derecha ("Iniciar Sesión →"). */
export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, icon, iconRight, small = false, style, accessibilityLabel }) {
  const v = VARIANTES[variant];
  const inactivo = disabled || loading;
  const ic = (name) => <Ionicons name={name} size={small ? 15 : 18} color={v.fg} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactivo, busy: loading }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: v.bg, borderColor: v.border },
        variant === 'primary' && !small && styles.elevado,
        inactivo && styles.disabled,
        pressed && !inactivo && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? ic(icon) : null}
          <Text style={[styles.text, small && styles.textSmall, { color: v.fg }]}>{title}</Text>
          {iconRight ? ic(iconRight) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  elevado: {
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  small: { minHeight: 38, paddingHorizontal: 14 },
  text: { fontFamily: fonts.bold, fontSize: 15 },
  textSmall: { fontSize: 13 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
