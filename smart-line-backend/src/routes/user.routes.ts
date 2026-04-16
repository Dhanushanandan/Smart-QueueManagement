import { Router } from 'express';
import {getUserById, getUsers} from "../controllers/user.controller";


const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;