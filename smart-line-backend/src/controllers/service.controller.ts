import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';

export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await ServiceService.getAllServices();
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch services' });
    }
};

export const getServiceById = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;

        if (Array.isArray(serviceId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const service = await ServiceService.getServiceById(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }


        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch service' });
    }
};

export const getFilteredServices = async (req: Request, res: Response) => {
    try {
        const { locationId, departmentId, category } = req.query;

        const services = await ServiceService.getFilteredServices({
            locationId: locationId as string,
            departmentId: departmentId as string,
            category: category as string
        });

        res.json(services);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch services'
        });
    }
};