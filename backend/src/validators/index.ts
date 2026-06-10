import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  specialization: z.string().min(1, 'Specialization is required').max(50, 'Specialization must be under 50 characters'),
  experience: z.number().int().min(0, 'Experience must be non-negative').max(60, 'Experience seems too high'),
  consultationFee: z.number().min(0, 'Consultation fee must be non-negative'),
  slots: z.array(z.string().datetime({ message: 'Each slot must be a valid ISO datetime string' })).min(1, 'At least one slot is required'),
});

export const updateDoctorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  specialization: z.string().min(1).max(50).optional(),
  experience: z.number().int().min(0).max(60).optional(),
  consultationFee: z.number().min(0).optional(),
  slots: z.array(z.string().datetime({ message: 'Each slot must be a valid ISO datetime string' })).optional(),
});

export const createBookingSchema = z.object({
  doctorId: z.string().uuid('Doctor ID must be a valid UUID'),
  userName: z.string().min(1, 'User name is required').max(100, 'User name must be under 100 characters'),
  slotTime: z.string().datetime({ message: 'Slot time must be a valid ISO datetime string' }),
});

export const doctorFilterSchema = z.object({
  specialization: z.string().optional(),
  experience: z.coerce.number().int().min(0).optional(),
  maxFee: z.coerce.number().min(0).optional(),
  name: z.string().optional(),
});
