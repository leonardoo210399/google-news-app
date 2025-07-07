const express     = require('express');
const { chromium } = require('playwright');
const cors        = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// launch a single browser instance
let browserPromise = chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

// scrape helper using Playwright
async function scrapeLatestNews() {
  const URL = 'https://cointelegraph.com/category/latest-news';
  const browser = await browserPromise;
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  });
  const page = await context.newPage();

  try {
    // first wait for the basic DOM, give up on networkidle if it's too slow
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // then explicitly wait for the network to calm down, but allow longer
    await page.waitForLoadState('networkidle', { timeout: 60000 });
  } catch (e) {
    console.warn('Initial load/networkidle timed out—continuing anyway');
  }

  // give lazy-loaded images/scripts extra time
  await page.waitForTimeout(3000);

  // extract exactly the same fields
  const articles = await page.$$eval('article.post-card-inline', nodes =>
    nodes.map(node => {
      const get = (sel, attr = 'innerText') => {
        const el = node.querySelector(sel);
        if (!el) return null;
        return attr === 'innerText'
          ? el.innerText.trim()
          : el.getAttribute(attr);
      };

      const path = get('.post-card-inline__title-link', 'href') || '';
      return {
        url         : path.startsWith('http')
                        ? path
                        : 'https://cointelegraph.com' + path,
        title       : get('.post-card-inline__title-link'),
        image       : get('img.lazy-image__img','src'),
        badge       : get('.post-card-inline__badge'),
        datetime    : get('time','datetime'),
        timeAgo     : get('time'),
        author      : get('.post-card-inline__author a'),
        description : get('.post-card-inline__text')
      };
    })
  );

  await page.close();
  await context.close();
  return articles;
}

app.get('/api/latest-news', async (req, res) => {
  try {
    const articles = await scrapeLatestNews();
    res.json(articles);
  } catch (err) {
    console.error('Error scraping JSON:', err);
    res.status(500).send('Error scraping latest news');
  }
});

app.listen(PORT, () => {
  console.log(`📡 Backend running at http://localhost:${PORT}`);
});
