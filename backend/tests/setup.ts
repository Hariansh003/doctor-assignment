import { initDb, getDb, runSql, saveDb } from '../src/database';
import { createApp } from '../src/app';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'doctor-consultation-jwt-secret-key-2026';

let app: Express;

/**
 * Initializes the test database and Express app.
 * Clears all existing data and seeds a known set of test data.
 */
export async function setupTestApp(): Promise<Express> {
  await initDb();
  app = createApp();
  return app;
}

/**
 * Generates a valid admin JWT token for protected route testing.
 */
export function getAdminToken(): string {
  return jwt.sign({ role: 'admin', username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Seeds the database with known test data for exact-value assertions.
 * Returns the IDs and slot times for use in tests.
 */
export function seedTestData() {
  const db = getDb();
  // Clear all data
  runSql('DELETE FROM bookings');
  runSql('DELETE FROM slots');
  runSql('DELETE FROM doctors');

  const doctorId1 = uuidv4();
  const doctorId2 = uuidv4();
  const doctorId3 = uuidv4();

  const now = new Date().toISOString();
  const slot1Time = '2026-07-01T09:00:00.000Z';
  const slot2Time = '2026-07-01T10:00:00.000Z';
  const slot3Time = '2026-07-01T11:00:00.000Z';
  const slot4Time = '2026-07-01T14:00:00.000Z';
  const slot5Time = '2026-07-02T09:00:00.000Z';

  const slot1Id = uuidv4();
  const slot2Id = uuidv4();
  const slot3Id = uuidv4();
  const slot4Id = uuidv4();
  const slot5Id = uuidv4();

  // Doctor 1: Cardiologist
  runSql(
    'INSERT INTO doctors (id, name, specialization, experience, consultationFee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [doctorId1, 'Dr. Raj Sharma', 'Cardiology', 12, 1000, now, now]
  );

  // Doctor 2: Dermatologist
  runSql(
    'INSERT INTO doctors (id, name, specialization, experience, consultationFee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [doctorId2, 'Dr. Sneha Iyer', 'Dermatology', 7, 600, now, now]
  );

  // Doctor 3: Pediatrician
  runSql(
    'INSERT INTO doctors (id, name, specialization, experience, consultationFee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [doctorId3, 'Dr. Amit Patel', 'Pediatrics', 15, 800, now, now]
  );

  // Slots for Doctor 1
  runSql('INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)', [slot1Id, doctorId1, slot1Time]);
  runSql('INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)', [slot2Id, doctorId1, slot2Time]);
  // Slot 3 is pre-booked for conflict testing
  runSql('INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 1)', [slot3Id, doctorId1, slot3Time]);

  // Slots for Doctor 2
  runSql('INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)', [slot4Id, doctorId2, slot4Time]);

  // Slots for Doctor 3
  runSql('INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)', [slot5Id, doctorId3, slot5Time]);

  saveDb();

  return {
    doctorId1,
    doctorId2,
    doctorId3,
    slot1Id,
    slot2Id,
    slot3Id,
    slot4Id,
    slot5Id,
    slot1Time,
    slot2Time,
    slot3Time,
    slot4Time,
    slot5Time,
  };
}
