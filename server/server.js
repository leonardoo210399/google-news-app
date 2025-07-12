// server/server.js

import { fetchAndStoreLatestNews } from "./services/latestNewsService.js";
import { fetchAndStoreEditorsPick } from "./services/editorsPickService.js";

export default async ({ req, res, log }) => {
  try {
    const latest = await fetchAndStoreLatestNews();
    const editors = await fetchAndStoreEditorsPick();

    log(`[${new Date().toISOString()}] Latest feed: added ${latest.length} new article(s)`);
    log(`[${new Date().toISOString()}] Editors-pick feed: added ${editors.length} new article(s)`);

    return res.json({
      message: "News fetch completed",
      latestArticles: latest.length,
      editorsPickArticles: editors.length,
    });
  } catch (error) {
    log(`[ERROR] ${error.message}`);
    return res.json({ error: error.message }, 500);
  }
};

