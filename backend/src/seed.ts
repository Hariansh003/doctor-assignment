import { v4 as uuidv4 } from 'uuid';
import { initDb, runSql, saveDb, getDb } from './database';

async function seed() {
  await initDb();

  // Clear existing data
  runSql('DELETE FROM bookings');
  runSql('DELETE FROM slots');
  runSql('DELETE FROM doctors');

  const doctors = [
    { name: 'Dr. Priya Sharma', specialization: 'Cardiology', experience: 15, consultationFee: 800 },
    { name: 'Dr. Rahul Verma', specialization: 'Dermatology', experience: 8, consultationFee: 500 },
    { name: 'Dr. Anita Desai', specialization: 'Pediatrics', experience: 12, consultationFee: 600 },
    { name: 'Dr. Sanjay Gupta', specialization: 'Orthopedics', experience: 20, consultationFee: 1000 },
    { name: 'Dr. Meera Patel', specialization: 'Neurology', experience: 10, consultationFee: 900 },
    { name: 'Dr. Vikram Singh', specialization: 'Cardiology', experience: 5, consultationFee: 400 },
    { name: 'Dr. Kavita Reddy', specialization: 'Dermatology', experience: 6, consultationFee: 450 },
    { name: 'Dr. Arjun Nair', specialization: 'General Medicine', experience: 18, consultationFee: 300 },
    { name: 'Dr. Sunita Joshi', specialization: 'Gynecology', experience: 14, consultationFee: 700 },
    { name: 'Dr. Amit Khanna', specialization: 'Pediatrics', experience: 9, consultationFee: 550 },
  ];

  const now = new Date();

  for (const doc of doctors) {
    const doctorId = uuidv4();
    const timestamp = now.toISOString();
    runSql(
      'INSERT INTO doctors (id, name, specialization, experience, consultationFee, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doctorId, doc.name, doc.specialization, doc.experience, doc.consultationFee, timestamp, timestamp]
    );

    for (let day = 1; day <= 7; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      const hours = [9, 10, 11, 14, 15, 16, 17];
      for (const hour of hours) {
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);
        runSql(
          'INSERT INTO slots (id, doctorId, slotTime, isBooked) VALUES (?, ?, ?, 0)',
          [uuidv4(), doctorId, slotDate.toISOString()]
        );
      }
    }
  }

  saveDb();

  const db = getDb();
  const stmt1 = db.prepare('SELECT COUNT(*) as count FROM doctors');
  stmt1.step();
  const doctorCount = stmt1.getAsObject().count;
  stmt1.free();

  const stmt2 = db.prepare('SELECT COUNT(*) as count FROM slots');
  stmt2.step();
  const slotCount = stmt2.getAsObject().count;
  stmt2.free();

  console.log(`Seed complete: ${doctorCount} doctors, ${slotCount} slots created.`);
}

seed().catch(console.error);
