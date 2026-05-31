import 'dotenv/config';
import mongoose from 'mongoose';
import { biPool } from '../config/biDatabase.js';
import { createBiSyncScheduler } from '../services/Admin/biSyncScheduler.service.js';

const timestamp = () => new Date().toISOString();
const scheduler = createBiSyncScheduler();

const shutdown = async (signal) => {
  console.log(`[${timestamp()}] Received ${signal}. Stopping BI sync worker...`);
  scheduler.stop();
  await mongoose.disconnect().catch(() => {});
  await biPool.end().catch(() => {});
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

scheduler.start();
