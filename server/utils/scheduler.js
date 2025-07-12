import { fetchAndStore, fetchEditorsPickAndStore } from './rssParser.js';

const FETCH_INTERVAL = 1 * 60 * 1000; // 5 minutes

export default {
  start() {
    // Initial fetches
    fetchAndStore().catch((err) => console.error('Initial latest fetch failed:', err));
    fetchEditorsPickAndStore().catch((err) => console.error('Initial editors pick fetch failed:', err));

    // Schedule periodic fetches
    setInterval(() => {
      console.log(`Scheduled latest fetch at ${new Date().toISOString()}`);
      fetchAndStore().catch((err) => console.error('Scheduled latest fetch failed:', err));

      console.log(`Scheduled editors pick fetch at ${new Date().toISOString()}`);
      fetchEditorsPickAndStore().catch((err) => console.error('Scheduled editors pick fetch failed:', err));
    }, FETCH_INTERVAL);
  }
};
