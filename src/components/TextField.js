import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

export const TextField = forwardRef(function TextField({ label, error, hint, style, multiline, ...props }, ref) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        accessibilityLabel={label}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text },
  input: {
    fontFamily: fonts.regular,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E4D9F5',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FBF9FF',
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.danger },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
