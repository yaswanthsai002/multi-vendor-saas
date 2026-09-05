import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';

import app from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });
config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
