import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictions } from '../../hooks/usePredictions';
import { useRegion } from '../../hooks/useRegion';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { toggleTheme, getTheme } from '../../utils/theme';
import Header from '../Header/Header';
import RiskBadge from '../RiskIndicators/RiskBadge';
import CardGrid from '../PredictionCards/CardGrid';
import ExplainPanel from '../ExplainPanel/ExplainPanel';
import ActionPanel from '../ActionPanel/ActionPanel';
import AlertsPanel from '../AlertsPanel/AlertsPanel';
import OfflineBanner from '../OfflineBanner/OfflineBanner';
import { STATE_NEIGHBORS } from '../../utils/constants';
import { getOfflineResponse } from '../../utils/offlineData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const IndiaHeatMap = lazy(() => import('../HeatMap/IndiaHeatMap'));

export default function Dashboard() {
  const { data: predictions, loading, error, refresh } = usePredictions();
  const { data: regionDetail, loading: regionLoading, loadRegion, clearRegion } = useRegion();
  const isOnline = useOnlineStatus(); // Detect online/offline status
  const [selectedState, setSelectedState] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [selectedRiskType, setSelectedRiskType] = useState(null);
  const [theme, setTheme] = useState(() => getTheme());
  const [showNewsPanel, setShowNewsPanel] = useState(false);
  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [isNewsFallback, setIsNewsFallback] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const chatMessagesEndRef = React.useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  // Apply theme to document
  useEffect(() => {
    // Theme is already set by theme.js utility
    // Just sync local state
    const currentTheme = getTheme();
    if (currentTheme !== theme) {
      setTheme(currentTheme);
    }
  }, [theme]);

  const toggleThemeHandler = useCallback(() => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  }, []);

  // Fetch live crisis news
  const fetchLiveNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      // Call backend news endpoint
      const response = await fetch('/api/news');
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        // Client-side filter for crisis relevance
        const relevantKeywords = ['war', 'fuel', 'lpg', 'gas', 'crisis', 'conflict', 'shortage', 'supply', 'geopolitics', 'disaster', 'emergency', 'resource'];
        
        const filteredNews = data.articles
          .filter(article => {
            if (!article.title) return false;
            
            const titleLower = article.title.toLowerCase();
            const descLower = (article.description || '').toLowerCase();
            const combined = `${titleLower} ${descLower}`;
            
            // Must contain at least one relevant keyword
            return relevantKeywords.some(keyword => combined.includes(keyword));
          })
          .slice(0, 6)
          .map(article => ({
            title: article.title,
            source: article.source?.name || 'Unknown',
            description: article.description,
            publishedAt: article.publishedAt,
            url: article.url,
            timeAgo: getTimeAgo(article.publishedAt)
          }));
        
        // Check if we have enough crisis news
        if (filteredNews.length >= 3) {
          setLiveNews(filteredNews);
          setIsNewsFallback(false);
        } else {
          // Use all available articles as fallback
          const allNews = data.articles
            .slice(0, 6)
            .map(article => ({
              title: article.title,
              source: article.source?.name || 'Unknown',
              description: article.description,
              publishedAt: article.publishedAt,
              url: article.url,
              timeAgo: getTimeAgo(article.publishedAt)
            }));
          
          setLiveNews(allNews);
          setIsNewsFallback(true);
        }
      } else {
        // Absolute fallback
        setLiveNews([{
          title: 'Unable to fetch news at this time. Please try again later.',
          source: 'System',
          timeAgo: 'Now',
          url: '#'
        }]);
        setIsNewsFallback(true);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      // Set fallback news on error
      setLiveNews([{
        title: 'Unable to fetch live news. Please check your connection and try again.',
        source: 'System',
        timeAgo: 'Now',
        url: '#'
      }]);
      setIsNewsFallback(true);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Helper function to determine news credibility badge
  const getNewsBadge = useCallback((article) => {
    const trustedSources = [
      'bbc', 'reuters', 'the hindu', 'indian express', 
      'associated press', 'ap news', 'the guardian', 
      'times of india', 'hindustan times', 'ndtv'
    ];
    
    const sourceLower = article.source.toLowerCase();
    const titleLower = article.title.toLowerCase();
    const descLower = (article.description || '').toLowerCase();
    const combined = `${titleLower} ${descLower}`;
    
    // Check for trusted sources
    if (trustedSources.some(source => sourceLower.includes(source))) {
      return { type: 'verified', label: 'Verified' };
    }
    
    // Check for unconfirmed indicators
    const unconfirmedKeywords = ['rumor', 'unconfirmed', 'may', 'possible', 'allegedly', 'claims'];
    if (unconfirmedKeywords.some(keyword => combined.includes(keyword))) {
      return { type: 'not_confirmed', label: 'Not Confirmed' };
    }
    
    // Check for report indicators
    const reportKeywords = ['report', 'sources say', 'according to', 'officials say'];
    if (reportKeywords.some(keyword => combined.includes(keyword))) {
      return { type: 'reports', label: 'Reports' };
    }
    
    // Default to reports
    return { type: 'reports', label: 'Reports' };
  }, []);

  // Chatbot functions
  const toggleChatbot = useCallback(() => {
    setShowChatbot(prev => !prev);
  }, []);

  // Check speech recognition support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // Speech-to-text handler
  const handleVoiceInput = useCallback(() => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [speechSupported]);

  const handleSendMessage = useCallback(async (message) => {
    if (!message.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    console.log('[Frontend] Sending message to chatbot:', message);
    console.log('[Frontend] Online status:', isOnline);

    // OFFLINE MODE: Use rule-based responses
    if (!isOnline) {
      console.log('[Frontend] Offline mode - using local responses');
      
      // Simulate thinking delay
      setTimeout(() => {
        const offlineReply = getOfflineResponse(message);
        const botMessage = {
          role: 'assistant',
          content: offlineReply + '\n\n⚠️ Offline mode active. Reconnect for AI-powered guidance.'
        };
        setChatMessages(prev => [...prev, botMessage]);
        setChatLoading(false);
      }, 500);
      
      return;
    }

    // ONLINE MODE: Use AI
    // Build context from selected state data
    let context = null;
    if (selectedState && regionDetail) {
      context = {
        state: regionDetail.state,
        stateCode: regionDetail.code,
        riskLevel: regionDetail.risk.risk_level,
        riskScore: regionDetail.risk.risk_score,
        shortages: regionDetail.shortages.slice(0, 3).map(s => ({
          resource: s.resource_label,
          probability: s.probability,
          severity: s.severity,
          trend: s.trend
        })),
        topFactors: regionDetail.explanation?.contributing_factors?.slice(0, 2).map(f => f.factor) || []
      };
      console.log('[Frontend] Context:', context);
    }

    try {
      // Call backend chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: chatMessages.slice(-4), // Last 4 messages for context
          context: context // Pass state context
        })
      });

      console.log('[Frontend] Response status:', response.status);
      const data = await response.json();
      console.log('[Frontend] Response data:', data);
      
      if (response.ok && data.reply) {
        const botMessage = {
          role: 'assistant',
          content: data.reply
        };
        setChatMessages(prev => [...prev, botMessage]);
        console.log('[Frontend] ✅ Bot reply received:', data.reply.substring(0, 50) + '...');
      } else {
        // Use fallback message from backend if available
        const fallbackContent = data.reply || data.message || 'I encountered an issue. Please try again.';
        console.error('[Frontend] ❌ Error response:', data);
        const botMessage = {
          role: 'assistant',
          content: fallbackContent
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('[Frontend] ❌ Chatbot error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please check that all services are running and try again.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  }, [chatMessages, chatLoading, selectedState, regionDetail, isOnline]);

  const handleSuggestedQuestion = useCallback((question) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  // Toggle news panel and fetch on open
  const handleToggleNews = useCallback(() => {
    if (!showNewsPanel) {
      fetchLiveNews();
    }
    setShowNewsPanel(prev => !prev);
  }, [showNewsPanel, fetchLiveNews]);

  const handleCloseNews = useCallback(() => {
    setShowNewsPanel(false);
  }, []);

  // Auto-refresh news every 60 seconds when panel is open
  useEffect(() => {
    if (showNewsPanel) {
      const interval = setInterval(() => {
        fetchLiveNews();
      }, 60000); // 60 seconds
      
      return () => clearInterval(interval);
    }
  }, [showNewsPanel, fetchLiveNews]);

  const handleStateSelect = useCallback((code) => {
    if (code === null) {
      setSelectedState(null);
      clearRegion();
      return;
    }
    setSelectedState(code);
    loadRegion(code);
  }, [loadRegion, clearRegion]);

  const handleCloseDetail = useCallback(() => {
    setSelectedState(null);
    clearRegion();
  }, [clearRegion]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
  }, []);

  const handleRiskCardClick = useCallback((riskType) => {
    setSelectedRiskType(riskType);
    setShowRiskPanel(true);
  }, []);

  const handleCloseRiskPanel = useCallback(() => {
    setShowRiskPanel(false);
    setSelectedRiskType(null);
  }, []);

  // Apply simulation overlay to predictions data
  const displayData = useMemo(() => {
    if (!predictions || !isSimulating) return predictions;

    // Clone predictions to avoid mutating original
    const simulated = JSON.parse(JSON.stringify(predictions));

    // Find Punjab and apply crisis simulation
    const punjabIndex = simulated.states.findIndex(s => s.code === 'PB');
    if (punjabIndex !== -1) {
      const punjab = simulated.states[punjabIndex];
      
      // Override risk to HIGH
      punjab.risk.risk_score = 0.85;
      punjab.risk.risk_level = 'High';
      punjab.risk.component_scores.supply_disruption = 0.9;
      punjab.risk.component_scores.demand_spike = 0.8;
      punjab.risk.component_scores.news_severity = 0.85;

      // Override LPG to CRITICAL
      const lpgIndex = punjab.shortages.findIndex(s => s.resource === 'lpg');
      if (lpgIndex !== -1) {
        punjab.shortages[lpgIndex].probability = 0.87;
        punjab.shortages[lpgIndex].severity = 'critical';
        punjab.shortages[lpgIndex].trend = 'rising';
        punjab.shortages[lpgIndex].signal_count = 5;
      }

      // Sort shortages by probability
      punjab.shortages.sort((a, b) => b.probability - a.probability);

      // Move Punjab to top of states list
      simulated.states.splice(punjabIndex, 1);
      simulated.states.unshift(punjab);

      // Update risk counts
      simulated.total_high_risk = simulated.states.filter(s => s.risk.risk_level === 'High').length;
      simulated.total_medium_risk = simulated.states.filter(s => s.risk.risk_level === 'Medium').length;
      simulated.total_low_risk = simulated.states.filter(s => s.risk.risk_level === 'Low').length;
    }

    return simulated;
  }, [predictions, isSimulating]);

  const stats = useMemo(() => {
    if (!displayData) return null;
    return {
      high: displayData.total_high_risk,
      medium: displayData.total_medium_risk,
      low: displayData.total_low_risk,
    };
  }, [displayData]);

  // Get shortages for selected state or top risk state
  const selectedStateData = useMemo(() => 
    displayData?.states?.find(s => s.code === selectedState),
    [displayData, selectedState]
  );

  // Calculate recommended safe region
  const safeRegion = useMemo(() => {
    if (!displayData?.states) return null;
    
    // If a state is selected, find safest neighbor
    if (selectedState) {
      const neighborCodes = STATE_NEIGHBORS[selectedState] || [];
      
      if (neighborCodes.length > 0) {
        // Get neighbor state data
        const neighbors = displayData.states.filter(s => neighborCodes.includes(s.code));
        
        if (neighbors.length > 0) {
          // Find neighbor with lowest risk score
          return neighbors.reduce((prev, curr) => 
            curr.risk.risk_score < prev.risk.risk_score ? curr : prev
          );
        }
      }
    }
    
    // Fallback: Find globally safest state
    // Find states with Low risk
    const lowRiskStates = displayData.states.filter(s => s.risk.risk_level === 'Low');
    
    if (lowRiskStates.length === 0) {
      // If no low risk states, find lowest risk score
      const sorted = [...displayData.states].sort((a, b) => a.risk.risk_score - b.risk.risk_score);
      return sorted[0];
    }
    
    // Among low risk states, pick the one with lowest risk score
    const safest = lowRiskStates.reduce((prev, curr) => 
      curr.risk.risk_score < prev.risk.risk_score ? curr : prev
    );
    
    return safest;
  }, [displayData, selectedState]);

  const handleDownloadReport = useCallback(() => {
    if (!regionDetail) return;

    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const report = `
╔════════════════════════════════════════════════════════════════╗
║           CIVICSHIELD CRISIS INTELLIGENCE REPORT               ║
╚════════════════════════════════════════════════════════════════╝

Generated: ${timestamp}
${isSimulating ? '⚠️  SIMULATION MODE ACTIVE\n' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 STATE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
State:          ${regionDetail.state}
State Code:     ${regionDetail.code}
Risk Level:     ${regionDetail.risk.risk_level.toUpperCase()}
Risk Score:     ${(regionDetail.risk.risk_score * 100).toFixed(1)}%

Component Breakdown:
  • Supply Disruption:  ${(regionDetail.risk.component_scores.supply_disruption * 100).toFixed(1)}%
  • Demand Spike:       ${(regionDetail.risk.component_scores.demand_spike * 100).toFixed(1)}%
  • News Severity:      ${(regionDetail.risk.component_scores.news_severity * 100).toFixed(1)}%
  • Baseline Risk:      ${(regionDetail.risk.component_scores.baseline_risk * 100).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESOURCE SHORTAGE PREDICTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${regionDetail.shortages.map(s => `
${s.resource_label.toUpperCase()}
  Shortage Probability: ${(s.probability * 100).toFixed(1)}%
  Severity:             ${s.severity.toUpperCase()}
  Trend:                ${s.trend.toUpperCase()}
  Signal Count:         ${s.signal_count} news signal(s)
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 EXPLANATION - WHY THIS PREDICTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${regionDetail.explanation.summary}

Confidence Level: ${regionDetail.explanation.confidence.level.toUpperCase()}
Signal Count:     ${regionDetail.explanation.confidence.signal_count}
Explanation:      ${regionDetail.explanation.confidence.explanation}

CONTRIBUTING FACTORS:
${regionDetail.explanation.contributing_factors.map((f, i) => `
${i + 1}. ${f.factor} [Impact: ${f.impact.toUpperCase()}]
   ${f.detail}
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${regionDetail.explanation.actions.length > 0 ? regionDetail.explanation.actions.map((a, i) => `
${i + 1}. ${a.resource} [Urgency: ${a.urgency.toUpperCase()}]
   ${a.recommendation}
`).join('') : '\n✅ No immediate actions required. Conditions are stable.\n'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ SAFE ZONE RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${safeRegion ? `
Recommended Safe Region: ${safeRegion.state}
Risk Score:              ${(safeRegion.risk.risk_score * 100).toFixed(1)}%
Risk Level:              ${safeRegion.risk.risk_level}
${selectedState ? `(Nearest safe neighbor to ${regionDetail.state})` : '(Safest region nationally)'}
` : 'No safe region data available'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 INTELLIGENCE SIGNALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${regionDetail.news_signals.length > 0 ? regionDetail.news_signals.map((s, i) => `
${i + 1}. ${s.headline}
   Category: ${s.category.replace('_', ' ')}
   Severity: ${(s.severity * 100).toFixed(0)}%
   Source:   ${s.source}
   Date:     ${s.date}
`).join('') : '\n✅ No active crisis signals detected.\n'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Report generated by CivicShield — Civilian Crisis Intelligence System
For emergency assistance, contact local authorities or dial 112
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CivicShield_Report_${regionDetail.code}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [regionDetail, safeRegion, selectedState, isSimulating]);

  // Filter states by risk level for panel
  const filteredStates = useMemo(() => {
    if (!displayData?.states || !selectedRiskType) return [];
    
    const riskLevelMap = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    
    return displayData.states.filter(s => s.risk.risk_level === riskLevelMap[selectedRiskType]);
  }, [displayData, selectedRiskType]);

  // Generate timeline data for selected state
  const timelineData = useMemo(() => {
    if (!selectedState || !displayData?.states) return null;
    
    const stateData = displayData.states.find(s => s.code === selectedState);
    if (!stateData) return null;
    
    const currentRisk = stateData.risk.risk_score;
    const trend = stateData.shortages[0]?.trend || 'stable';
    
    // Generate simulated timeline (past 3 days + today + next 3 days)
    const timeline = [];
    const baseVariation = 0.05;
    
    for (let day = -3; day <= 3; day++) {
      let risk;
      
      if (day < 0) {
        // Past: gradually increase to current
        const progress = (day + 3) / 3;
        risk = currentRisk * (0.6 + 0.4 * progress);
      } else if (day === 0) {
        // Today: current risk
        risk = currentRisk;
      } else {
        // Future: project based on trend
        if (trend === 'rising') {
          risk = Math.min(currentRisk + (day * 0.08), 1.0);
        } else if (trend === 'falling') {
          risk = Math.max(currentRisk - (day * 0.05), 0.0);
        } else {
          risk = currentRisk + (Math.random() - 0.5) * baseVariation;
        }
      }
      
      // Add small random variation
      risk = Math.max(0, Math.min(1, risk + (Math.random() - 0.5) * baseVariation));
      
      timeline.push({
        day: day,
        dayLabel: day === 0 ? 'Today' : day < 0 ? `${Math.abs(day)}d ago` : `+${day}d`,
        risk: parseFloat(risk.toFixed(3)),
        riskPercent: parseFloat((risk * 100).toFixed(1))
      });
    }
    
    return timeline;
  }, [selectedState, displayData]);

  return (
    <>
      {/* Offline Banner */}
      <OfflineBanner isOnline={isOnline} />
      
      <Header 
        stats={stats} 
        onRefresh={refresh} 
        isSimulating={isSimulating} 
        onToggleSimulation={toggleSimulation}
        theme={theme}
        onToggleTheme={toggleThemeHandler}
        onToggleNews={handleToggleNews}
        showNewsPanel={showNewsPanel}
      />

      <main className="dashboard" id="dashboard">
        {loading && !predictions ? (
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <span className="loading-text">Analyzing crisis intelligence...</span>
          </div>
        ) : error && !predictions ? (
          <div className="dashboard-error glass-card">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Service Temporarily Unavailable</h3>
            <p className="error-message">{error}</p>
            <div className="error-details">
              <p className="error-hint">Common causes:</p>
              <ul className="error-list">
                <li>Backend service not running (port 5000)</li>
                <li>ML service not running (port 8000)</li>
                <li>Network connectivity issues</li>
                <li>Service is starting up or restarting</li>
              </ul>
            </div>
            <button className="error-retry" onClick={refresh}>
              <span>🔄</span> Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* Risk Indicator Badges */}
            <div className="dashboard-risk-row">
              <RiskBadge stats={stats} onRiskClick={handleRiskCardClick} />
            </div>

            {/* Risk Panel Overlay */}
            {showRiskPanel && (
              <>
                <div className="risk-panel-overlay" onClick={handleCloseRiskPanel} />
                <div className="risk-panel glass-card" onClick={(e) => e.stopPropagation()}>
                  <div className="risk-panel-header">
                    <h3 className="risk-panel-title">
                      {selectedRiskType === 'high' && '🔴 High Risk States'}
                      {selectedRiskType === 'medium' && '🟡 Medium Risk States'}
                      {selectedRiskType === 'low' && '🟢 Low Risk States'}
                    </h3>
                    <button className="risk-panel-close" onClick={handleCloseRiskPanel}>✕</button>
                  </div>
                  <div className="risk-panel-content">
                    {filteredStates.length > 0 ? (
                      <div className="risk-panel-list">
                        {filteredStates.map((state) => (
                          <div 
                            key={state.code} 
                            className="risk-panel-item"
                            onClick={() => {
                              handleStateSelect(state.code);
                              handleCloseRiskPanel();
                            }}
                          >
                            <div className="risk-panel-item-info">
                              <span className="risk-panel-item-name">{state.state}</span>
                              <span className="risk-panel-item-code">{state.code}</span>
                            </div>
                            <div className="risk-panel-item-score">
                              {(state.risk.risk_score * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="risk-panel-empty">
                        No states in this category
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Live News Panel */}
            {showNewsPanel && (
              <>
                <div className="news-panel-overlay" onClick={handleCloseNews} />
                <div className="news-panel glass-card" onClick={(e) => e.stopPropagation()}>
                  <div className="news-panel-header">
                    <div className="news-panel-title-wrapper">
                      <h3 className="news-panel-title">
                        {isNewsFallback ? '📰 Latest Updates' : '⚡ Live Crisis Updates'}
                      </h3>
                      {isNewsFallback && (
                        <span className="news-panel-subtitle">Showing latest general updates</span>
                      )}
                    </div>
                    <div className="news-panel-actions">
                      <button 
                        className="news-panel-refresh" 
                        onClick={fetchLiveNews}
                        disabled={newsLoading}
                        title="Refresh news"
                      >
                        {newsLoading ? '⟳' : '↻'}
                      </button>
                      <button className="news-panel-close" onClick={handleCloseNews}>✕</button>
                    </div>
                  </div>
                  <div className="news-panel-content">
                    {newsLoading && liveNews.length === 0 ? (
                      <div className="news-panel-loading">
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <span className="loading-text">Fetching latest updates...</span>
                      </div>
                    ) : liveNews.length > 0 ? (
                      <div className="news-panel-list">
                        {liveNews.map((news, index) => {
                          const badge = getNewsBadge(news);
                          return (
                            <a 
                              key={index}
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="news-panel-item"
                            >
                              <div className="news-panel-item-content">
                                <div className="news-panel-item-header">
                                  <div className="news-panel-item-title">{news.title}</div>
                                  <span className={`news-badge news-badge-${badge.type}`}>
                                    {badge.label}
                                  </span>
                                </div>
                                <div className="news-panel-item-meta">
                                  <span className="news-panel-item-source">{news.source}</span>
                                  <span className="news-panel-item-time">{news.timeAgo}</span>
                                </div>
                              </div>
                              <div className="news-panel-item-icon">→</div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="news-panel-empty">
                        No crisis updates available
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Main Content: Map + Sidebar */}
            <div className="dashboard-map">
              <Suspense fallback={
                <div className="glass-card heatmap-card" style={{ padding: 'var(--space-lg)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <span className="loading-text">Loading map...</span>
                  </div>
                </div>
              }>
                <IndiaHeatMap
                  predictions={displayData}
                  selectedState={selectedState}
                  onStateSelect={handleStateSelect}
                />
              </Suspense>

              {/* Safe Region Recommendation */}
              {safeRegion && (
                <div className="glass-card safe-region-card">
                  <div className="safe-region-content">
                    <span className="safe-region-icon">🛡️</span>
                    <div className="safe-region-text">
                      <span className="safe-region-label">Recommended Safe Region</span>
                      <span className="safe-region-name">{safeRegion.state}</span>
                    </div>
                    <div className="safe-region-score">
                      {(safeRegion.risk.risk_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Crisis Timeline Graph */}
              {selectedState && timelineData && (
                <div className="glass-card timeline-card">
                  <div className="timeline-header">
                    <h3 className="timeline-title">📈 Risk Timeline</h3>
                    <span className="timeline-subtitle">7-day trend projection</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="dayLabel" 
                        stroke="var(--text-muted)" 
                        style={{ fontSize: '0.7rem' }}
                        tick={{ fill: 'var(--text-muted)' }}
                      />
                      <YAxis 
                        domain={[0, 1]}
                        ticks={[0, 0.25, 0.5, 0.75, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        stroke="var(--text-muted)"
                        style={{ fontSize: '0.7rem' }}
                        tick={{ fill: 'var(--text-muted)' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(13, 19, 50, 0.95)',
                          border: '1px solid var(--border-accent)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-primary)'
                        }}
                        formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Risk']}
                        labelStyle={{ color: 'var(--text-secondary)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="risk" 
                        stroke="var(--accent-primary)" 
                        strokeWidth={2}
                        dot={{ fill: 'var(--accent-primary)', r: 4 }}
                        activeDot={{ r: 6, fill: 'var(--accent-primary)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="dashboard-sidebar">
              {selectedState && regionDetail ? (
                /* Region Detail View */
                <div className="region-detail">
                  <div className="glass-card region-header">
                    <div className="region-header-top">
                      <h2 className="region-name">
                        📍 {regionDetail.state}
                      </h2>
                      <div className="region-header-actions">
                        <button 
                          className="region-download" 
                          onClick={handleDownloadReport}
                          title="Download crisis report"
                        >
                          📥 Download Report
                        </button>
                        <button className="region-close" onClick={handleCloseDetail}>✕</button>
                      </div>
                    </div>

                    <div className="region-risk-display">
                      <div className={`region-score ${regionDetail.risk.risk_level.toLowerCase()}`}>
                        {(regionDetail.risk.risk_score * 100).toFixed(0)}%
                      </div>
                      <div className="region-score-details">
                        <span className={`region-level-badge ${regionDetail.risk.risk_level.toLowerCase()}`}>
                          {regionDetail.risk.risk_level} Risk
                        </span>
                        <div className="region-components">
                          <div className="component-bar">
                            <span className="component-label">Supply</span>
                            <span className="component-value">
                              {(regionDetail.risk.component_scores.supply_disruption * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="component-bar">
                            <span className="component-label">Demand</span>
                            <span className="component-value">
                              {(regionDetail.risk.component_scores.demand_spike * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="component-bar">
                            <span className="component-label">News</span>
                            <span className="component-value">
                              {(regionDetail.risk.component_scores.news_severity * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardGrid shortages={regionDetail.shortages} title="Resource Shortage Predictions" />
                  <ExplainPanel explanation={regionDetail.explanation} />
                  <ActionPanel actions={regionDetail.explanation?.actions} />

                  {regionDetail.news_signals?.length > 0 && (
                    <div className="glass-card news-signals">
                      <h3 className="news-title">📰 Intelligence Signals</h3>
                      <div className="news-list">
                        {regionDetail.news_signals.map((signal, i) => (
                          <div key={i} className="news-item">
                            <div className="news-headline">{signal.headline}</div>
                            <div className="news-meta">
                              <span className="news-category">{signal.category.replace('_', ' ')}</span>
                              <span>{signal.source}</span>
                              <span>{signal.date}</span>
                              <span>Severity: {(signal.severity * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : regionLoading ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                  <span className="loading-text">Loading region data...</span>
                </div>
              ) : (
                /* Default sidebar: Alerts + Top Prediction Cards */
                <>
                  <AlertsPanel predictions={displayData} onStateSelect={handleStateSelect} />
                  {displayData?.states?.[0] && (
                    <CardGrid
                      shortages={displayData.states[0].shortages}
                      title={`Top Risk: ${displayData.states[0].state}`}
                    />
                  )}
                </>
              )}
            </div>

            {/* Bottom Section: Explain + Action for overview */}
            {!selectedState && (
              <div className="dashboard-bottom">
                <ActionPanel actions={[
                  {
                    resource: 'General Advisory',
                    recommendation: 'Click on any state on the map to see detailed predictions, explanations, and personalized action recommendations.',
                    urgency: 'normal'
                  }
                ]} />
                {displayData?.states?.[1] && (
                  <CardGrid
                    shortages={displayData.states[1].shortages}
                    title={`#2 Risk: ${displayData.states[1].state}`}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* AI Chatbot */}
      <AnimatePresence>
        {showChatbot && (
          <>
            <motion.div
              className="chatbot-overlay"
              onClick={toggleChatbot}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <div className="chatbot-modal-container">
              <motion.div
                className="chatbot-modal glass-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
              <div className="chatbot-header">
                <div className="chatbot-header-text">
                  <h3 className="chatbot-title">
                    Ask CivicShield
                    {!isOnline && <span className="offline-badge">Offline</span>}
                  </h3>
                  <span className="chatbot-subtitle">
                    {selectedState && regionDetail 
                      ? `Context: ${regionDetail.state} (${regionDetail.risk.risk_level} Risk)`
                      : isOnline ? 'Crisis Assistant' : 'Emergency Guides Available'
                    }
                  </span>
                </div>
                <button className="chatbot-close" onClick={toggleChatbot}>✕</button>
              </div>

              <div className="chatbot-messages">
                {chatMessages.length === 0 ? (
                  <div className="chatbot-welcome">
                    <div className="chatbot-welcome-icon">{isOnline ? '🛡️' : '📡'}</div>
                    <p className="chatbot-welcome-text">
                      {!isOnline ? (
                        'Offline mode. I can provide emergency guidance for water, food, fuel shortages, medical emergencies, and evacuation procedures.'
                      ) : selectedState && regionDetail ? (
                        `Crisis intelligence for ${regionDetail.state}. Ask about risks, shortages, or safety measures.`
                      ) : (
                        'Crisis intelligence assistant. Ask about safety, resource shortages, or emergency preparedness.'
                      )}
                    </p>
                    <div className="chatbot-suggestions">
                      {!isOnline ? (
                        <>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Water shortage')}
                          >
                            Water shortage
                          </button>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Emergency contacts')}
                          >
                            Emergency contacts
                          </button>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Evacuation guidance')}
                          >
                            Evacuation guidance
                          </button>
                        </>
                      ) : selectedState && regionDetail ? (
                        <>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion(`Risk assessment for ${regionDetail.state}`)}
                          >
                            Risk assessment
                          </button>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('What should I prepare?')}
                          >
                            What to prepare
                          </button>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Safety measures')}
                          >
                            Safety measures
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Current crisis risks')}
                          >
                            Current risks
                          </button>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Resource shortage guidance')}
                          >
                            Resource shortages
                          </button>
                          <button 
                            className="chatbot-suggestion"
                            onClick={() => handleSuggestedQuestion('Emergency preparedness')}
                          >
                            Emergency prep
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-bot'}`}
                      >
                        <div className="chatbot-message-content">
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="chatbot-message chatbot-message-bot">
                        <div className="chatbot-message-content">
                          <div className="chatbot-typing">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatMessagesEndRef} />
                  </>
                )}
              </div>

              <div className="chatbot-input-area">
                <div className="chat-input-wrapper">
                  <div className="chat-tools">
                    <button className="icon-btn" title="Attach file" disabled>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="4" x2="8" y2="12" />
                        <line x1="4" y1="8" x2="12" y2="8" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about safety, shortages, or crisis..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(chatInput);
                      }
                    }}
                    disabled={chatLoading || chatMessages.length >= 10}
                  />
                  <div className="chat-actions">
                    <button
                      className={`icon-btn mic-btn ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
                      onClick={handleVoiceInput}
                      disabled={!speechSupported || chatLoading || chatMessages.length >= 10}
                      title={speechSupported ? (isListening ? 'Listening...' : 'Voice input') : 'Voice not supported'}
                      aria-label="Voice input"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="2" width="4" height="7" rx="2" />
                        <path d="M4 9a4 4 0 0 0 8 0" />
                        <line x1="8" y1="13" x2="8" y2="15" />
                      </svg>
                    </button>
                    <button 
                      className="send-btn"
                      onClick={() => handleSendMessage(chatInput)}
                      disabled={chatLoading || !chatInput.trim() || chatMessages.length >= 10}
                      title="Send message"
                      aria-label="Send message"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8L14 2L8 14L7 9L2 8Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {isListening && (
                <div className="chatbot-listening-indicator">
                  <span className="listening-pulse"></span>
                  Listening...
                </div>
              )}

              {chatMessages.length >= 10 && (
                <div className="chatbot-limit-notice">
                  Message limit reached. Refresh to start new conversation.
                </div>
              )}
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chatbot Button */}
      <button 
        className="chatbot-float-button"
        onClick={toggleChatbot}
        title="Ask CivicShield"
      >
        💬
      </button>
    </>
  );
}
