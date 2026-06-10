import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, runSql, saveDb, getDb } from '../database';
import { DoctorCreateInput, DoctorUpdateInput, DoctorFilterParams } from '../types';

function attachSlots(doctors: any[]) {
  return doctors.map((doc) => {
    const slots = queryAll(
      'SELECT id, doctorId, slotTime, isBooked FROM slots WHERE doctorId = ? ORDER BY slotTime ASC',
      [doc.id]
    );
    return {
      ...doc,
      slots: slots.map((s: any) => ({ ...s, isBooked: Boolean(s.isBooked) })),
    };
  });
}

export class DoctorService {
  create(data: DoctorCreateInput) {
    const id = uuidv4();
    const now = new Date().toISOString();

    runSql(
      'INSERT INTO doctors (id, name, specialization, experience, consultationFee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.name, data.specialization, data.experience, data.consultationFee, now, now]
    );

    for (const slotTime of data.slots) {
      runSql(
        'INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)',
        [uuidv4(), id, slotTime]
      );
    }

    saveDb();
    return this.findById(id);
  }

  findAll(filters: DoctorFilterParams) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.specialization) {
      conditions.push('specialization = ?');
      params.push(filters.specialization);
    }
    if (filters.experience !== undefined) {
      conditions.push('experience >= ?');
      params.push(filters.experience);
    }
    if (filters.maxFee !== undefined) {
      conditions.push('consultationFee <= ?');
      params.push(filters.maxFee);
    }
    if (filters.name) {
      conditions.push('name LIKE ?');
      params.push(`%${filters.name}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const doctors = queryAll(`SELECT * FROM doctors ${where} ORDER BY name ASC`, params);
    return attachSlots(doctors);
  }

  findById(id: string) {
    const doctor = queryOne('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!doctor) return null;
    return attachSlots([doctor])[0];
  }

  update(id: string, data: DoctorUpdateInput) {
    const existing = queryOne('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!existing) return null;

    const fields: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
    if (data.specialization !== undefined) { fields.push('specialization = ?'); params.push(data.specialization); }
    if (data.experience !== undefined) { fields.push('experience = ?'); params.push(data.experience); }
    if (data.consultationFee !== undefined) { fields.push('consultationFee = ?'); params.push(data.consultationFee); }

    fields.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);

    if (fields.length > 1) {
      runSql(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (data.slots && data.slots.length > 0) {
      for (const slotTime of data.slots) {
        const existingSlot = queryOne(
          'SELECT id FROM slots WHERE doctorId = ? AND slotTime = ?',
          [id, slotTime]
        );
        if (!existingSlot) {
          runSql(
            'INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)',
            [uuidv4(), id, slotTime]
          );
        }
      }
    }

    saveDb();
    return this.findById(id);
  }

  delete(id: string) {
    const existing = queryOne('SELECT * FROM doctors WHERE id = ?', [id]);
    if (!existing) return null;
    runSql('DELETE FROM bookings WHERE doctorId = ?', [id]);
    runSql('DELETE FROM slots WHERE doctorId = ?', [id]);
    runSql('DELETE FROM doctors WHERE id = ?', [id]);
    saveDb();
    return existing;
  }
}
