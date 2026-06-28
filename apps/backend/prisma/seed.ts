import 'dotenv/config';

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const seedFile = join(process.cwd(), 'prisma', 'admin-demo-seed.sql');

if (!existsSync(seedFile)) {
  throw new Error(`Seed SQL file was not found: ${seedFile}`);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(
  command,
  ['prisma', 'db', 'execute', '--file', seedFile],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
