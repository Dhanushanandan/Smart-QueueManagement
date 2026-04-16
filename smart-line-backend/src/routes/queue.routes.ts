import { Router } from 'express';
import {
    getQueues,
    getQueueByService,
    nextQueue,
    createQueue,
    getQueueById, getQueuesByIds, getMyPosition
} from '../controllers/queue.controller';

const router = Router();

router.get('/', getQueues);
router.get('/:id', getQueueById);
router.get('/service/:serviceId', getQueueByService);
router.post('/:id/next', nextQueue);
router.post('/create/:res',createQueue);
router.get('/filter/', getQueuesByIds)
router.get('/my-position', getMyPosition);


export default router;