import { fetchAndStore, fetchEditorsPickAndStore } from '../utils/rssParser.js';
import scheduler from '../utils/scheduler.js';

export const scrapeNews = async (req, res) => {
  try {
    const articles = await fetchAndStore();
    res.json(articles);
  } catch (error) {
    console.error('Fetch failed:', error);
    res.status(500).send('Fetch error');
  }
};

export const scrapeEditorsPick = async (req, res) => {
  try {
    const articles = await fetchEditorsPickAndStore();
    res.json(articles);
  } catch (error) {
    console.error('Fetch failed:', error);
    res.status(500).send('Fetch error');
  }
};

// Start periodic fetches for both feeds
scheduler.start();
