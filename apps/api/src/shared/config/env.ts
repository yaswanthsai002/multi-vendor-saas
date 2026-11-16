import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load root repository .env
config({ path: resolve(__dirname, '../../../../../.env') });

export function getEmailConfig() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, '');
  if (!user || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user) || !pass) {
    throw new Error('Set valid EMAIL_USER and EMAIL_PASS for Gmail SMTP.');
  }
  let origin: URL;
  try {
    origin = new URL(process.env.WEB_ORIGIN ?? '');
    if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) {
      throw new Error('Invalid origin');
    }
  } catch {
    throw new Error('Set WEB_ORIGIN to the public Perigee website URL.');
  }
  return { user, pass, origin: origin.origin };
}
