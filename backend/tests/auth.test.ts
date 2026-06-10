import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import { setupTestApp, seedTestData, getAdminToken } from './setup';

let app: Express;
let testData: ReturnType<typeof seedTestData>;

beforeAll(async () => {
  app = await setupTestApp();
});

beforeEach(() => {
  testData = seedTestData();
});

describe('Authentication', () => {
  // ─── POST /api/auth/login ──────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should return a JWT token for valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.token).toBe('string');

      // Verify the token is a valid JWT with correct payload
      const decoded = jwt.decode(res.body.token) as any;
      expect(decoded.role).toBe('admin');
      expect(decoded.username).toBe('admin');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for wrong username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'hacker', password: 'admin123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Protected Route Access ────────────────────────────────
  describe('Protected Route Access', () => {
    it('should allow access to POST /api/doctors with valid token', async () => {
      const token = getAdminToken();
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Dr. Auth Test',
          specialization: 'Cardiology',
          experience: 5,
          consultationFee: 500,
          slots: ['2026-08-01T09:00:00.000Z'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Dr. Auth Test');
    });

    it('should reject POST /api/doctors without token', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .send({
          name: 'Dr. No Auth',
          specialization: 'Cardiology',
          experience: 5,
          consultationFee: 500,
          slots: ['2026-08-01T09:00:00.000Z'],
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should reject DELETE /api/doctors/:id with invalid JWT', async () => {
      const res = await request(app)
        .delete(`/api/doctors/${testData.doctorId1}`)
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid or expired token');
    });

    it('should reject PUT /api/doctors/:id with expired token', async () => {
      // Create a token that expired 1 hour ago
      const expiredToken = jwt.sign(
        { role: 'admin', username: 'admin' },
        process.env.JWT_SECRET || 'doctor-consultation-jwt-secret-key-2026',
        { expiresIn: '-1h' }
      );

      const res = await request(app)
        .put(`/api/doctors/${testData.doctorId1}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ name: 'Should Not Update' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid or expired token');
    });

    it('should keep GET /api/doctors public (no auth required)', async () => {
      const res = await request(app).get('/api/doctors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should keep POST /api/bookings public (no auth required)', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId1,
          userName: 'Public User',
          slotTime: testData.slot1Time,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.userName).toBe('Public User');
    });
  });
});
