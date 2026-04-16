import Tesseract from 'tesseract.js';

export async function extractCertificateData(imageBase64: string) {
    const buffer = Buffer.from(imageBase64, 'base64');

    const result = await Tesseract.recognize(buffer, 'eng', {
        logger: () => {}
    });

    const text = result.data.text || '';

    return {
        rawText: text
        // you can plug your extractFields logic here
    };
}