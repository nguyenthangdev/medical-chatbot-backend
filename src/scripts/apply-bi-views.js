import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { biPool } from '../config/biDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required env: ${name}`);
  }
};

const main = async () => {
  try {
    requireEnv('BI_DATABASE_URL');

    const sqlPath = path.resolve(__dirname, '../../bi-views.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    await biPool.query(sql);
    console.log('BI views applied.');
  } catch (error) {
    console.error('Failed to apply BI views:', error);
    process.exitCode = 1;
  } finally {
    await biPool.end().catch(() => {});
  }
};

main();
