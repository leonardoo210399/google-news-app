// utils/urlUtils.js
export function normalizeUrl(inputUrl) {
  try {
    const u = new URL(inputUrl.trim());
    // drop UTM or other tracking params:
    u.search = '';
    // remove trailing slash:
    u.pathname = u.pathname.replace(/\/$/, '');
    return u.toString().toLowerCase();
  } catch {
    return inputUrl.trim().toLowerCase();
  }
}
