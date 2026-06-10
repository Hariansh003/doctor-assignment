import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, getDb, saveDb } from '../database';
import { BookingCreateInput } from '../types';

/**
 * RACE CONDITION HANDLING
 * =======================
 * Race conditions occur when two concurrent requests try to book the same slot:
 *
 *   Request A: reads slot (isBooked=false) → proceeds to book
 *   Request B: reads slot (isBooked=false) → proceeds to book  ← RACE!
 *   Both succeed → DOUBLE BOOKING
 *
 * SOLUTION: Atomic check-and-update using SQL's UPDATE...WHERE clause.
 * Instead of SELECT then UPDATE (two separate operations), we use a single
 * UPDATE statement with a WHERE condition that includes `isBooked = 0`.
 * This ensures the update only succeeds if the slot is still available at
 * the exact moment of the write.
 *
 * In sql.js (synchronous, single-process), Node.js's event loop already
 * serializes synchronous operations. However, the atomic UPDATE pattern is
 * still the correct approach because:
 * 1. It would protect against races if the DB were swapped for a real server-based DB
 * 2. It collapses the check+update into a single atomic SQL statement
 * 3. It's the industry-standard pattern for pessimistic concurrency control
 */
export class BookingService {
  create(data: BookingCreateInput) {
    // Verify doctor exists
    const doctor = queryOne('SELECT * FROM doctors WHERE id = ?', [data.doctorId]);
    if (!doctor) {
      return { error: 'Doctor not found', status: 404 };
    }

    // Verify slot exists
    const slot = queryOne(
      'SELECT * FROM slots WHERE doctorId = ? AND slotTime = ?',
      [data.doctorId, data.slotTime]
    );

    if (!slot) {
      return { error: 'Slot not found for this doctor', status: 404 };
    }

    if (slot.isBooked) {
      return { error: 'This slot is already booked', status: 409 };
    }

    // ATOMIC operation: UPDATE only if isBooked is still 0.
    // This is the critical race-condition guard. The WHERE clause
    // ensures that if another request already marked this slot as booked
    // between our SELECT above and this UPDATE, the UPDATE will affect
    // zero rows and we'll detect the conflict.
    const db = getDb();
    const updateStmt = db.prepare(
      'UPDATE slots SET isBooked = 1 WHERE id = ? AND isBooked = 0'
    );
    updateStmt.bind([slot.id]);
    updateStmt.step();
    updateStmt.free();

    // Check how many rows were affected by the atomic update.
    // If 0 rows changed, another request already booked this slot.
    const changes = db.getRowsModified();
    if (changes === 0) {
      return { error: 'This slot is already booked', status: 409 };
    }

    // Slot successfully locked — now create the booking record
    const bookingId = uuidv4();
    const now = new Date().toISOString();

    const insertStmt = db.prepare(
      'INSERT INTO bookings (id, doctorId, userName, slotTime, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    insertStmt.bind([bookingId, data.doctorId, data.userName, data.slotTime, now]);
    insertStmt.step();
    insertStmt.free();

    saveDb();

    return {
      data: {
        id: bookingId,
        doctorId: data.doctorId,
        userName: data.userName,
        slotTime: data.slotTime,
        createdAt: now,
        doctor,
      },
      status: 201,
    };
  }

  findAll() {
    const bookings = queryAll(`
      SELECT b.id, b.doctorId, b.userName, b.slotTime, b.createdAt,
             d.name as doctorName, d.specialization, d.experience, d.consultationFee
      FROM bookings b
      LEFT JOIN doctors d ON b.doctorId = d.id
      ORDER BY b.createdAt DESC
    `);

    return bookings.map((b: any) => ({
      id: b.id,
      doctorId: b.doctorId,
      userName: b.userName,
      slotTime: b.slotTime,
      createdAt: b.createdAt,
      doctor: {
        id: b.doctorId,
        name: b.doctorName,
        specialization: b.specialization,
        experience: b.experience,
        consultationFee: b.consultationFee,
      },
    }));
  }
}
