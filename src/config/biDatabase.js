import pg from 'pg';

const { Pool } = pg;

export const biPool = new Pool({
  connectionString: process.env.BI_DATABASE_URL,
});