import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return null;
    const asset = result.assets[0];
    return { uri: asset.uri, name: asset.name, type: asset.mimeType, size: asset.size };
  } catch (error) { Alert.alert('Error', 'Failed to pick document.'); return null; }
};

export const pickImage = async (source = 'gallery') => {
  try {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Camera permission is required.'); return null; }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Gallery permission is required.'); return null; }
    }
    const pickerMethod = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await pickerMethod({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (result.canceled) return null;
    const asset = result.assets[0];
    return { uri: asset.uri, name: `image_${Date.now()}.jpg`, type: 'image/jpeg', width: asset.width, height: asset.height };
  } catch (error) { Alert.alert('Error', 'Failed to pick image.'); return null; }
};

export const pickDocumentWithType = async (docType) => {
  return new Promise((resolve) => {
    Alert.alert('Select Source', 'Choose where to pick the document from', [
      { text: '📁 Files', onPress: async () => { const doc = await pickDocument(); if (doc) resolve({ ...doc, documentType: docType, uploadDate: new Date().toISOString() }); else resolve(null); } },
      { text: '📷 Camera', onPress: async () => { const img = await pickImage('camera'); if (img) resolve({ ...img, documentType: docType, uploadDate: new Date().toISOString() }); else resolve(null); } },
      { text: '🖼️ Gallery', onPress: async () => { const img = await pickImage('gallery'); if (img) resolve({ ...img, documentType: docType, uploadDate: new Date().toISOString() }); else resolve(null); } },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
};