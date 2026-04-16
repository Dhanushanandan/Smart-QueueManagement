import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';

export const getQueues = async (res: Response) => {
    const queues = await QueueService.getAllQueues();
    res.json(queues);
};



export const getQueueByService = async (
    req: Request<{ serviceId: string }>,
    res: Response
) => {
    try {
        const { serviceId } = req.params; // ✅ FIXED

        if (!serviceId) {
            return res.status(400).json({ message: 'serviceId is required' });
        }

        const queues = await QueueService.getQueuesByService(serviceId);

        res.json(queues);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch queues' });
    }
};

export const nextQueue = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    const { id } = req.params;

    const updated = await QueueService.moveQueue(id);

    if (!updated) {
        return res.status(404).json({ message: 'Queue not found' });
    }

    res.json(updated);
};

export const getQueueById = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    const { id } = req.params;

    const updated = await QueueService.getQueueById(id);

    if (!updated) {
        return res.status(404).json({ message: 'Queue not found' });
    }

    res.json(updated);
};

export const createQueue = async (req: Request, res: Response) => {
    const { id, name, serviceId, currentNumber, lastPosition, estimatedWaitTime, locationId, departmentId } = req.body;

    if (!id || !serviceId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const queue = await QueueService.createQueue({
        id,
        serviceId,
        name,
        currentNumber: currentNumber || 0,
        lastPosition: lastPosition || 0,
        estimatedWaitTime: estimatedWaitTime || 0,
        locationId: locationId || null,
        departmentId: departmentId || null
    });

    res.status(201).json(queue);
};

export const getQueuesByIds = async (req: Request, res: Response) => {
    try {
        const { locationId, departmentId, serviceId } = req.query;

        const queues = await QueueService.getQueuesByIds({
            locationId: locationId as string,
            departmentId: departmentId as string,
            serviceId: serviceId as string
        });

        res.json(queues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch queues' });
    }
};

export const getMyPosition = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        const queueId = req.query.queueId as string;

        if (!userId || !queueId) {
            return res.status(400).json({
                message: 'userId and queueId are required'
            });
        }

        const result = await QueueService.getMyPosition(userId, queueId);

        res.json(result);
    } catch (error: any) {
        res.status(404).json({
            message: error.message || 'Failed to get position'
        });
    }
};