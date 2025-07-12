// server/controllers/scraperController.js

import { fetchAndStoreLatestNews } from '../services/latestNewsService.js';
import { fetchAndStoreEditorsPick } from '../services/editorsPickService.js';
import scheduler from '../utils/scheduler.js';

export const scrapeNews = async (req, res) => {
  try {
    const articles = await fetchAndStoreLatestNews();
    res.json(articles);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Latest fetch failed:`, error);
    res.status(500).send('Latest fetch error');
  }
};

export const scrapeEditorsPick = async (req, res) => {
  try {
    const articles = await fetchAndStoreEditorsPick();
    res.json(articles);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Editors-pick fetch failed:`, error);
    res.status(500).send('Editors-pick fetch error');
  }
};

// Start periodic fetches for both feeds
scheduler.start();
