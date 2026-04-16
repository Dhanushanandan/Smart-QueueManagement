import {DashboardService} from "../services/dashboard.service";
import { Request, Response } from 'express';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await DashboardService.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};