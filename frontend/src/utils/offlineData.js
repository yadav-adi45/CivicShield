// Offline Survival Mode Data
// Provides essential crisis guidance when internet is unavailable

export const offlineCrisisGuides = {
  // Resource Shortage Guides
  water: {
    title: "Water Shortage Survival Guide",
    steps: [
      "Store at least 3 liters of water per person per day",
      "Boil water for 1 minute before drinking if source is uncertain",
      "Collect rainwater in clean containers",
      "Reduce water usage: quick showers, turn off taps",
      "Prioritize drinking water over cleaning",
      "Know location of nearest water distribution centers"
    ],
    emergency: "Call 1916 for water emergency helpline"
  },
  
  lpg: {
    title: "LPG/Cooking Gas Shortage Guide",
    steps: [
      "Stock alternative cooking fuels (coal, wood, portable stove)",
      "Use pressure cookers to reduce cooking time",
      "Plan meals that require less cooking",
      "Keep LPG cylinder at least 50% full at all times",
      "Register for multiple LPG distributors if possible",
      "Learn to use traditional chulha (clay stove)"
    ],
    emergency: "Contact your LPG distributor or call 1906"
  },
  
  petrol: {
    title: "Petrol/Fuel Shortage Guide",
    steps: [
      "Keep vehicle tank at least 75% full",
      "Reduce non-essential travel",
      "Use public transport or carpool",
      "Plan routes to minimize fuel consumption",
      "Maintain vehicle for optimal fuel efficiency",
      "Keep emergency fuel reserve (5-10 liters) safely stored"
    ],
    emergency: "Call 1800-233-3555 for fuel emergency"
  },
  
  diesel: {
    title: "Diesel Shortage Guide",
    steps: [
      "Maintain fuel tank above 50%",
      "Optimize routes for commercial vehicles",
      "Service vehicle regularly for efficiency",
      "Consider alternative transport for non-urgent needs",
      "Stock fuel stabilizer for long-term storage",
      "Know locations of all nearby fuel stations"
    ],
    emergency: "Contact local petroleum office"
  },
  
  electricity: {
    title: "Power Outage Survival Guide",
    steps: [
      "Keep flashlights and batteries ready",
      "Charge all devices when power is available",
      "Use inverter or UPS for essential appliances",
      "Stock candles and matches safely",
      "Keep refrigerator closed during outages",
      "Have a battery-powered radio for updates"
    ],
    emergency: "Call power company helpline or 1912"
  },
  
  food: {
    title: "Food Shortage Preparedness",
    steps: [
      "Stock non-perishable food for 2 weeks minimum",
      "Keep rice, lentils, flour, oil, salt, sugar",
      "Store canned goods and dry fruits",
      "Maintain a small kitchen garden if possible",
      "Know location of ration shops and PDS centers",
      "Preserve food properly to avoid waste"
    ],
    emergency: "Contact local food supply office or call 1967"
  }
};

export const emergencyContacts = {
  national: [
    { name: "Emergency Services", number: "112", description: "All emergencies" },
    { name: "Police", number: "100", description: "Law enforcement" },
    { name: "Fire", number: "101", description: "Fire emergencies" },
    { name: "Ambulance", number: "102", description: "Medical emergencies" },
    { name: "Disaster Management", number: "108", description: "Disaster response" },
    { name: "Women Helpline", number: "1091", description: "Women in distress" },
    { name: "Child Helpline", number: "1098", description: "Child protection" }
  ],
  utilities: [
    { name: "Water Emergency", number: "1916", description: "Water supply issues" },
    { name: "Electricity", number: "1912", description: "Power outages" },
    { name: "LPG Emergency", number: "1906", description: "Gas leaks, supply" },
    { name: "Railway Helpline", number: "139", description: "Train emergencies" }
  ]
};

export const generalCrisisAdvice = {
  preparation: [
    "Keep emergency kit ready: water, food, medicines, flashlight, radio",
    "Maintain list of emergency contacts",
    "Know evacuation routes from your area",
    "Keep important documents in waterproof container",
    "Have cash reserve (ATMs may not work)",
    "Stay informed through official channels"
  ],
  
  during: [
    "Stay calm and assess the situation",
    "Follow official instructions from authorities",
    "Stay indoors unless evacuation is ordered",
    "Keep communication devices charged",
    "Check on neighbors, especially elderly",
    "Avoid spreading rumors or unverified information"
  ],
  
  after: [
    "Check for injuries and provide first aid",
    "Inspect home for damage before entering",
    "Document damage for insurance claims",
    "Boil water before drinking if advised",
    "Report hazards to authorities",
    "Help community recovery efforts"
  ]
};

// Rule-based chatbot responses for offline mode
export const offlineChatbotRules = [
  {
    keywords: ['water', 'shortage', 'drinking', 'thirsty'],
    response: "WATER SHORTAGE:\n• Store 3L per person daily\n• Boil water 1 min before drinking\n• Collect rainwater in clean containers\n• Ration usage: quick showers, turn off taps\n• Emergency: Call 1916"
  },
  {
    keywords: ['lpg', 'gas', 'cooking', 'cylinder', 'stove'],
    response: "LPG SHORTAGE:\n• Stock alternative fuels (coal, wood, portable stove)\n• Use pressure cooker to reduce cooking time\n• Keep cylinder at 50% minimum\n• Register with multiple distributors\n• Emergency: Call 1906"
  },
  {
    keywords: ['petrol', 'fuel', 'diesel', 'vehicle', 'car'],
    response: "FUEL SHORTAGE:\n• Keep tank 75% full at all times\n• Reduce non-essential travel\n• Use public transport or carpool\n• Plan routes to minimize consumption\n• Emergency: Call 1800-233-3555"
  },
  {
    keywords: ['electricity', 'power', 'outage', 'blackout', 'light'],
    response: "POWER OUTAGE:\n• Keep flashlights and batteries ready\n• Charge all devices when power available\n• Use inverter/UPS for essentials\n• Keep refrigerator closed during outage\n• Emergency: Call 1912"
  },
  {
    keywords: ['food', 'ration', 'hungry', 'eating', 'meal'],
    response: "FOOD SHORTAGE:\n• Stock 2 weeks non-perishables (rice, lentils, oil)\n• Store canned goods and dry fruits\n• Know location of PDS centers\n• Preserve food properly\n• Emergency: Call 1967"
  },
  {
    keywords: ['safe', 'safety', 'danger', 'risk', 'threat'],
    response: "SAFETY CHECK:\n• Stay indoors unless evacuation ordered\n• Keep emergency kit ready\n• Follow official instructions only\n• Avoid spreading rumors\n• Emergency: Call 112"
  },
  {
    keywords: ['emergency', 'help', 'urgent', 'crisis', 'sos'],
    response: "EMERGENCY CONTACTS:\n• All Emergencies: 112\n• Police: 100\n• Fire: 101\n• Ambulance: 102\n• Disaster Management: 108\n\nStay calm. Provide clear information when calling."
  },
  {
    keywords: ['prepare', 'preparation', 'ready', 'kit'],
    response: "EMERGENCY KIT:\n• Water (3L per person)\n• Non-perishable food (2 weeks)\n• Medicines and first aid\n• Flashlight, radio, batteries\n• Cash and important documents\n• Know evacuation routes"
  },
  {
    keywords: ['evacuate', 'evacuation', 'leave', 'escape'],
    response: "EVACUATION:\n• Take emergency kit only\n• Lock home, turn off gas/electricity\n• Follow designated routes\n• Go to official shelters\n• Don't return until authorities confirm safe"
  },
  {
    keywords: ['medicine', 'medical', 'health', 'doctor', 'sick', 'injured'],
    response: "MEDICAL EMERGENCY:\n• Keep 2-week medicine supply\n• Have first aid kit ready\n• Know nearest hospital location\n• Call 102 (Ambulance) or 108 (Emergency)\n• For injuries: Stop bleeding, keep clean, seek help"
  },
  {
    keywords: ['war', 'conflict', 'attack', 'bomb', 'shelter'],
    response: "CONFLICT SITUATION:\n• Move to basement or interior room\n• Stay away from windows\n• Keep emergency supplies ready\n• Follow official evacuation orders\n• Emergency: Call 112"
  },
  {
    keywords: ['earthquake', 'tremor', 'shake'],
    response: "EARTHQUAKE:\n• DROP, COVER, HOLD ON\n• Get under sturdy furniture\n• Stay away from windows and heavy objects\n• If outdoors: move to open area\n• After: Check for injuries, gas leaks"
  },
  {
    keywords: ['flood', 'flooding', 'water rising'],
    response: "FLOOD:\n• Move to higher ground immediately\n• Avoid walking/driving through water\n• Turn off electricity and gas\n• Take emergency kit\n• Emergency: Call 108"
  },
  {
    keywords: ['fire', 'burning', 'smoke'],
    response: "FIRE:\n• Get out immediately\n• Stay low, crawl if smoke present\n• Don't use elevators\n• Close doors behind you\n• Call 101 once safe\n• Don't go back inside"
  }
];

// Fallback response when no keywords match
export const offlineFallbackResponse = `I'm in offline mode. I can help with:

SITUATIONS:
• Water/Food/Fuel shortages
• Power outages
• Medical emergencies
• Evacuation guidance
• Safety assessment

EMERGENCY CONTACTS:
• All Emergencies: 112
• Police: 100 | Fire: 101 | Ambulance: 102

What situation are you facing?`;

// Function to get offline chatbot response
export function getOfflineResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check each rule
  for (const rule of offlineChatbotRules) {
    if (rule.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return rule.response;
    }
  }
  
  // Return fallback if no match
  return offlineFallbackResponse;
}

// Function to get crisis guide by resource type
export function getCrisisGuide(resourceType) {
  return offlineCrisisGuides[resourceType.toLowerCase()] || null;
}
