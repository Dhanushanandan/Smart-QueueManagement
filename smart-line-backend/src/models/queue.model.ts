export interface Queue {
    id: string;

    serviceId: string;
    name: string;

    locationId: string;
    departmentId: string;

    currentNumber: number;
    lastPosition: number;

    estimatedWaitTime: number;

    avgServiceTime?: number;
    status?: 'active' | 'paused' | 'closed';
}