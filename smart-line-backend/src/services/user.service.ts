import { UserRepository } from "../repositories/user.repository";

export const UserService = {

    async getAllUsers() {
        return await UserRepository.findAll();
    },

    async getUserById(uid: string) {
        return await UserRepository.findById(uid);
    }
};