// State name → code mapping for matching TopoJSON with API data
export const STATE_NAME_TO_CODE = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CT',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UT',
  'West Bengal': 'WB',
  'Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
  'Chandigarh': 'CH',
  'Puducherry': 'PY',
  'Andaman and Nicobar Islands': 'AN',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Lakshadweep': 'LD',
};

// Reverse mapping: code → name
export const STATE_CODE_TO_NAME = Object.fromEntries(
  Object.entries(STATE_NAME_TO_CODE).map(([name, code]) => [code, name])
);

// State code → neighboring state codes mapping
export const STATE_NEIGHBORS = {
  'AP': ['TG', 'KA', 'TN', 'OR', 'CT'],
  'AR': ['AS', 'NL', 'ML'],
  'AS': ['AR', 'NL', 'MN', 'ML', 'TR', 'MZ', 'WB'],
  'BR': ['UP', 'JH', 'WB'],
  'CT': ['MP', 'MH', 'TG', 'OR', 'JH', 'UP'],
  'GA': ['MH', 'KA'],
  'GJ': ['RJ', 'MP', 'MH', 'DN'],
  'HR': ['PB', 'HP', 'UT', 'UP', 'RJ', 'DL', 'CH'],
  'HP': ['JK', 'LA', 'PB', 'HR', 'UT'],
  'JH': ['BR', 'UP', 'CT', 'OR', 'WB'],
  'KA': ['GA', 'MH', 'TG', 'AP', 'TN', 'KL'],
  'KL': ['KA', 'TN'],
  'MP': ['RJ', 'GJ', 'MH', 'CT', 'UP'],
  'MH': ['GJ', 'MP', 'CT', 'TG', 'KA', 'GA', 'DN'],
  'MN': ['NL', 'AS', 'MZ'],
  'ML': ['AS', 'TR', 'WB'],
  'MZ': ['AS', 'MN', 'TR'],
  'NL': ['AR', 'AS', 'MN'],
  'OR': ['JH', 'CT', 'AP', 'WB'],
  'PB': ['JK', 'HP', 'HR', 'RJ', 'CH'],
  'RJ': ['PB', 'HR', 'UP', 'MP', 'GJ'],
  'SK': ['WB'],
  'TN': ['KL', 'KA', 'AP', 'PY'],
  'TG': ['MH', 'CT', 'KA', 'AP'],
  'TR': ['AS', 'ML', 'MZ'],
  'UP': ['UT', 'HR', 'RJ', 'MP', 'CT', 'JH', 'BR', 'DL'],
  'UT': ['HP', 'HR', 'UP'],
  'WB': ['SK', 'AS', 'OR', 'JH', 'BR'],
  'DL': ['HR', 'UP'],
  'JK': ['LA', 'HP', 'PB'],
  'LA': ['JK', 'HP'],
  'CH': ['PB', 'HR'],
  'PY': ['TN'],
  'AN': [],
  'DN': ['GJ', 'MH'],
  'LD': [],
};

export const RESOURCE_ICONS = {
  lpg: '🔥',
  fuel: '⛽',
  food: '🍚',
  water: '💧',
  medicine: '💊',
};

export const RESOURCE_LABELS = {
  lpg: 'LPG Gas',
  fuel: 'Fuel',
  food: 'Food Supply',
  water: 'Water',
  medicine: 'Medicine',
};

export const SEVERITY_COLORS = {
  critical: 'var(--risk-high)',
  warning: 'var(--risk-medium)',
  normal: 'var(--risk-low)',
};
