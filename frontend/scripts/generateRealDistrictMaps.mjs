/**
 * generateRealDistrictMaps.mjs
 *
 * Downloads real district-level TopoJSON from udit-001/india-maps-data
 * and converts each state's districts into SVG path data.
 *
 * Output format matches india-paths.json: { "District Name": "M..." }
 *
 * Usage: node frontend/scripts/generateRealDistrictMaps.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { feature } from 'topojson-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ──────────────────────────────────────────────
const SVG_WIDTH = 500;
const SVG_HEIGHT = 500;
const PADDING = 25;
const BASE_URL = 'https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/states';

// ── State slug → code mapping (from repo filenames) ─────
const STATE_FILES = [
  { slug: 'andaman-and-nicobar', code: 'AN', name: 'Andaman and Nicobar Islands' },
  { slug: 'andhra-pradesh', code: 'AP', name: 'Andhra Pradesh' },
  { slug: 'arunachal-pradesh', code: 'AR', name: 'Arunachal Pradesh' },
  { slug: 'assam', code: 'AS', name: 'Assam' },
  { slug: 'bihar', code: 'BR', name: 'Bihar' },
  { slug: 'chandigarh', code: 'CH', name: 'Chandigarh' },
  { slug: 'chhattisgarh', code: 'CT', name: 'Chhattisgarh' },
  { slug: 'dnh-and-dd', code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { slug: 'delhi', code: 'DL', name: 'Delhi' },
  { slug: 'goa', code: 'GA', name: 'Goa' },
  { slug: 'gujarat', code: 'GJ', name: 'Gujarat' },
  { slug: 'haryana', code: 'HR', name: 'Haryana' },
  { slug: 'himachal-pradesh', code: 'HP', name: 'Himachal Pradesh' },
  { slug: 'jammu-and-kashmir', code: 'JK', name: 'Jammu and Kashmir' },
  { slug: 'jharkhand', code: 'JH', name: 'Jharkhand' },
  { slug: 'karnataka', code: 'KA', name: 'Karnataka' },
  { slug: 'kerala', code: 'KL', name: 'Kerala' },
  { slug: 'ladakh', code: 'LA', name: 'Ladakh' },
  { slug: 'lakshadweep', code: 'LD', name: 'Lakshadweep' },
  { slug: 'madhya-pradesh', code: 'MP', name: 'Madhya Pradesh' },
  { slug: 'maharashtra', code: 'MH', name: 'Maharashtra' },
  { slug: 'manipur', code: 'MN', name: 'Manipur' },
  { slug: 'meghalaya', code: 'ML', name: 'Meghalaya' },
  { slug: 'mizoram', code: 'MZ', name: 'Mizoram' },
  { slug: 'nagaland', code: 'NL', name: 'Nagaland' },
  { slug: 'odisha', code: 'OR', name: 'Odisha' },
  { slug: 'puducherry', code: 'PY', name: 'Puducherry' },
  { slug: 'punjab', code: 'PB', name: 'Punjab' },
  { slug: 'rajasthan', code: 'RJ', name: 'Rajasthan' },
  { slug: 'sikkim', code: 'SK', name: 'Sikkim' },
  { slug: 'tamilnadu', code: 'TN', name: 'Tamil Nadu' },
  { slug: 'telangana', code: 'TG', name: 'Telangana' },
  { slug: 'tripura', code: 'TR', name: 'Tripura' },
  { slug: 'uttar-pradesh', code: 'UP', name: 'Uttar Pradesh' },
  { slug: 'uttarakhand', code: 'UT', name: 'Uttarakhand' },
  { slug: 'west-bengal', code: 'WB', name: 'West Bengal' },
];

// ── Helpers ─────────────────────────────────────────────

function round(n, d = 1) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

/** Flatten all coordinates from a GeoJSON geometry */
function flattenCoords(geometry) {
  const result = [];
  function walk(coords) {
    if (typeof coords[0] === 'number') {
      result.push(coords);
    } else {
      coords.forEach(walk);
    }
  }
  if (geometry.coordinates) walk(geometry.coordinates);
  return result;
}

/** Compute projection bounds to fit all features in SVG space */
function computeBounds(features) {
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  for (const f of features) {
    const coords = flattenCoords(f.geometry);
    for (const [lon, lat] of coords) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  const lonRange = maxLon - minLon || 0.01;
  const latRange = maxLat - minLat || 0.01;
  const ew = SVG_WIDTH - 2 * PADDING;
  const eh = SVG_HEIGHT - 2 * PADDING;
  const scale = Math.min(ew / lonRange, eh / latRange);
  const xOff = PADDING + (ew - lonRange * scale) / 2;
  const yOff = PADDING + (eh - latRange * scale) / 2;

  return { minLon, maxLon, minLat, maxLat, scale, xOff, yOff };
}

/** Project lon/lat to SVG x/y */
function project(lon, lat, bounds) {
  return [
    round((lon - bounds.minLon) * bounds.scale + bounds.xOff),
    round((bounds.maxLat - lat) * bounds.scale + bounds.yOff),
  ];
}

/** Convert a GeoJSON geometry to SVG path d attribute */
function geometryToPath(geometry, bounds) {
  const paths = [];

  function ringToPathStr(ring) {
    const projected = ring.map(([lon, lat]) => project(lon, lat, bounds));
    return 'M ' + projected.map(([x, y]) => `${x},${y}`).join(' L ') + ' Z';
  }

  if (geometry.type === 'Polygon') {
    // Outer ring only (skip holes for simplicity)
    paths.push(ringToPathStr(geometry.coordinates[0]));
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      paths.push(ringToPathStr(polygon[0]));
    }
  }

  return paths.join(' ');
}

/** Compute centroid of a geometry (simple average) */
function computeCentroid(geometry, bounds) {
  const coords = flattenCoords(geometry);
  if (coords.length === 0) return [SVG_WIDTH / 2, SVG_HEIGHT / 2];
  let sx = 0, sy = 0;
  for (const [lon, lat] of coords) {
    const [x, y] = project(lon, lat, bounds);
    sx += x;
    sy += y;
  }
  return [round(sx / coords.length), round(sy / coords.length)];
}

/** Download JSON from URL */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

/** Generate output slug for filename */
function toOutputSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Main ────────────────────────────────────────────────

const outputDir = join(__dirname, '..', 'public', 'maps', 'states');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`Downloading and processing ${STATE_FILES.length} state maps...\n`);

const registry = [];
let successCount = 0;
let failCount = 0;

for (const state of STATE_FILES) {
  const url = `${BASE_URL}/${state.slug}.json`;
  try {
    process.stdout.write(`  ${state.name} (${state.code})...`);

    // Download TopoJSON
    const topo = await fetchJSON(url);

    // Convert to GeoJSON
    const objectKey = Object.keys(topo.objects)[0]; // usually 'districts'
    const geojson = feature(topo, topo.objects[objectKey]);

    if (!geojson.features || geojson.features.length === 0) {
      console.log(' ⚠ no features, skipping');
      failCount++;
      continue;
    }

    // Compute projection bounds from all features
    const bounds = computeBounds(geojson.features);

    // Convert each district to SVG path data
    const districts = {};
    for (const feat of geojson.features) {
      const districtName = feat.properties.district || feat.properties.dt_nm || feat.properties.name || `District ${Object.keys(districts).length + 1}`;
      const path = geometryToPath(feat.geometry, bounds);
      if (path) {
        districts[districtName] = path;
      }
    }

    const districtCount = Object.keys(districts).length;

    // Build output (same structure as india-paths.json but with metadata)
    const output = {
      name: state.name,
      code: state.code,
      viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`,
      districtCount,
      districts,
    };

    const outSlug = toOutputSlug(state.name);
    const outPath = join(outputDir, `${outSlug}.json`);
    writeFileSync(outPath, JSON.stringify(output));

    registry.push({
      name: state.name,
      code: state.code,
      slug: outSlug,
      districtCount,
    });

    console.log(` ✓ ${districtCount} districts`);
    successCount++;
  } catch (err) {
    console.log(` ✗ ${err.message}`);
    failCount++;
  }
}

console.log(`\n✅ ${successCount} states processed, ${failCount} failed\n`);

// Write registry
const registryPath = join(__dirname, '..', 'src', 'maps', 'stateMapRegistry.js');
const registryContent = `/** Auto-generated state map registry — real district boundaries */
export const STATE_MAP_REGISTRY = {
${registry.map(r => `  '${r.code}': { name: '${r.name.replace(/'/g, "\\'")}', slug: '${r.slug}', districtCount: ${r.districtCount} },`).join('\n')}
};

export function getStateMapUrl(code) {
  const entry = STATE_MAP_REGISTRY[code];
  if (!entry) return null;
  return \`/maps/states/\${entry.slug}.json\`;
}

export function getStateName(code) {
  return STATE_MAP_REGISTRY[code]?.name || code;
}
`;
writeFileSync(registryPath, registryContent);
console.log(`✅ Registry updated: ${registryPath}`);
