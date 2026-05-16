import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { biPool } from '../config/biDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  try {
    if (!process.env.BI_DATABASE_URL) {
      throw new Error('Missing required env: BI_DATABASE_URL');
    }

    const sqlPath = path.resolve(__dirname, '../../bi-schema.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    await biPool.query(sql);
    console.log('BI schema applied.');
  } catch (error) {
    console.error('Failed to apply BI schema:', error);
    process.exitCode = 1;
  } finally {
    await biPool.end().catch(() => {});
  }
};

main();
