import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline status
 * Returns true if online, false if offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Connection restored - Online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[Network] Connection lost - Offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
