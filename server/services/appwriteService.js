import {
  databases,
  DATABASE_ID,
  LATEST_COLLECTION_ID,
  EDITORS_COLLECTION_ID,
} from '../config/appwrite.js';
import { Query, ID } from 'node-appwrite';

/**
 * Find a single article by URL in the specified collection.
 */
export const findArticleByUrl = async (url, collectionId = LATEST_COLLECTION_ID) => {
  const res = await databases.listDocuments(
    DATABASE_ID,
    collectionId,
    [Query.equal('titleUrl', url), Query.limit(1)]
  );
  return res.documents[0] || null;
};

/**
 * Create a new article document in the specified collection.
 */
export const createArticle = async (
  article,
  collectionId = LATEST_COLLECTION_ID
) => {
  return databases.createDocument(
    DATABASE_ID,
    collectionId,
    ID.unique(),
    article
  );
};

/**
 * Update an existing article document with new data.
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
 * Search articles with filters, pagination in the specified collection.
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
