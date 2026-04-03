// Theme Management Utility
// Handles global theme switching with localStorage persistence

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

/**
 * Set theme globally
 * @param {string} theme - 'dark' or 'light'
 */
export function setTheme(theme) {
  const validTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  document.documentElement.setAttribute('data-theme', validTheme);
  localStorage.setItem('civicshield-theme', validTheme);
  console.log('[Theme] Set to:', validTheme);
}

/**
 * Get current theme
 * @returns {string} Current theme ('dark' or 'light')
 */
export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || THEMES.DARK;
}

/**
 * Toggle between dark and light theme
 * @returns {string} New theme
 */
export function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme from localStorage or default to dark
 * Call this on app startup
 */
export function initializeTheme() {
  const savedTheme = localStorage.getItem('civicshield-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? THEMES.DARK : THEMES.LIGHT);
  setTheme(theme);
  
  console.log('[Theme] Initialized:', theme);
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  initializeTheme();
}
