import { ServiceRepository } from '../repositories/service.repository';
import {QueueRepository} from "../repositories/queue.repository";

export const ServiceService = {
    async getAllServices() {
        return await ServiceRepository.findAll();
    },

    async getServiceById(id: string) {
        return await ServiceRepository.findById(id);
    },

    async getFilteredServices(filters: {
        locationId?: string;
        departmentId?: string;
        category?: string;
    }) {
        return ServiceRepository.findByFilters(filters);
    }
};