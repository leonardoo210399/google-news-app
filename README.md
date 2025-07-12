# google-news-app

mkdir -p server/{config,models,routes,controllers,services,utils} && \
cd server && \
touch .env .gitignore README.md server.js \
config/appwrite.js \
models/Article.js \
routes/scraper.js routes/search.js \
controllers/scraperController.js controllers/searchController.js \
services/appwriteService.js \
utils/rssParser.js utils/scheduler.js
