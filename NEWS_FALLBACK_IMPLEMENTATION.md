# Live Crisis News - Fallback System Implementation

## Overview
Implemented a smart fallback system to ensure the Live Crisis News panel always shows useful content, even when crisis-specific news is unavailable.

---

## Implementation Details

### 1. Primary Filter (Crisis News)

**Keywords Used:**
- war
- conflict
- fuel
- shortage
- lpg
- crisis
- supply chain
- disaster
- emergency
- resource
- geopolitics

**Filtering Logic:**
```javascript
const filteredNews = articles.filter(article => {
  const combined = `${article.title} ${article.description}`.toLowerCase();
  return relevantKeywords.some(keyword => combined.includes(keyword));
});
```

---

### 2. Fallback Hierarchy

The system follows a three-tier fallback approach:

#### Tier 1: Crisis-Specific News (Primary)
- Fetches news using crisis keywords
- Filters for relevance
- **Threshold:** Minimum 3 relevant articles required
- **Label:** "⚡ Live Crisis Updates"

#### Tier 2: General Trending News (Fallback)
- Fetches top headlines from India
- Shows latest general news
- **Trigger:** When crisis news < 3 articles
- **Label:** "📰 Latest Updates" + subtitle "Showing latest general updates"

#### Tier 3: Any Available News (Last Resort)
- Shows any available articles from initial fetch
- **Trigger:** When both primary and fallback fail
- **Label:** "📰 Latest Updates" + subtitle

#### Tier 4: Error Message (Absolute Fallback)
- Shows system message
- **Trigger:** Complete API failure
- **Message:** "Unable to fetch news. Please try again later."

---

### 3. UI Improvements

**Dynamic Title:**
- Crisis news: "⚡ Live Crisis Updates"
- Fallback news: "📰 Latest Updates"

**Subtitle Indicator:**
- Only shown when using fallback
- Text: "Showing latest general updates"
- Style: Italic, muted color

**Always Shows Content:**
- Minimum 3-6 news items guaranteed
- Never shows empty state
- Graceful error handling

---

### 4. Code Changes

**Files Modified:**
1. `frontend/src/components/Dashboard/Dashboard.jsx`
   - Added `isNewsFallback` state
   - Implemented multi-tier fallback logic
   - Updated UI to show dynamic labels

2. `frontend/src/components/RiskIndicators/RiskIndicators.css`
   - Added `.news-panel-title-wrapper`
   - Added `.news-panel-subtitle`
   - Responsive styling

---

## Testing

### Test Scenarios

✅ **Scenario 1: Crisis News Available**
- Result: Shows filtered crisis news
- Label: "⚡ Live Crisis Updates"
- No subtitle shown

✅ **Scenario 2: Insufficient Crisis News**
- Result: Shows general trending news
- Label: "📰 Latest Updates"
- Subtitle: "Showing latest general updates"

✅ **Scenario 3: API Error**
- Result: Shows error message
- Label: "📰 Latest Updates"
- User can retry with refresh button

✅ **Scenario 4: Network Failure**
- Result: Shows fallback message
- System remains stable
- No UI crash

---

## Benefits

1. **Better UX:** Users always see content
2. **Graceful Degradation:** Multiple fallback levels
3. **Transparency:** Clear labeling when showing fallback
4. **Reliability:** Never shows empty state
5. **Flexibility:** Adapts to API availability

---

## API Endpoints Used

### Primary (Crisis News)
```
GET https://newsapi.org/v2/everything
Parameters:
  - q: crisis keywords (OR combined)
  - language: en
  - sortBy: publishedAt
  - pageSize: 20
```

### Fallback (General News)
```
GET https://newsapi.org/v2/top-headlines
Parameters:
  - country: in
  - language: en
  - pageSize: 6
```

---

## Configuration

**Minimum Articles Threshold:** 3
- Can be adjusted based on requirements
- Currently set to ensure quality over quantity

**Refresh Interval:** 60 seconds (when panel open)
- Automatic refresh for latest updates
- Manual refresh button available

**Filter Keywords:** 12 crisis-related terms
- Can be expanded for broader coverage
- Can be narrowed for more specific results

---

## Future Enhancements

Potential improvements:
1. Cache fallback news for offline mode
2. Add user preference for news categories
3. Implement smart keyword learning
4. Add news source filtering
5. Support multiple languages

---

## Maintenance

**Regular Checks:**
- Monitor API rate limits
- Update keywords based on current events
- Review fallback trigger threshold
- Test with various network conditions

**API Key Management:**
- Current key: Stored in Dashboard component
- Consider moving to environment variables
- Monitor usage and quotas

---

## Summary

The Live Crisis News feature now guarantees content availability through a robust multi-tier fallback system. Users will always see relevant information, whether crisis-specific or general news, ensuring a consistent and reliable experience.
