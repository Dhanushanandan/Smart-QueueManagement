import {ServiceRepository} from "../repositories/service.repository";

export const DashboardService = {

    async getStats() {
        const services = await ServiceRepository.findAll();

        const departments = new Set();
        const locations = new Set();

        services.forEach(service => {
            if (service.department?.id) {
                departments.add(service.department.id);
            }
            if (service.location?.id) {
                locations.add(service.location.id);
            }
        });

        return {
            totalServices: services.length,
            totalDepartments: departments.size,
            totalLocations: locations.size
        };
    }
};