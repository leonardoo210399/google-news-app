import express from 'express';            // make sure "type":"module" is in package.json
import { chromium } from 'playwright';
import cors from 'cors';

const app = express();
app.use(cors());

const SCRAPE_URL = 'https://cointelegraph.com/category/latest-news';

// helper to scroll to bottom so lazy-loaded cards appear
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

app.get('/scrape-news', async (req, res) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(45000);

  try {
    await page.goto(SCRAPE_URL, { waitUntil: 'domcontentloaded' });
    // wait for first batch of cards
    await page.waitForSelector('article.post-card-inline');
    // scroll to load any more
    await autoScroll(page);
    // little pause for lazy-loaded images/text
    await page.waitForTimeout(1000);

    const articles = await page.$$eval('article.post-card-inline', cards => {
      const base = 'https://cointelegraph.com';
      return cards.map(card => {
        const idx        = card.getAttribute('data-gtm-index');
        const figLink    = card.querySelector('a.post-card-inline__figure-link');
        const titleLink  = card.querySelector('a.post-card-inline__title-link');
        const img        = card.querySelector('img.lazy-image__img');
        const titleEl    = card.querySelector('.post-card-inline__title');
        const summaryEl  = card.querySelector('.post-card-inline__text');
        const badgeEl    = card.querySelector('.post-card-inline__badge');
        const timeEl     = card.querySelector('time.post-card-inline__date');
        const authorA    = card.querySelector('.post-card-inline__author a');
        const statsItem  = card.querySelector('.post-card-inline__stats-item');
        // pick second <span> inside stats-item for view count
        const viewsSpan  = statsItem?.querySelectorAll('span')[1];

        return {
          index:      idx,
          articleUrl: figLink?.href   && new URL(figLink.href,  base).href,
          titleUrl:   titleLink?.href && new URL(titleLink.href,base).href,

          imageUrl:   img?.src,
          imageAlt:   img?.alt,
          imageSrcset: img?.getAttribute('srcset'),

          title:      titleEl?.textContent.trim(),
          summary:    summaryEl?.textContent.trim(),
          badge:      badgeEl?.textContent.trim(),

          datetime:   timeEl?.getAttribute('datetime'),
          ago:        timeEl?.textContent.trim(),

          author:     authorA?.textContent.trim(),
          authorUrl:  authorA?.href && new URL(authorA.href, base).href,

          views:      viewsSpan?.textContent.trim()
        };
      });
    });

    res.json(articles);
  } catch (err) {
    console.error('Scrape failed:', err);
    res.status(500).send('Scrape timeout or network error');
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
