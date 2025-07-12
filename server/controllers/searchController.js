// server/controllers/searchController.js
import { Query } from 'node-appwrite';
import { searchArticles } from '../services/appwriteService.js';

export const searchNews = async (req, res) => {
  const { q, author, start, end, page = 1, limit = 10 } = req.query;
  const filters = [];
  if (q) {
    filters.push(Query.search('title', q));
    filters.push(Query.search('summary', q));
  }
  if (author) filters.push(Query.equal('author', author));
  if (start)  filters.push(Query.greaterThan('datetime', start));
  if (end)    filters.push(Query.lessThan('datetime', end));

  const offset = (page - 1) * limit;
  try {
    const result = await searchArticles(filters, +limit, offset);
    res.json({
      page:   +page,
      limit:  +limit,
      total:  result.total,
      results: result.documents,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Search error');
  }
};
