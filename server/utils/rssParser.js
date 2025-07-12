import RSSParser from 'rss-parser';
import {
  findArticleByUrl,
  createArticle,
  updateArticle,
} from '../services/appwriteService.js';
import {
  LATEST_COLLECTION_ID,
  EDITORS_COLLECTION_ID,
} from '../config/appwrite.js';

// RSS feed URLs
const RSS_URLS = {
  latest: 'https://cointelegraph.com/rss',
  editorsPick: 'https://cointelegraph.com/editors_pick_rss',
};

const parser = new RSSParser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['category', 'categories'],
    ],
  },
});

/**
 * Fetches XML from a URL using a browser-style User-Agent, then returns it as text.
 */
async function fetchFeedXml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`Fetch error ${res.status}`);
  return res.text();
}

/**
 * Parses and upserts articles from the given RSS URL into the specified collection.
 */
async function processFeed(url, collectionId) {
  const xml = await fetchFeedXml(url);
  const feed = await parser.parseString(xml);
  const added = [];

  for (const item of feed.items) {
    const raw = {
      title:       item.title?.trim()       || '',
      titleUrl:    item.link                || '',
      summary:     item.contentSnippet?.trim() || '',
      description: item.content?.trim()     || '',
      imageUrl:    item.enclosure?.url      || item.mediaContent?.url || null,
      categories:  Array.isArray(item.categories)
                    ? item.categories.map(c => c.trim())
                    : item.categories
                    ? [item.categories.trim()]
                    : [],
      author:      item.creator || item.author || '',
      rawDatetime: item.isoDate || null,
      datetime:    item.isoDate || new Date().toISOString(),
    };

    // Check if the article exists in target collection
    const existing = await findArticleByUrl(raw.titleUrl, collectionId);
    if (!existing) {
      // New: simply create
      await createArticle(raw, collectionId);
      added.push(raw);
    } else {
      // Exists: merge missing fields from latest collection
      const latest = await findArticleByUrl(raw.titleUrl, LATEST_COLLECTION_ID);
      const updated = {};

      // For each key in raw, if missing or empty, fill from latest
      for (const key of Object.keys(raw)) {
        const value = raw[key];
        const isEmpty =
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);
        if (isEmpty && latest && latest[key] !== undefined) {
          updated[key] = latest[key];
        }
      }

      // If any fields to update, perform update
      if (Object.keys(updated).length) {
        await updateArticle(existing.$id, updated, collectionId);
      }
    }
  }

  console.log(
    `Processed ${collectionId}: added ${added.length} new articles`
  );
  return added;
}

// Public APIs
export async function fetchAndStore() {
  return processFeed(RSS_URLS.latest, LATEST_COLLECTION_ID);
}

export async function fetchEditorsPickAndStore() {
  return processFeed(RSS_URLS.editorsPick, EDITORS_COLLECTION_ID);
}
