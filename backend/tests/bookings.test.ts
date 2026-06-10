import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { setupTestApp, seedTestData } from './setup';
import { queryOne, queryAll } from '../src/database';

let app: Express;
let testData: ReturnType<typeof seedTestData>;

beforeAll(async () => {
  app = await setupTestApp();
});

beforeEach(() => {
  testData = seedTestData();
});

describe('Booking APIs', () => {
  // ─── POST /api/bookings ────────────────────────────────────
  describe('POST /api/bookings', () => {
    it('should book an available slot successfully', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId1,
          userName: 'Amritesh',
          slotTime: testData.slot1Time,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userName).toBe('Amritesh');
      expect(res.body.data.doctorId).toBe(testData.doctorId1);
      expect(res.body.data.slotTime).toBe('2026-07-01T09:00:00.000Z');
      expect(res.body.data.doctor.name).toBe('Dr. Raj Sharma');

      // Verify the slot is now marked as booked in the database
      const slot = queryOne('SELECT isBooked FROM slots WHERE id = ?', [testData.slot1Id]);
      expect(slot.isBooked).toBe(1);
    });

    it('should return 409 when booking an already-booked slot', async () => {
      // slot3 is pre-booked in seed data
      const res = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId1,
          userName: 'Duplicate User',
          slotTime: testData.slot3Time,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('This slot is already booked');
    });

    it('should return 404 for non-existent doctor', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: '00000000-0000-0000-0000-000000000000',
          userName: 'Ghost Patient',
          slotTime: '2026-07-01T09:00:00.000Z',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Doctor not found');
    });

    it('should return 404 for non-existent slot time', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId1,
          userName: 'Test User',
          slotTime: '2099-01-01T09:00:00.000Z',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Slot not found for this doctor');
    });

    it('should return 400 for invalid booking data', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({ doctorId: 'not-a-uuid', userName: '', slotTime: 'bad-date' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent double booking by a second request after first books', async () => {
      // First booking should succeed
      const res1 = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId1,
          userName: 'User A',
          slotTime: testData.slot2Time,
        });
      expect(res1.status).toBe(201);
      expect(res1.body.data.userName).toBe('User A');

      // Second booking of the same slot should fail with 409
      const res2 = await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId1,
          userName: 'User B',
          slotTime: testData.slot2Time,
        });
      expect(res2.status).toBe(409);
      expect(res2.body.error).toBe('This slot is already booked');

      // Verify only one booking exists in the database for this slot
      const bookings = queryAll(
        'SELECT * FROM bookings WHERE doctorId = ? AND slotTime = ?',
        [testData.doctorId1, testData.slot2Time]
      );
      expect(bookings).toHaveLength(1);
      expect(bookings[0].userName).toBe('User A');
    });
  });

  // ─── GET /api/bookings ─────────────────────────────────────
  describe('GET /api/bookings', () => {
    it('should return empty array when no bookings exist', async () => {
      const res = await request(app).get('/api/bookings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return bookings with doctor details after creating one', async () => {
      // Create a booking first
      await request(app)
        .post('/api/bookings')
        .send({
          doctorId: testData.doctorId2,
          userName: 'Priya Kapoor',
          slotTime: testData.slot4Time,
        });

      const res = await request(app).get('/api/bookings');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userName).toBe('Priya Kapoor');
      expect(res.body.data[0].slotTime).toBe('2026-07-01T14:00:00.000Z');
      expect(res.body.data[0].doctor.name).toBe('Dr. Sneha Iyer');
      expect(res.body.data[0].doctor.specialization).toBe('Dermatology');
    });
  });

  // ─── RACE CONDITION TEST ───────────────────────────────────
  describe('Race Condition Handling', () => {
    /**
     * This test simulates a race condition by firing two booking requests
     * for the same slot simultaneously using Promise.all.
     *
     * Expected behavior:
     *   - Exactly ONE request succeeds with 201
     *   - Exactly ONE request fails with 409
     *   - The database contains exactly ONE booking for the slot
     *
     * The atomic UPDATE...WHERE isBooked=0 in the booking service
     * ensures that even if both requests pass the initial SELECT check,
     * only one will successfully flip isBooked from 0 to 1.
     */
    it('should allow only one booking when two concurrent requests target the same slot', async () => {
      const bookingPayload = {
        doctorId: testData.doctorId1,
        slotTime: testData.slot1Time,
      };

      // Fire two simultaneous booking requests
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/bookings')
          .send({ ...bookingPayload, userName: 'Concurrent User A' }),
        request(app)
          .post('/api/bookings')
          .send({ ...bookingPayload, userName: 'Concurrent User B' }),
      ]);

      const statuses = [res1.status, res2.status].sort();

      // One should succeed (201), one should fail (409)
      expect(statuses).toEqual([201, 409]);

      // Verify exactly one booking exists in the database
      const bookings = queryAll(
        'SELECT * FROM bookings WHERE doctorId = ? AND slotTime = ?',
        [testData.doctorId1, testData.slot1Time]
      );
      expect(bookings).toHaveLength(1);

      // Verify the slot is marked as booked
      const slot = queryOne('SELECT isBooked FROM slots WHERE id = ?', [testData.slot1Id]);
      expect(slot.isBooked).toBe(1);
    });
  });
});
