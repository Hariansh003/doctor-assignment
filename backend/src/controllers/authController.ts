import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../validators/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'doctor-consultation-jwt-secret-key-2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export class AuthController {
  login(req: Request, res: Response): void {
    try {
      const validated = loginSchema.parse(req.body);

      if (validated.username !== ADMIN_USERNAME || validated.password !== ADMIN_PASSWORD) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { role: 'admin', username: validated.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ success: true, token });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }
}
