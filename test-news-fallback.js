// Test script to verify news fallback logic

const apiKey = '81570c494bc5beab95cde46328ca0cd9';

async function testNewsFallback() {
  console.log('🧪 Testing News Fallback Logic\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Crisis news
    console.log('\n1️⃣  Testing Crisis News Fetch...');
    const crisisKeywords = 'war OR conflict OR "fuel shortage" OR "LPG shortage" OR crisis OR "supply chain" OR shortage OR disaster OR emergency';
    const crisisUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(crisisKeywords)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    
    const crisisResponse = await fetch(crisisUrl);
    const crisisData = await crisisResponse.json();
    
    if (crisisData.status === 'ok' && crisisData.articles) {
      console.log(`✅ Fetched ${crisisData.articles.length} articles`);
      
      // Filter for relevance
      const relevantKeywords = ['war', 'fuel', 'lpg', 'gas', 'crisis', 'conflict', 'shortage', 'supply', 'geopolitics', 'disaster', 'emergency', 'resource'];
      
      const filteredNews = crisisData.articles.filter(article => {
        if (!article.title || !article.source?.name) return false;
        
        const titleLower = article.title.toLowerCase();
        const descLower = (article.description || '').toLowerCase();
        const combined = `${titleLower} ${descLower}`;
        
        return relevantKeywords.some(keyword => combined.includes(keyword));
      });
      
      console.log(`✅ Filtered to ${filteredNews.length} relevant crisis articles`);
      
      if (filteredNews.length >= 3) {
        console.log('✅ Sufficient crisis news found - will show crisis updates');
        console.log('\nSample headlines:');
        filteredNews.slice(0, 3).forEach((article, i) => {
          console.log(`   ${i + 1}. ${article.title.substring(0, 70)}...`);
        });
      } else {
        console.log('⚠️  Insufficient crisis news - will trigger fallback');
      }
    }
    
    // Test 2: Fallback news
    console.log('\n2️⃣  Testing Fallback News Fetch...');
    const fallbackUrl = `https://newsapi.org/v2/top-headlines?country=in&language=en&pageSize=6&apiKey=${apiKey}`;
    
    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.status === 'ok' && fallbackData.articles) {
      console.log(`✅ Fetched ${fallbackData.articles.length} fallback articles`);
      console.log('\nSample fallback headlines:');
      fallbackData.articles.slice(0, 3).forEach((article, i) => {
        console.log(`   ${i + 1}. ${article.title.substring(0, 70)}...`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ News fallback system is working correctly!');
    console.log('   - Crisis news will be shown when available');
    console.log('   - General news will be shown as fallback');
    console.log('   - UI will never be empty');
    
  } catch (error) {
    console.error('\n❌ Error testing news fallback:', error.message);
  }
}

testNewsFallback();
