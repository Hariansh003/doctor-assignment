import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'doctor-consultation-jwt-secret-key-2026';

/**
 * Middleware to authenticate admin users via JWT.
 * Extracts the token from the Authorization header (Bearer <token>),
 * verifies it, and attaches the decoded payload to req.body.__admin.
 * Returns 401 if no token is provided or the token is invalid/expired.
 */
export function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; username: string };

    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
