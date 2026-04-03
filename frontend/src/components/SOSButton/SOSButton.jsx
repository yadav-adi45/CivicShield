import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SOSButton.css';

export default function SOSButton() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Type, 2: Location, 3: Description, 4: Actions
  const [emergencyType, setEmergencyType] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [sosMessage, setSosMessage] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const openModal = useCallback(() => {
    setShowModal(true);
    setStep(1);
    setEmergencyType(null);
    setLocation(null);
    setLocationError(null);
    setDescription('');
    setSosMessage('');
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setStep(1);
    setEmergencyType(null);
    setLocation(null);
    setLocationError(null);
    setDescription('');
    setSosMessage('');
  }, []);

  // Get user location
  const getLocation = useCallback(() => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy,
          mapsLink: `https://maps.google.com/?q=${latitude},${longitude}`
        });
        setIsLoadingLocation(false);
        setStep(3); // Move to description step
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Handle emergency type selection
  const selectEmergencyType = useCallback((type) => {
    setEmergencyType(type);
    setStep(2);
    // Auto-trigger location fetch
    setTimeout(() => getLocation(), 100);
  }, [getLocation]);

  // Voice input for description
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
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
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

  // Generate SOS message
  const generateMessage = useCallback(async () => {
    const emergencyEmojis = {
      police: '🚨',
      medical: '🚑',
      disaster: '⚠️'
    };

    const emergencyLabels = {
      police: 'POLICE EMERGENCY',
      medical: 'MEDICAL EMERGENCY',
      disaster: 'DISASTER EMERGENCY'
    };

    let message = `${emergencyEmojis[emergencyType]} SOS ALERT - ${emergencyLabels[emergencyType]}\n\n`;
    
    if (location) {
      message += `📍 Location: ${location.mapsLink}\n`;
      message += `Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}\n`;
      message += `Accuracy: ±${Math.round(location.accuracy)}m\n\n`;
    } else {
      message += `📍 Location: Unable to determine\n\n`;
    }

    if (description.trim()) {
      message += `📝 Details: ${description.trim()}\n\n`;
    }

    message += `⏰ Time: ${new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    })}\n\n`;

    message += `🆘 This is an emergency alert. Please respond immediately.`;

    // Optional: Use AI to improve message clarity (if online)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Improve this emergency message for clarity and urgency (keep it concise, under 200 words): ${message}`,
          conversationHistory: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          // Use AI-improved message if available
          setSosMessage(data.reply);
          setStep(4);
          return;
        }
      }
    } catch (error) {
      console.log('AI enhancement unavailable, using standard message');
    }

    // Use standard message if AI fails
    setSosMessage(message);
    setStep(4);
  }, [emergencyType, location, description]);

  // Skip location (manual entry)
  const skipLocation = useCallback(() => {
    setStep(3);
  }, []);

  // Handle call action
  const handleCall = useCallback(() => {
    const emergencyNumbers = {
      police: '100',
      medical: '108',
      disaster: '112'
    };
    window.location.href = `tel:${emergencyNumbers[emergencyType]}`;
  }, [emergencyType]);

  // Handle SMS action
  const handleSMS = useCallback(() => {
    const smsBody = encodeURIComponent(sosMessage);
    window.location.href = `sms:?body=${smsBody}`;
  }, [sosMessage]);

  // Handle share action
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SOS Emergency Alert',
          text: sosMessage
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(sosMessage).then(() => {
        alert('Emergency message copied to clipboard!');
      });
    }
  }, [sosMessage]);

  // Copy message to clipboard
  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(sosMessage).then(() => {
      alert('Emergency message copied to clipboard!');
    });
  }, [sosMessage]);

  return (
    <>
      {/* SOS Button */}
      <button 
        className="sos-button"
        onClick={openModal}
        title="Emergency SOS"
      >
        🆘 SOS
      </button>

      {/* SOS Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="sos-overlay"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <div className="sos-modal-container">
              <motion.div
                className="sos-modal glass-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Header */}
                <div className="sos-header">
                  <h2 className="sos-title">
                    🆘 Emergency SOS
                  </h2>
                  <button className="sos-close" onClick={closeModal}>✕</button>
                </div>

                {/* Progress Indicator */}
                <div className="sos-progress">
                  <div className={`sos-progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                  <div className={`sos-progress-line ${step >= 2 ? 'active' : ''}`}></div>
                  <div className={`sos-progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                  <div className={`sos-progress-line ${step >= 3 ? 'active' : ''}`}></div>
                  <div className={`sos-progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
                  <div className={`sos-progress-line ${step >= 4 ? 'active' : ''}`}></div>
                  <div className={`sos-progress-step ${step >= 4 ? 'active' : ''}`}>4</div>
                </div>

                {/* Content */}
                <div className="sos-content">
                  {/* Step 1: Emergency Type */}
                  {step === 1 && (
                    <div className="sos-step">
                      <h3 className="sos-step-title">Select Emergency Type</h3>
                      <div className="sos-type-grid">
                        <button
                          className="sos-type-card"
                          onClick={() => selectEmergencyType('police')}
                        >
                          <div className="sos-type-icon">🚨</div>
                          <div className="sos-type-label">Police</div>
                          <div className="sos-type-number">100</div>
                        </button>
                        <button
                          className="sos-type-card"
                          onClick={() => selectEmergencyType('medical')}
                        >
                          <div className="sos-type-icon">🚑</div>
                          <div className="sos-type-label">Medical</div>
                          <div className="sos-type-number">108</div>
                        </button>
                        <button
                          className="sos-type-card"
                          onClick={() => selectEmergencyType('disaster')}
                        >
                          <div className="sos-type-icon">⚠️</div>
                          <div className="sos-type-label">Disaster</div>
                          <div className="sos-type-number">112</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location */}
                  {step === 2 && (
                    <div className="sos-step">
                      <h3 className="sos-step-title">Getting Your Location</h3>
                      {isLoadingLocation ? (
                        <div className="sos-loading">
                          <div className="loading-spinner"></div>
                          <p>Acquiring precise location...</p>
                        </div>
                      ) : location ? (
                        <div className="sos-location-success">
                          <div className="sos-location-icon">📍</div>
                          <p className="sos-location-coords">
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </p>
                          <p className="sos-location-accuracy">
                            Accuracy: ±{Math.round(location.accuracy)}m
                          </p>
                          <a 
                            href={location.mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sos-location-link"
                          >
                            View on Google Maps →
                          </a>
                        </div>
                      ) : locationError ? (
                        <div className="sos-location-error">
                          <div className="sos-error-icon">⚠️</div>
                          <p className="sos-error-message">{locationError}</p>
                          <div className="sos-location-actions">
                            <button className="sos-btn-secondary" onClick={getLocation}>
                              Try Again
                            </button>
                            <button className="sos-btn-primary" onClick={skipLocation}>
                              Continue Without Location
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Step 3: Description */}
                  {step === 3 && (
                    <div className="sos-step">
                      <h3 className="sos-step-title">Describe the Emergency</h3>
                      <p className="sos-step-subtitle">
                        Provide details to help responders (optional)
                      </p>
                      <div className="sos-input-wrapper">
                        <textarea
                          className="sos-textarea"
                          placeholder="E.g., 'Car accident on NH-44, 2 people injured' or 'House fire, smoke visible'"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                        />
                        {speechSupported && (
                          <button
                            className={`sos-voice-btn ${isListening ? 'listening' : ''}`}
                            onClick={handleVoiceInput}
                            disabled={isListening}
                            title="Voice input"
                          >
                            {isListening ? '🎤 Listening...' : '🎤 Voice'}
                          </button>
                        )}
                      </div>
                      <div className="sos-step-actions">
                        <button 
                          className="sos-btn-secondary" 
                          onClick={() => setStep(2)}
                        >
                          ← Back
                        </button>
                        <button 
                          className="sos-btn-primary" 
                          onClick={generateMessage}
                        >
                          Generate Alert →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Actions */}
                  {step === 4 && (
                    <div className="sos-step">
                      <h3 className="sos-step-title">Emergency Alert Ready</h3>
                      <div className="sos-message-preview">
                        <pre className="sos-message-text">{sosMessage}</pre>
                      </div>
                      <div className="sos-actions-grid">
                        <button className="sos-action-btn call" onClick={handleCall}>
                          <div className="sos-action-icon">📞</div>
                          <div className="sos-action-label">Call Emergency</div>
                          <div className="sos-action-number">
                            {emergencyType === 'police' && '100'}
                            {emergencyType === 'medical' && '108'}
                            {emergencyType === 'disaster' && '112'}
                          </div>
                        </button>
                        <button className="sos-action-btn sms" onClick={handleSMS}>
                          <div className="sos-action-icon">💬</div>
                          <div className="sos-action-label">Send SMS</div>
                        </button>
                        <button className="sos-action-btn share" onClick={handleShare}>
                          <div className="sos-action-icon">📤</div>
                          <div className="sos-action-label">Share Alert</div>
                        </button>
                        <button className="sos-action-btn copy" onClick={copyMessage}>
                          <div className="sos-action-icon">📋</div>
                          <div className="sos-action-label">Copy Message</div>
                        </button>
                      </div>
                      <div className="sos-step-actions">
                        <button 
                          className="sos-btn-secondary" 
                          onClick={() => setStep(3)}
                        >
                          ← Edit Details
                        </button>
                        <button 
                          className="sos-btn-danger" 
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
