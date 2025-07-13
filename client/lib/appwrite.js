// services/appwrite.js
import { Client, Avatars,Account, Databases, ID, Query } from "react-native-appwrite";
import Constants from "expo-constants";

export const appwriteConfig = {
  endpoint: Constants.expoConfig.extra.APPWRITE_ENDPOINT,      // e.g. https://cloud.appwrite.io/v1
  projectId: Constants.expoConfig.extra.APPWRITE_PROJECT,      // your project ID
  platform: "com.crypto.news",                                 // your Android bundle ID
  databaseId: Constants.expoConfig.extra.APPWRITE_DATABASE_ID, // e.g. databaseId
  latestCollectionId: Constants.expoConfig.extra.APPWRITE_COLLECTION_ID,          // e.g. articles
  editorsCollectionId: Constants.expoConfig.extra.APPWRITE_EDITORS_COLLECTION_ID, // e.g. editorsPickArticles
  userCollectionId:"userCollectionId"
};

// ——— Initialize Appwrite SDK ———
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);


// ——— Auth functions ———

/** Sign up, then create the user’s profile doc */
export async function createUser(email, password, username) {
  // 1. Register account
  const newAccount = await account.create(ID.unique(), email, password, username);

  // 2. Auto-login
  await signIn(email, password);

  const avatarUrl = avatars.getInitials(username);
  // 3. Create profile in `users` collection
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    {
      accountId: newAccount.$id,
      email,
      username,
      avatar: avatarUrl, // you can let users upload later
    }
  );
}

/** Sign in with email + password */
export async function signIn(email, password) {
  return account.createEmailPasswordSession(email, password);
}

/** Get the currently logged-in user’s profile doc */
export async function getCurrentUser() {
  const acct = await account.get();
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal("accountId", acct.$id)]
  );
  return res.documents[0] || null;
}

/** Sign out */
export function signOut() {
  return account.deleteSession("current");
}

// ——— Article-fetching functions ———

/** Fetch all “latest” articles (up to 50) */
export async function fetchLatestArticles(limit = 50, offset = 0) {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.latestCollectionId,
    [Query.orderDesc("$createdAt")],
    limit,
    offset
  );
  return res.documents;
}

/** Fetch “Editor’s Picks” */
export async function fetchEditorsPick(limit = 50, offset = 0) {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.editorsCollectionId,
    [Query.orderDesc("$createdAt")],
    limit,
    offset
  );
  return res.documents;
}

/** Search articles by title */
export async function searchArticles(term) {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.latestCollectionId,
    [Query.search("title", term)]
  );
  return res.documents;
}
