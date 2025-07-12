# RSS→Appwrite News Scraper

## Setup

1. Clone this repo and `cd server/`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your Appwrite keys.
4. Run `npm start` to launch the server.

## Endpoints

- `GET /scrape-news` — fetch & store latest articles
- `GET /search?q=&author=&start=&end=&page=&limit=` — paginated search

## Deployment

- Ensure your `.env` is set in your host (Heroku, Vercel, Docker, etc.).
- Add your server URL to Appwrite’s CORS settings.