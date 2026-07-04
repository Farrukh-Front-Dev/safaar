import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as argon2 from 'argon2';

async function main() {
  const password = process.argv[2] ?? (await promptPassword());
  if (!password || password.length < 8) {
    throw new Error('Parol kamida 8 ta belgidan iborat bo‘lishi kerak');
  }

  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 4,
  });

  console.log(hash);
}

async function promptPassword(): Promise<string> {
  const rl = readline.createInterface({ input, output });
  try {
    return await rl.question('Password: ');
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
