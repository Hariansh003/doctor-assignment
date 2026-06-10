import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();
const controller = new BookingController();

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.findAll(req, res));

export default router;
