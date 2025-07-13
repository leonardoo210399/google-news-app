// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "Crypto News",
    slug: "crypto-news",
    version: "1.0.0",
    orientation: "portrait",
    icon: "assets/images/profile.png",
    scheme: "crypto-news",
    userInterfaceStyle: "automatic",
    splash: {
      image: "assets/1.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.crypto.news"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "assets/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "c58735db-ee7a-4528-9698-adb4b4a93155"
      },
      // Appwrite
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_PROJECT: process.env.APPWRITE_PROJECT,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
      APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID: process.env.APPWRITE_COLLECTION_ID,
      APPWRITE_EDITORS_COLLECTION_ID: process.env.APPWRITE_EDITORS_COLLECTION_ID,
      // RSS feeds
      LATEST_RSS_URL: process.env.LATEST_RSS_URL,
      EDITORS_RSS_URL: process.env.EDITORS_RSS_URL,
      // Port (if you ever need it)
      PORT: process.env.PORT,
    }
  }
};
