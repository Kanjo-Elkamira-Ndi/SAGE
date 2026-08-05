import argon2 from 'argon2';
import { pool } from '../config/db';

const DEPARTMENTS = [
  { name: 'Department of Arts', code: 'ARTS' },
  { name: 'Engineering', code: 'ENG' },
  { name: 'Digital Humanities', code: 'DH' },
  { name: 'Institution Maintenance', code: 'MNT' },
];

const ADMIN_EMAIL = 'admin@sage.app';
const ADMIN_PASSWORD = 'Admin@123';

async function seed(): Promise<void> {
  await pool.query('BEGIN');
  try {
    for (const d of DEPARTMENTS) {
      await pool.query(
        'INSERT INTO departments (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [d.name, d.code],
      );
    }

    const passwordHash = await argon2.hash(ADMIN_PASSWORD);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [ADMIN_EMAIL, passwordHash, 'System Administrator', 'admin'],
    );

    await pool.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log(`Seed complete. Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err);
  process.exit(1);
});
