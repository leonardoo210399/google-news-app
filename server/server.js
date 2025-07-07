// server.js
const express   = require('express');
const puppeteer = require('puppeteer');
const cors      = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// scroll helper\
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const { scrollHeight } = document.documentElement;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// one-shot scraper
async function scrapeLatestNews(browser) {
  const URL = 'https://cointelegraph.com/category/latest-news';
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

  // scroll through to trigger lazy-loads
  await autoScroll(page);
  await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));

  // extract articles
  const articles = await page.$$eval('article.post-card-inline', nodes =>
    nodes.map(node => {
      const get = (sel, attr = 'innerText') => {
        const el = node.querySelector(sel);
        if (!el) return null;
        return attr === 'innerText'
          ? el.innerText.trim()
          : el.getAttribute(attr);
      };

      return {
        url         : 'https://cointelegraph.com' + get('.post-card-inline__title-link','href'),
        title       : get('.post-card-inline__title-link'),
        image       : get('img.lazy-image__img','src'),
        badge       : get('.post-card-inline__badge'),
        datetime    : get('time','datetime'),
        timeAgo     : get('time'),
        author      : get('.post-card-inline__author a'),
        description : get('.post-card-inline__text'),
        views       : get('.post-card-inline__stats-item span:last-child')
      };
    })
  );

  // grab full HTML and inject <base>
  let html = await page.content();
  html = html.replace(
    /<head([^>]*)>/i,
    `<head$1>\n<base href="https://cointelegraph.com/">`
  );

  await page.close();
  return { articles, html };
}

// launch a single browser for all requests
let browserPromise = puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

app.get('/api/latest-news', async (req, res) => {
  try {
    const browser = await browserPromise;
    const { articles } = await scrapeLatestNews(browser);
    res.json(articles);
  } catch (err) {
    console.error('Error scraping JSON:', err);
    res.status(500).send('Error scraping latest news');
  }
});

app.get('/api/latest-news/html', async (req, res) => {
  try {
    const browser = await browserPromise;
    const { html } = await scrapeLatestNews(browser);
    res.type('html').send(html);
  } catch (err) {
    console.error('Error scraping HTML:', err);
    res.status(500).send('Error scraping latest news');
  }
});

app.listen(PORT, () => {
  console.log(`📡 Backend running: http://localhost:${PORT}`);
});