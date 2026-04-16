import { Router } from 'express';
import {getFilteredServices, getServiceById, getServices} from '../controllers/service.controller';

const router = Router();

router.get('/', getServices);
router.get('/filter', getFilteredServices);
router.get('/:serviceId', getServiceById);


export default router;