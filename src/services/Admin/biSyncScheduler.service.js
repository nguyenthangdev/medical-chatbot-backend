import { runBiSync } from '../../scripts/sync-bi.js';

const DEFAULT_INTERVAL_MS = 60_000;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isEnabled = () => process.env.BI_SYNC_ENABLED !== 'false';

const timestamp = () => new Date().toISOString();

export const createBiSyncScheduler = () => {
  const intervalMs = toPositiveInteger(process.env.BI_SYNC_INTERVAL_MS, DEFAULT_INTERVAL_MS);
  const runOnStart = process.env.BI_SYNC_RUN_ON_START !== 'false';

  let timer = null;
  let running = false;
  let stopped = false;

  const scheduleNextRun = () => {
    if (stopped) return;
    timer = setTimeout(runOnce, intervalMs);
  };

  const runOnce = async () => {
    if (running) {
      console.log(`[${timestamp()}] BI sync skipped because the previous run is still active.`);
      scheduleNextRun();
      return;
    }

    running = true;
    console.log(`[${timestamp()}] BI sync started.`);

    try {
      await runBiSync();
    } catch (error) {
      console.error(`[${timestamp()}] BI sync failed:`, error);
    } finally {
      running = false;
      if (!stopped) {
        console.log(`[${timestamp()}] Next BI sync in ${intervalMs}ms.`);
        scheduleNextRun();
      }
    }
  };

  const start = () => {
    if (!isEnabled()) {
      console.log('BI sync scheduler is disabled.');
      return;
    }

    if (!process.env.BI_DATABASE_URL) {
      console.warn('BI sync scheduler is disabled because BI_DATABASE_URL is missing.');
      return;
    }

    console.log(`[${timestamp()}] BI sync scheduler is running every ${intervalMs}ms.`);

    if (runOnStart) {
      runOnce();
    } else {
      scheduleNextRun();
    }
  };

  const stop = () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };

  return {
    start,
    stop,
  };
};
