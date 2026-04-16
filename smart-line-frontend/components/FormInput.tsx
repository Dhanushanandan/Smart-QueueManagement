import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { THEME } from '@/constants/theme';

interface Props extends TextInputProps {
    testID?: string;
}

export default function FormInput({ style, ...props }: Props) {
    return (
        <TextInput
            style={[s.input, style]}
            placeholderTextColor={THEME.gray}
            {...props}
        />
    );
}

const s = StyleSheet.create({
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 14,
        color: THEME.text,
        fontSize: 15,
    },
});