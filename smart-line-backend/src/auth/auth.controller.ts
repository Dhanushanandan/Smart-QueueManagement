import { Request, Response } from 'express';
import { AuthService } from './auth.service';

function getToken(req: Request) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new Error('No token');
    return auth.split('Bearer ')[1];
}

export const savePendingUser = async (req: Request, res: Response) => {
    try {
        const token = getToken(req);
        const decoded = await AuthService.verifyToken(token);

        await AuthService.savePendingUser(decoded.uid, req.body);

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const uploadCertificate = async (req: Request, res: Response) => {
    try {
        const token = getToken(req);
        await AuthService.verifyToken(token);

        const result = await AuthService.processCertificate(req.body.imageBase64);

        res.json(result);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const checkUserNode = async (req: Request, res: Response) => {
    try {
        const token = getToken(req);
        const decoded = await AuthService.verifyToken(token);

        const result = await AuthService.checkUserNode(decoded.uid);

        res.json(result);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const checkPendingEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) throw new Error('Email is required');

        const result = await AuthService.checkPendingEmail(email);

        res.json(result);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const finalizeUser = async (req: Request, res: Response) => {
    try {
        const token = getToken(req);
        const decoded = await AuthService.verifyToken(token);

        await AuthService.finalizeUser(decoded.uid);

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const saveCertificateDetails = async (req: Request, res: Response) => {
    try {
        const token = getToken(req);
        const decoded = await AuthService.verifyToken(token);

        await AuthService.saveCertificate(decoded.uid, req.body);

        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}