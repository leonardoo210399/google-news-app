import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import scraperRoutes from './routes/scraper.js';
import searchRoutes from './routes/search.js';

const app = express();
app.use(cors());
app.use('/', scraperRoutes);
app.use('/', searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));