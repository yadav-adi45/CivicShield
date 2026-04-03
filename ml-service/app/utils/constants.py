"""CivicShield ML Service — Constants"""

INDIAN_STATES = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam",
    "BR": "Bihar", "CT": "Chhattisgarh", "GA": "Goa", "GJ": "Gujarat",
    "HR": "Haryana", "HP": "Himachal Pradesh", "JH": "Jharkhand",
    "KA": "Karnataka", "KL": "Kerala", "MP": "Madhya Pradesh",
    "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya",
    "MZ": "Mizoram", "NL": "Nagaland", "OR": "Odisha", "PB": "Punjab",
    "RJ": "Rajasthan", "SK": "Sikkim", "TN": "Tamil Nadu",
    "TG": "Telangana", "TR": "Tripura", "UP": "Uttar Pradesh",
    "UT": "Uttarakhand", "WB": "West Bengal",
    # Union Territories
    "DL": "Delhi", "JK": "Jammu and Kashmir", "LA": "Ladakh",
    "CH": "Chandigarh", "PY": "Puducherry", "AN": "Andaman and Nicobar Islands",
    "DN": "Dadra and Nagar Haveli and Daman and Diu", "LD": "Lakshadweep",
}

RESOURCE_TYPES = ["lpg", "fuel", "food", "water", "medicine"]

CRISIS_KEYWORDS = {
    "supply_disruption": [
        "shortage", "supply chain", "disrupted", "delayed", "blocked",
        "shut down", "closed", "suspended", "rationing", "black market",
        "hoarding", "pipeline damage", "stock out", "unavailable"
    ],
    "demand_spike": [
        "price hike", "price surge", "panic buying", "rush", "demand spike",
        "prices spike", "surge in demand", "overloaded", "overwhelmed"
    ],
    "natural_disaster": [
        "flood", "cyclone", "earthquake", "landslide", "drought",
        "heatwave", "cloudburst", "storm", "tsunami", "wildfire",
        "heavy rainfall", "snowfall"
    ],
    "conflict": [
        "protest", "riot", "violence", "blockade", "curfew", "clash",
        "tension", "unrest", "strike", "shutdown", "bandh"
    ]
}

RESOURCE_KEYWORDS = {
    "lpg": ["lpg", "gas cylinder", "cooking gas", "gas supply", "lng", "propane"],
    "fuel": ["fuel", "petrol", "diesel", "gasoline", "petroleum", "oil"],
    "food": ["food", "grain", "rice", "wheat", "ration", "vegetable", "supply"],
    "water": ["water", "drinking water", "water supply", "reservoir", "tanker"],
    "medicine": ["medicine", "medical", "pharmaceutical", "drug", "hospital", "health"]
}

ACTION_RECOMMENDATIONS = {
    "lpg": {
        "high": "Stock emergency cooking fuel alternatives. Register for priority LPG delivery. Contact local gas agency for cylinder availability.",
        "medium": "Monitor LPG availability in your area. Consider booking cylinders in advance.",
        "low": "No immediate action needed. Supply chains are functioning normally."
    },
    "fuel": {
        "high": "Minimize non-essential travel. Fill vehicles when possible. Use public transport where available.",
        "medium": "Plan fuel purchases. Avoid panic buying. Monitor local fuel station updates.",
        "low": "Fuel supply is stable. No immediate concerns."
    },
    "food": {
        "high": "Ensure 2-week food supply at home. Visit ration shops early. Check community kitchen availability.",
        "medium": "Stock essential dry goods. Monitor prices. Visit markets during off-peak hours.",
        "low": "Food supply chains are stable. No action needed."
    },
    "water": {
        "high": "Store clean drinking water. Reduce non-essential water usage. Report leaks immediately.",
        "medium": "Monitor water supply schedules. Store extra water when available.",
        "low": "Water supply is adequate. Practice normal conservation."
    },
    "medicine": {
        "high": "Ensure 30-day supply of essential medications. Contact healthcare provider for prescriptions. Check generic alternatives.",
        "medium": "Refill prescriptions early. Check local pharmacy stocks.",
        "low": "Medicine supply is normal. No immediate concerns."
    }
}
