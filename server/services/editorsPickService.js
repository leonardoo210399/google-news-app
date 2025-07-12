// services/editorsPickService.js
import { processFeed } from '../utils/rssParser.js';
import {
  findArticleByUrlOrTitle,
  updateArticle
} from './appwriteService.js';
import {
  EDITORS_COLLECTION_ID,
  LATEST_COLLECTION_ID
} from '../config/appwrite.js';

export async function fetchAndStoreEditorsPick() {
  const url = process.env.EDITORS_RSS_URL;
  // 1. Ingest any new editor’s-pick items
  const created = await processFeed(url, EDITORS_COLLECTION_ID);

  // 2. For each newly created doc, sync its imageUrl from the “latest” collection
  for (const doc of created) {
    // find the same article in the latest-news collection
    const latest = await findArticleByUrlOrTitle(
      doc.titleUrl,
      doc.title,
      LATEST_COLLECTION_ID
    );

    // if we found one and it has an imageUrl that differs, patch the editors doc
    if (latest?.imageUrl && latest.imageUrl !== doc.imageUrl) {
      await updateArticle(
        doc.$id,
        { imageUrl: latest.imageUrl },
        EDITORS_COLLECTION_ID
      );
    }
  }

  return created;
}
