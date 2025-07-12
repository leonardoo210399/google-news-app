// server/services/appwriteService.js
import { databases, DATABASE_ID, LATEST_COLLECTION_ID } from '../config/appwrite.js';
import { ID, Query } from 'node-appwrite';

export const findArticleByUrlOrTitle = async (url, title, collectionId) => {
  const byUrl = await findArticleByUrl(url, collectionId);
  if (byUrl) return byUrl;
  const res = await databases.listDocuments(
    DATABASE_ID,
    collectionId,
    [ Query.equal('title', title) ],
    1, 0
  );
  return res.documents[0] || null;
};

/**
 * Find one article by its titleUrl field.
 */
export const findArticleByUrl = async (
  url,
  collectionId = LATEST_COLLECTION_ID
) => {
  const res = await databases.listDocuments(
    DATABASE_ID,
    collectionId,
    [ Query.equal('titleUrl', url) ],
    1, // limit
    0  // offset
  );
  return res.documents[0] || null;
};

/**
 * Find one article by its exact title.
 */
export const findArticleByTitle = async (
  title,
  collectionId = LATEST_COLLECTION_ID
) => {
  const res = await databases.listDocuments(
    DATABASE_ID,
    collectionId,
    [ Query.equal('title', title) ],
    1,
    0
  );
  return res.documents[0] || null;
};

/**
 * Create a new article document.
 */
export const createArticle = async (
  data,
  collectionId = LATEST_COLLECTION_ID
) => {
  return databases.createDocument(
    DATABASE_ID,
    collectionId,
    ID.unique(),
    data
  );
};

/**
 * Update an existing article document.
 */
export const updateArticle = async (
  documentId,
  data,
  collectionId = LATEST_COLLECTION_ID
) => {
  return databases.updateDocument(
    DATABASE_ID,
    collectionId,
    documentId,
    data
  );
};

/**
 * Search articles with filters, pagination.
 */
export const searchArticles = async (
  filters,
  limit,
  offset,
  collectionId = LATEST_COLLECTION_ID
) => {
  return databases.listDocuments(
    DATABASE_ID,
    collectionId,
    filters,
    limit,
    offset
  );
};
