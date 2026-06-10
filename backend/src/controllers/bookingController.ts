import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { createBookingSchema } from '../validators';

const bookingService = new BookingService();

export class BookingController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = createBookingSchema.parse(req.body);
      const result = await bookingService.create(validated);

      if ('error' in result) {
        res.status(result.status).json({ success: false, error: result.error });
        return;
      }

      res.status(result.status).json({ success: true, data: result.data });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      if (error.message === 'SLOT_ALREADY_BOOKED') {
        res.status(409).json({ success: false, error: 'This slot is already booked' });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
  }

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const bookings = await bookingService.findAll();
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
  }
}
