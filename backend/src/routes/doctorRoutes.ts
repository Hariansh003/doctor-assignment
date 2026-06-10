import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = Router();
const controller = new DoctorController();

// Public routes
router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));

// Protected routes — require admin JWT
router.post('/', authenticateAdmin, (req, res) => controller.create(req, res));
router.put('/:id', authenticateAdmin, (req, res) => controller.update(req, res));
router.delete('/:id', authenticateAdmin, (req, res) => controller.delete(req, res));

export default router;
