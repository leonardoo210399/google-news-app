// services/editorsPickService.js
import { processFeed } from '../utils/rssParser.js';
import { findArticleByUrlOrTitle, updateArticle } from './appwriteService.js';
import { databases, DATABASE_ID, EDITORS_COLLECTION_ID, LATEST_COLLECTION_ID } from '../config/appwrite.js';
import { Query } from 'node-appwrite';

export async function fetchAndStoreEditorsPick() {
  const url = process.env.EDITORS_RSS_URL;
  // 1. Ingest any new editor’s-pick items
  const created = await processFeed(url, EDITORS_COLLECTION_ID);

  // 2. For each newly created doc, sync its imageUrl from the “latest” collection
  for (const doc of created) {
    const latest = await findArticleByUrlOrTitle(
      doc.titleUrl,
      doc.title,
      LATEST_COLLECTION_ID
    );
    if (latest?.imageUrl && latest.imageUrl !== doc.imageUrl) {
      await updateArticle(
        doc.$id,
        { imageUrl: latest.imageUrl },
        EDITORS_COLLECTION_ID
      );
    }
  }

  // 3. Enforce a maximum of 5 editor-pick documents:
  //    - List all docs ordered by creation time descending
  //    - Keep the first 5, delete any beyond that
  const listRes = await databases.listDocuments(
    DATABASE_ID,
    EDITORS_COLLECTION_ID,
    [
      Query.orderDesc('$createdAt')
    ],
    /* limit */      50,  // fetch up to 50 so you can trim safely
    /* offset */     0
  );

  const allDocs = listRes.documents;
  if (allDocs.length > 5) {
    const toDelete = allDocs.slice(5);
    for (const doc of toDelete) {
      await databases.deleteDocument(
        DATABASE_ID,
        EDITORS_COLLECTION_ID,
        doc.$id
      );
    }
  }

  return created;
}
