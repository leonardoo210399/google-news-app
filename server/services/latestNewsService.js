// services/latestNewsService.js
import { processFeed } from '../utils/rssParser.js';
import { LATEST_COLLECTION_ID } from '../config/appwrite.js';

export async function fetchAndStoreLatestNews() {
  const url = process.env.LATEST_RSS_URL;
  return processFeed(url, LATEST_COLLECTION_ID);
}
