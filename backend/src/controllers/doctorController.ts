import { Request, Response } from 'express';
import { DoctorService } from '../services/doctorService';
import { createDoctorSchema, updateDoctorSchema, doctorFilterSchema } from '../validators';

const doctorService = new DoctorService();

export class DoctorController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createDoctorSchema.parse(req.body);
      const doctor = await doctorService.create(validated);
      res.status(201).json({ success: true, data: doctor });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create doctor' });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = doctorFilterSchema.parse(req.query);
      const doctors = await doctorService.findAll(filters);
      res.json({ success: true, data: doctors });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Invalid filter parameters',
          details: error.errors,
        });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await doctorService.findById(req.params.id);
      if (!doctor) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }
      res.json({ success: true, data: doctor });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch doctor' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const validated = updateDoctorSchema.parse(req.body);
      const doctor = await doctorService.update(req.params.id, validated);
      if (!doctor) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }
      res.json({ success: true, data: doctor });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to update doctor' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await doctorService.delete(req.params.id);
      if (!doctor) {
        res.status(404).json({ success: false, error: 'Doctor not found' });
        return;
      }
      res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete doctor' });
    }
  }
}
