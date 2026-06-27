import 'dotenv/config';

import argon2 from 'argon2';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for seed');
}

const pool = new Pool({ connectionString });

async function main() {
  const adminPasswordHash = await argon2.hash('password');

  await pool.query(
    `
      insert into regions (id, name, created_at, updated_at)
      values ($1, $2::jsonb, now(), now())
      on conflict (id) do update
      set name = excluded.name, updated_at = now()
    `,
    [
      '00000000-0000-0000-0000-000000000001',
      JSON.stringify({ uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' }),
    ],
  );

  await pool.query(
    `
      insert into cities (id, region_id, name, created_at, updated_at)
      values ($1, $2, $3::jsonb, now(), now())
      on conflict (id) do update
      set name = excluded.name, updated_at = now()
    `,
    [
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000001',
      JSON.stringify({ uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' }),
    ],
  );

  await pool.query(
    `
      insert into users (
        id, phone, first_name, last_name, status, email, preferred_language, created_at, updated_at
      )
      values ($1, $2, $3, $4, 'active', $5, 'uz', now(), now())
      on conflict (phone) do update
      set first_name = excluded.first_name,
          last_name = excluded.last_name,
          email = excluded.email,
          status = excluded.status,
          updated_at = now()
    `,
    [
      '00000000-0000-0000-0000-000000000201',
      '+998901234567',
      'Demo',
      'User',
      'user@uzbron.uz',
    ],
  );

  await pool.query(
    `
      insert into admin_users (
        id, email, password_hash, full_name, role, status, created_at, updated_at
      )
      values ($1, $2, $3, $4, 'super_admin', 'active', now(), now())
      on conflict (email) do update
      set password_hash = excluded.password_hash,
          full_name = excluded.full_name,
          role = excluded.role,
          status = excluded.status,
          updated_at = now()
    `,
    [
      '00000000-0000-0000-0000-000000000301',
      'admin@uzbron.uz',
      adminPasswordHash,
      'Demo Admin',
    ],
  );

  await pool.query(
    `
      insert into partner_organizations (
        id, type, legal_name, brand_name, tax_id, phone, email, city_id, address,
        status, default_commission_rate, created_at, updated_at
      )
      values (
        $1, 'mixed', $2, $3, $4, $5, $6, $7, $8, 'approved', 12.00, now(), now()
      )
      on conflict (tax_id) do update
      set legal_name = excluded.legal_name,
          brand_name = excluded.brand_name,
          phone = excluded.phone,
          email = excluded.email,
          status = excluded.status,
          updated_at = now()
    `,
    [
      '00000000-0000-0000-0000-000000000401',
      'UzBron Demo Partner LLC',
      'UzBron Demo Partner',
      'DEMO-TAX-ID',
      '+998901112233',
      'partner@uzbron.uz',
      '00000000-0000-0000-0000-000000000101',
      'Samarqand, Registon',
    ],
  );
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
