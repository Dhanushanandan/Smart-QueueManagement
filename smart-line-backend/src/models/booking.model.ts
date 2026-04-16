export type BookingStatus = 'WAITING' | 'SERVED' | 'CANCELLED';

export interface Booking {
    id: string;
    userId: string;
    queueId: string;
    position: number;
    status: BookingStatus;
    createdAt: Date;
    servedAt?: Date;
    cancelledAt?: Date;
}