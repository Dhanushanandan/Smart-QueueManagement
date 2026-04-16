import { Request, Response } from 'express';
import { UserService } from "../services/user.service";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

export const getUserById = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const { id } = req.params;

        const user = await UserService.getUserById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};