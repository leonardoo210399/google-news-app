// utils/rssParser.js
import RSSParser from "rss-parser";
import {findArticleByUrlOrTitle,
  findArticleByUrl,
  createArticle,
} from "../services/appwriteService.js";
import Article from "../models/Article.js";
import { normalizeUrl } from "./urlUtils.js";

const parser = new RSSParser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["category", "categories"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

export async function processFeed(url, collectionId) {
  if (!url) throw new Error("RSS URL is not defined");
  const xml = await fetchFeedXml(url);
  const feed = await parser.parseString(xml);
  const created = [];

  for (const item of feed.items) {
    const titleUrl = normalizeUrl(item.link || "");
    if (!titleUrl) continue;

    // 1. Skip if already in DB
    const existing = await findArticleByUrlOrTitle(
      titleUrl,
      item.title?.trim(),
      collectionId
    );
    if (existing) {
      // console.warn("⏱ checking", titleUrl, "exists?", !!existing);
      continue;
    }

    // 2. Build Article model
    const rawFetched = new Date().toISOString();
    const datetime = item.pubDate
      ? new Date(item.pubDate).toISOString()
      : rawFetched;

    const media = Array.isArray(item.mediaContent)
      ? item.mediaContent[0]
      : item.mediaContent;
    const imageUrl = media?.["$"]?.url || null;

    const article = new Article({
      title: item.title?.trim() || "",
      titleUrl,
      summary: item.contentSnippet?.trim() || "",
      description: item.contentEncoded?.trim() || item.content?.trim() || "",
      imageUrl,
      categories: Array.isArray(item.categories)
        ? item.categories.map((c) => c.trim())
        : item.categories
        ? [item.categories.trim()]
        : [],
      author: item.creator || item.author || "",
      rawDatetime: rawFetched,
      datetime,
    });

    // 3. Store and record
    const createdDoc = await createArticle(article, collectionId);
    created.push(createdDoc);
  }

  return created;
}

async function fetchFeedXml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/115.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Fetch error ${res.status} from ${url}`);
  return res.text();
}
