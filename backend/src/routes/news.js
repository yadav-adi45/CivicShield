import { Router } from 'express';
import axios from 'axios';

const router = Router();

const GNEWS_API_KEY = process.env.NEWS_API_KEY || '89ec8e8af4f8848a6bda9d9c9a4e4127';
const GNEWS_API_URL = 'https://gnews.io/api/v4/search';

// Fallback news data
const FALLBACK_NEWS = [
  {
    title: "Global tensions impact fuel supply and economy",
    description: "Ongoing geopolitical tensions continue to affect global fuel supplies and economic stability.",
    source: { name: "System" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Supply chain disruptions may affect essential resources",
    description: "Experts warn of potential shortages in essential resources due to supply chain challenges.",
    source: { name: "System" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Crisis preparedness measures recommended for civilians",
    description: "Authorities advise citizens to maintain emergency supplies and stay informed about local conditions.",
    source: { name: "System" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Resource management strategies during uncertain times",
    description: "Communities implement conservation measures to ensure availability of critical resources.",
    source: { name: "System" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Safety advisories issued for high-risk regions",
    description: "Local authorities provide guidance on safety measures and emergency protocols.",
    source: { name: "System" },
    publishedAt: new Date().toISOString(),
    url: "#"
  }
];

router.get('/news', async (req, res, next) => {
  try {
    console.log('[News] Fetching latest crisis news...');

    // Build query for crisis-related news
    const query = 'war OR conflict OR fuel OR shortage OR crisis OR disaster OR emergency';
    const url = `${GNEWS_API_URL}?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&apikey=${GNEWS_API_KEY}`;

    // Fetch from GNews API
    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.articles && response.data.articles.length > 0) {
      console.log(`[News] Successfully fetched ${response.data.articles.length} articles`);
      
      // Format articles to match expected structure
      const articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: { name: article.source?.name || 'Unknown' },
        publishedAt: article.publishedAt,
        url: article.url,
        image: article.image
      }));

      return res.json({
        articles: articles,
        success: true,
        source: 'gnews'
      });
    } else {
      console.log('[News] No articles returned, using fallback');
      return res.json({
        articles: FALLBACK_NEWS,
        success: true,
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('[News] Error fetching news:', error.message);

    // Check for specific error types
    if (error.response) {
      const status = error.response.status;
      console.error(`[News] GNews API error: ${status}`);

      if (status === 401) {
        console.error('[News] Invalid API key');
      } else if (status === 429) {
        console.error('[News] Rate limit exceeded');
      }
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('[News] Request timeout');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('[News] Network error');
    }

    // Always return fallback news on error
    console.log('[News] Returning fallback news due to error');
    return res.json({
      articles: FALLBACK_NEWS,
      success: true,
      source: 'fallback',
      error: error.message
    });
  }
});

export default router;
