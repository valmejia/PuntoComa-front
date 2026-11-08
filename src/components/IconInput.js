import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';

/** Campo con ícono del diseño de Figma (registro / login). `password` agrega el botón de ver/ocultar. */
export const IconInput = forwardRef(function IconInput({ label, icon, error, password = false, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Ionicons name={icon} size={20} color={COLORS.textLight} style={styles.icon} />
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={password && !visible}
          accessibilityLabel={label}
          {...props}
        />
        {password ? (
          <TouchableOpacity
            onPress={() => setVisible(!visible)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={10}
          >
            <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
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
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.error },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.neutral,
  },
  error: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.error,
    marginTop: 6,
  },
});
