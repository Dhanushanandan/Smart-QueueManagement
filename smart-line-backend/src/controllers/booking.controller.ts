import { Request, Response } from 'express';
import {BookingService} from "../services/booking.service";
import {Booking} from "../models/booking.model";

export const joinQueue = async (req: Request, res: Response) => {
    try {
        const { userId, queueId } = req.body;

        const booking = await BookingService.joinQueue(userId, queueId);

        res.status(201).json(booking);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getMyQueueStatus = async (
    req: Request<{ userId: string }>,
    res: Response
) => {
    const { userId } = req.params;

    const status = await BookingService.getUserQueueStatus(userId);

    res.json(status);
};

export const getMyBookings = async (
    req: Request<{ userId: string }>,
    res: Response
) => {
    const { userId } = req.params;

    const bookings = await BookingService.getUserBookings(userId);

    res.json(bookings);
};

export const getActiveBookingsCount = async (
    req: Request<{ userId: string }>,
    res: Response
) => {
    const { userId } = req.params;

    const bookings = await BookingService.getActiveBookingsCount(userId);

    res.json(bookings);
};

export const createBooking = async (req: Request<Booking>, res: Response) => {
    try {

        const booking = await BookingService.createBooking(req.body);

        res.status(201).json(booking);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const cancelBooking = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const { id } = req.params;

        const booking = await BookingService.cancelBooking(id);

        res.json(booking);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
