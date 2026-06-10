import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { setupTestApp, seedTestData, getAdminToken } from './setup';

let app: Express;
let token: string;
let testData: ReturnType<typeof seedTestData>;

beforeAll(async () => {
  app = await setupTestApp();
  token = getAdminToken();
});

beforeEach(() => {
  testData = seedTestData();
});

describe('Doctor APIs', () => {
  // ─── GET /api/doctors ───────────────────────────────────────
  describe('GET /api/doctors', () => {
    it('should return all seeded doctors', async () => {
      const res = await request(app).get('/api/doctors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);

      const names = res.body.data.map((d: any) => d.name).sort();
      expect(names).toEqual(['Dr. Amit Patel', 'Dr. Raj Sharma', 'Dr. Sneha Iyer']);
    });

    it('should filter by specialization=Cardiology and return exact doctor', async () => {
      const res = await request(app).get('/api/doctors?specialization=Cardiology');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Dr. Raj Sharma');
      expect(res.body.data[0].specialization).toBe('Cardiology');
      expect(res.body.data[0].experience).toBe(12);
      expect(res.body.data[0].consultationFee).toBe(1000);
    });

    it('should filter by maxFee=700 and return doctors under that fee', async () => {
      const res = await request(app).get('/api/doctors?maxFee=700');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Dr. Sneha Iyer');
      expect(res.body.data[0].consultationFee).toBe(600);
    });

    it('should filter by experience>=10 and return matching doctors', async () => {
      const res = await request(app).get('/api/doctors?experience=10');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      const names = res.body.data.map((d: any) => d.name).sort();
      expect(names).toEqual(['Dr. Amit Patel', 'Dr. Raj Sharma']);
    });

    it('should filter by name search', async () => {
      const res = await request(app).get('/api/doctors?name=Sneha');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Dr. Sneha Iyer');
    });

    it('should return empty array for non-matching filter', async () => {
      const res = await request(app).get('/api/doctors?specialization=Oncology');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // ─── GET /api/doctors/:id ───────────────────────────────────
  describe('GET /api/doctors/:id', () => {
    it('should return specific doctor with correct fields', async () => {
      const res = await request(app).get(`/api/doctors/${testData.doctorId1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Dr. Raj Sharma');
      expect(res.body.data.specialization).toBe('Cardiology');
      expect(res.body.data.experience).toBe(12);
      expect(res.body.data.consultationFee).toBe(1000);
      expect(res.body.data.slots).toHaveLength(3);
    });

    it('should return 404 for non-existent doctor', async () => {
      const res = await request(app).get('/api/doctors/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Doctor not found');
    });
  });

  // ─── POST /api/doctors (Protected) ─────────────────────────
  describe('POST /api/doctors', () => {
    it('should create a doctor with valid admin token', async () => {
      const newDoctor = {
        name: 'Dr. Kavita Reddy',
        specialization: 'Neurology',
        experience: 9,
        consultationFee: 750,
        slots: ['2026-08-01T09:00:00.000Z', '2026-08-01T10:00:00.000Z'],
      };

      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${token}`)
        .send(newDoctor);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Dr. Kavita Reddy');
      expect(res.body.data.specialization).toBe('Neurology');
      expect(res.body.data.experience).toBe(9);
      expect(res.body.data.consultationFee).toBe(750);
      expect(res.body.data.slots).toHaveLength(2);
    });

    it('should return 400 for invalid doctor data', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', specialization: '', experience: -5, consultationFee: -100, slots: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .send({ name: 'Test', specialization: 'Test', experience: 1, consultationFee: 100, slots: ['2026-08-01T09:00:00.000Z'] });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
  });

  // ─── PUT /api/doctors/:id (Protected) ──────────────────────
  describe('PUT /api/doctors/:id', () => {
    it('should update doctor name and fee with valid token', async () => {
      const res = await request(app)
        .put(`/api/doctors/${testData.doctorId2}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Dr. Sneha Iyer-Kapoor', consultationFee: 650 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Dr. Sneha Iyer-Kapoor');
      expect(res.body.data.consultationFee).toBe(650);
      // Unchanged fields remain the same
      expect(res.body.data.specialization).toBe('Dermatology');
      expect(res.body.data.experience).toBe(7);
    });

    it('should return 404 when updating non-existent doctor', async () => {
      const res = await request(app)
        .put('/api/doctors/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ghost Doctor' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Doctor not found');
    });
  });

  // ─── DELETE /api/doctors/:id (Protected) ───────────────────
  describe('DELETE /api/doctors/:id', () => {
    it('should delete doctor with valid token', async () => {
      const res = await request(app)
        .delete(`/api/doctors/${testData.doctorId3}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Doctor deleted successfully');

      // Verify deletion
      const check = await request(app).get(`/api/doctors/${testData.doctorId3}`);
      expect(check.status).toBe(404);
    });

    it('should return 404 when deleting non-existent doctor', async () => {
      const res = await request(app)
        .delete('/api/doctors/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Doctor not found');
    });
  });
});
