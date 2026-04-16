import { useState } from 'react';
import { ScrollView, View, Text, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import SectionLabel from '../components/SectionLabel';
import { getFirebaseAuth } from '@/auth';
import {api} from "@/api/client";
import ScreenHeader from "@/components/DashboardHeader";
import {THEME} from "@/constants/theme";

const EMPTY_FORM = { name: '', dateOfBirth: '', serialNo: '', fatherName: '', motherName: '', placeOfBirth: '', district: '', sex: '', rawText: '' };

export default function UploadCertificate() {
    const auth = getFirebaseAuth();
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const set = (key: keyof typeof EMPTY_FORM) => (val: string) => setForm(f => ({ ...f, [key]: val }));

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, base64: true });
        if (!result.canceled) { setImage(result.assets[0]); setShowForm(false); setForm(EMPTY_FORM); }
    };

    const handleUpload = async () => {
        if (!image) { Alert.alert('Error', 'Please select a certificate image'); return; }
        if (!auth.currentUser) { Alert.alert('Error', 'Not authenticated'); return; }
        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken(true);
            const data: any = await api.uploadCertificate(token, image.base64);
            const d = data.certificateDetails || {};
            setForm({ name: d.name || '', dateOfBirth: d.dateOfBirth || '', serialNo: d.serialNo || '', fatherName: d.fatherName || '', motherName: d.motherName || '', placeOfBirth: d.placeOfBirth || '', district: d.district || '', sex: d.sex || '', rawText: d.rawText || '' });
            setShowForm(true);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) { Alert.alert('Error', 'Not authenticated'); return; }
        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken(true);
            await api.saveCertificateDetails(token, form);
            Alert.alert('Success', 'Details saved. Verify your email then log in.');
            router.push('/Login');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView testID="uploadCertificateScreen" contentContainerStyle={s.container}>
            <ScreenHeader title="Upload Certificate" subtitle="Upload a clear image of your birth certificate" />

            <PrimaryButton testID="chooseImageButton" label="Choose image" onPress={pickImage} />

            {image && (
                <Image testID="selectedCertificateImage" source={{ uri: image.uri }} style={s.preview} />
            )}

            <PrimaryButton
                testID="uploadExtractButton"
                label={loading ? 'Processing…' : 'Upload and extract'}
                onPress={handleUpload}
                loading={loading}
                disabled={!image}
            />

            {showForm && (
                <View testID="certificateForm" style={s.form}>
                    <SectionLabel style={{ marginTop: 24 }}>Extracted details</SectionLabel>

                    {([
                        ['certificateNameInput',        'Name',            'name'],
                        ['certificateDobInput',         'Date of birth',   'dateOfBirth'],
                        ['certificateSerialNoInput',    'Serial no.',      'serialNo'],
                        ['certificateFatherNameInput',  'Father name',     'fatherName'],
                        ['certificateMotherNameInput',  'Mother name',     'motherName'],
                        ['certificatePlaceOfBirthInput','Place of birth',  'placeOfBirth'],
                        ['certificateDistrictInput',    'District',        'district'],
                        ['certificateSexInput',         'Sex',             'sex'],
                    ] as [string, string, keyof typeof EMPTY_FORM][]).map(([tid, label, key]) => (
                        <View key={key}>
                            <Text style={s.label}>{label}</Text>
                            <FormInput testID={tid} value={form[key]} onChangeText={set(key)} />
                        </View>
                    ))}

                    <Text style={s.label}>Raw OCR text</Text>
                    <FormInput
                        testID="certificateRawTextInput"
                        value={form.rawText}
                        onChangeText={set('rawText')}
                        multiline
                        style={{ minHeight: 120, textAlignVertical: 'top' }}
                    />

                    <PrimaryButton testID="submitCertificateButton" label={loading ? 'Saving…' : 'Submit and save'} onPress={handleSubmit} loading={loading} />
                </View>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: THEME.background, padding: 24, paddingTop: 48 },
    preview: { width: '100%', height: 200, borderRadius: 12, marginVertical: 16, resizeMode: 'cover' },
    form: { width: '100%', marginTop: 8 },
    label: { fontSize: 13, color: THEME.gray, fontWeight: '600', marginBottom: 6, marginTop: 4 },
});