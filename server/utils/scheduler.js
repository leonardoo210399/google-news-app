// server/utils/scheduler.js

import { fetchAndStoreLatestNews } from '../services/latestNewsService.js';
import { fetchAndStoreEditorsPick } from '../services/editorsPickService.js';

// Run fetches every 5 minutes
const FETCH_INTERVAL = 1*  60 * 1000;

function logFetch(promise, label) {
  promise
    .then(created => {
      console.log(
        `[${new Date().toISOString()}] ${label}: added ${created.length} new article(s)`
      );
    })
    .catch(err => {
      console.error(
        `[${new Date().toISOString()}] ${label} fetch error:`,
        err
      );
    });
}

export default {
  start() {
    // Initial fetches
    logFetch(fetchAndStoreLatestNews(), 'Latest feed');
    logFetch(fetchAndStoreEditorsPick(), 'Editors-pick feed');

    // Scheduled fetches
    setInterval(() => {
      logFetch(fetchAndStoreLatestNews(), 'Latest feed');
      logFetch(fetchAndStoreEditorsPick(), 'Editors-pick feed');
    }, FETCH_INTERVAL);
  },
};
