#!/usr/bin/env node

/**
 * Verify State Map Integration
 * Tests that all state district map files exist and are valid
 */

const fs = require('fs');
const path = require('path');

const STATE_MAP_REGISTRY = {
  'AP': { name: 'Andhra Pradesh', slug: 'andhra-pradesh', districtCount: 13 },
  'AR': { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh', districtCount: 25 },
  'AS': { name: 'Assam', slug: 'assam', districtCount: 33 },
  'BR': { name: 'Bihar', slug: 'bihar', districtCount: 38 },
  'CH': { name: 'Chandigarh', slug: 'chandigarh', districtCount: 1 },
  'CT': { name: 'Chhattisgarh', slug: 'chhattisgarh', districtCount: 27 },
  'DN': { name: 'Dadra and Nagar Haveli and Daman and Diu', slug: 'dadra-and-nagar-haveli-and-daman-and-diu', districtCount: 3 },
  'DL': { name: 'Delhi', slug: 'delhi', districtCount: 1 },
  'GA': { name: 'Goa', slug: 'goa', districtCount: 2 },
  'GJ': { name: 'Gujarat', slug: 'gujarat', districtCount: 33 },
  'HR': { name: 'Haryana', slug: 'haryana', districtCount: 22 },
  'HP': { name: 'Himachal Pradesh', slug: 'himachal-pradesh', districtCount: 12 },
  'JK': { name: 'Jammu and Kashmir', slug: 'jammu-and-kashmir', districtCount: 22 },
  'JH': { name: 'Jharkhand', slug: 'jharkhand', districtCount: 24 },
  'KA': { name: 'Karnataka', slug: 'karnataka', districtCount: 30 },
  'KL': { name: 'Kerala', slug: 'kerala', districtCount: 14 },
  'LA': { name: 'Ladakh', slug: 'ladakh', districtCount: 2 },
  'LD': { name: 'Lakshadweep', slug: 'lakshadweep', districtCount: 1 },
  'MP': { name: 'Madhya Pradesh', slug: 'madhya-pradesh', districtCount: 52 },
  'MH': { name: 'Maharashtra', slug: 'maharashtra', districtCount: 35 },
  'MN': { name: 'Manipur', slug: 'manipur', districtCount: 16 },
  'ML': { name: 'Meghalaya', slug: 'meghalaya', districtCount: 11 },
  'MZ': { name: 'Mizoram', slug: 'mizoram', districtCount: 10 },
  'NL': { name: 'Nagaland', slug: 'nagaland', districtCount: 11 },
  'OR': { name: 'Odisha', slug: 'odisha', districtCount: 30 },
  'PY': { name: 'Puducherry', slug: 'puducherry', districtCount: 4 },
  'PB': { name: 'Punjab', slug: 'punjab', districtCount: 22 },
  'RJ': { name: 'Rajasthan', slug: 'rajasthan', districtCount: 33 },
  'SK': { name: 'Sikkim', slug: 'sikkim', districtCount: 4 },
  'TN': { name: 'Tamil Nadu', slug: 'tamil-nadu', districtCount: 37 },
  'TG': { name: 'Telangana', slug: 'telangana', districtCount: 33 },
  'TR': { name: 'Tripura', slug: 'tripura', districtCount: 8 },
  'UP': { name: 'Uttar Pradesh', slug: 'uttar-pradesh', districtCount: 75 },
  'UT': { name: 'Uttarakhand', slug: 'uttarakhand', districtCount: 13 },
  'WB': { name: 'West Bengal', slug: 'west-bengal', districtCount: 23 },
  'AN': { name: 'Andaman and Nicobar Islands', slug: 'andaman-and-nicobar-islands', districtCount: 3 },
};

const MAPS_DIR = path.join(__dirname, 'public', 'maps', 'states');

console.log('🗺️  Verifying State Map Integration\n');
console.log('═'.repeat(60));

let totalStates = 0;
let successCount = 0;
let errorCount = 0;
const errors = [];

Object.entries(STATE_MAP_REGISTRY).forEach(([code, info]) => {
  totalStates++;
  const filePath = path.join(MAPS_DIR, `${info.slug}.json`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // Read and parse JSON
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Validate structure
    if (!data.name || !data.code || !data.districts || !data.viewBox) {
      throw new Error('Invalid structure: missing required fields');
    }
    
    // Validate district count
    const actualCount = Object.keys(data.districts).length;
    if (actualCount !== info.districtCount) {
      throw new Error(`District count mismatch: expected ${info.districtCount}, got ${actualCount}`);
    }
    
    // Validate code matches
    if (data.code !== code) {
      throw new Error(`Code mismatch: expected ${code}, got ${data.code}`);
    }
    
    console.log(`✓ ${code.padEnd(3)} ${info.name.padEnd(40)} ${actualCount} districts`);
    successCount++;
    
  } catch (error) {
    console.log(`✗ ${code.padEnd(3)} ${info.name.padEnd(40)} ERROR: ${error.message}`);
    errorCount++;
    errors.push({ code, name: info.name, error: error.message, filePath });
  }
});

console.log('═'.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   Total States:  ${totalStates}`);
console.log(`   ✓ Success:     ${successCount} (${((successCount/totalStates)*100).toFixed(1)}%)`);
console.log(`   ✗ Errors:      ${errorCount} (${((errorCount/totalStates)*100).toFixed(1)}%)`);

if (errors.length > 0) {
  console.log(`\n❌ Errors Found:\n`);
  errors.forEach(({ code, name, error, filePath }) => {
    console.log(`   ${code} - ${name}`);
    console.log(`      Error: ${error}`);
    console.log(`      Path:  ${filePath}\n`);
  });
  process.exit(1);
} else {
  console.log(`\n✅ All state maps verified successfully!`);
  process.exit(0);
}
