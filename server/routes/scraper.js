import express from 'express';
import { scrapeNews, scrapeEditorsPick } from '../controllers/scraperController.js';

const router = express.Router();
router.get('/scrape-news', scrapeNews);
router.get('/scrape-editors-pick', scrapeEditorsPick);

export default router;
