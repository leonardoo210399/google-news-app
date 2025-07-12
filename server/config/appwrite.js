// server/config/appwrite.js
import { Client, Databases, ID, Query } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT)

export const databases             = new Databases(client);
export const DATABASE_ID           = process.env.APPWRITE_DATABASE_ID;
export const LATEST_COLLECTION_ID  = process.env.APPWRITE_COLLECTION_ID;
export const EDITORS_COLLECTION_ID = process.env.APPWRITE_EDITORS_COLLECTION_ID;

export { ID, Query };
