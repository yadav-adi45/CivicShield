/**
 * generateStateMaps.mjs
 * 
 * Reads india-states.geojson and generates per-state JSON files
 * with district-like subdivisions for the drill-down map feature.
 * 
 * Each state file contains:
 * - outline: full SVG path for the state boundary
 * - regions: array of subdivision polygons (fan triangulation)
 * - viewBox: SVG viewBox string
 * 
 * Usage: node frontend/scripts/generateStateMaps.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ──────────────────────────────────────────────
const SVG_WIDTH = 500;
const SVG_HEIGHT = 500;
const PADDING = 30;
const MIN_REGIONS = 8;
const MAX_REGIONS = 24;

// ── State name → code mapping ───────────────────────────
const STATE_NAME_TO_CODE = {
  'Andaman and Nicobar Islands': 'AN', 'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR', 'Assam': 'AS', 'Bihar': 'BR',
  'Chandigarh': 'CH', 'Chhattisgarh': 'CT',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN', 'Delhi': 'DL',
  'Goa': 'GA', 'Gujarat': 'GJ', 'Haryana': 'HR',
  'Himachal Pradesh': 'HP', 'Jammu and Kashmir': 'JK',
  'Jharkhand': 'JH', 'Karnataka': 'KA', 'Kerala': 'KL',
  'Ladakh': 'LA', 'Lakshadweep': 'LD', 'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML',
  'Mizoram': 'MZ', 'Nagaland': 'NL', 'Odisha': 'OR',
  'Puducherry': 'PY', 'Punjab': 'PB', 'Rajasthan': 'RJ',
  'Sikkim': 'SK', 'Tamil Nadu': 'TN', 'Telangana': 'TG',
  'Tripura': 'TR', 'Uttar Pradesh': 'UP', 'Uttarakhand': 'UT',
  'West Bengal': 'WB',
};

// ── Helpers ─────────────────────────────────────────────

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function round(n, d = 1) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

/** Seeded PRNG for reproducible jitter */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Flatten nested coordinate arrays to [[lon, lat], ...] */
function flattenCoords(coords) {
  const result = [];
  function walk(arr) {
    if (typeof arr[0] === 'number') {
      result.push(arr);
    } else {
      arr.forEach(walk);
    }
  }
  walk(coords);
  return result;
}

/** Get the outer ring of the largest polygon from a MultiPolygon */
function getLargestRing(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates[0];
  }
  // MultiPolygon — pick polygon with most vertices
  let best = null;
  let bestLen = 0;
  for (const polygon of geometry.coordinates) {
    const ring = polygon[0];
    if (ring.length > bestLen) {
      bestLen = ring.length;
      best = ring;
    }
  }
  return best;
}

/** Get ALL rings for outline (MultiPolygon support) */
function getAllOuterRings(geometry) {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates[0]];
  }
  return geometry.coordinates.map(p => p[0]);
}

/** Project lon/lat ring to SVG coordinates fitting in SVG_WIDTH x SVG_HEIGHT */
function projectRing(ring, bounds) {
  const { minLon, maxLon, minLat, maxLat, scale, xOff, yOff } = bounds;
  return ring.map(([lon, lat]) => [
    round((lon - minLon) * scale + xOff),
    round((maxLat - lat) * scale + yOff),
  ]);
}

/** Compute projection bounds from a set of rings */
function computeBounds(rings) {
  const flat = rings.flat();
  const lons = flat.map(c => c[0]);
  const lats = flat.map(c => c[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const lonRange = maxLon - minLon || 0.01;
  const latRange = maxLat - minLat || 0.01;

  const ew = SVG_WIDTH - 2 * PADDING;
  const eh = SVG_HEIGHT - 2 * PADDING;
  const scale = Math.min(ew / lonRange, eh / latRange);

  const xOff = PADDING + (ew - lonRange * scale) / 2;
  const yOff = PADDING + (eh - latRange * scale) / 2;

  return { minLon, maxLon, minLat, maxLat, scale, xOff, yOff };
}

/** Convert array of points to SVG path d attribute */
function pointsToPath(points) {
  if (points.length < 2) return '';
  return 'M ' + points.map(([x, y]) => `${x},${y}`).join(' L ') + ' Z';
}

/** Simplify polygon by sampling every Nth point */
function simplifyPolygon(points, targetCount) {
  // Remove duplicate closing point if present
  let pts = [...points];
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    pts = pts.slice(0, -1);
  }
  if (pts.length <= targetCount) return pts;

  const step = Math.max(1, Math.floor(pts.length / targetCount));
  const result = [];
  for (let i = 0; i < pts.length; i += step) {
    result.push(pts[i]);
  }
  // Ensure we don't exceed target too much
  return result.slice(0, targetCount);
}

/** Compute polygon centroid */
function centroid(points) {
  let cx = 0, cy = 0;
  for (const [x, y] of points) {
    cx += x;
    cy += y;
  }
  return [round(cx / points.length), round(cy / points.length)];
}

/** Compute polygon area (shoelace formula) for sizing */
function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

/** Generate interior seed points using offset centroid approach */
function generateInteriorSeeds(projectedRing, numSeeds, rng) {
  const c = centroid(projectedRing);
  if (numSeeds <= 1) return [c];

  const seeds = [c];
  // Generate additional seeds by offsetting from centroid toward boundary vertices
  const step = Math.max(1, Math.floor(projectedRing.length / (numSeeds - 1)));
  for (let i = 0; i < projectedRing.length && seeds.length < numSeeds; i += step) {
    const bv = projectedRing[i];
    // Place seed at 40-60% from centroid toward boundary
    const t = 0.35 + rng() * 0.25;
    seeds.push([
      round(c[0] + (bv[0] - c[0]) * t),
      round(c[1] + (bv[1] - c[1]) * t),
    ]);
  }
  return seeds;
}

/** Distance squared between two points */
function dist2(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

/**
 * Create Voronoi-like fan regions using multiple interior seeds.
 * 
 * Algorithm:
 * 1. Assign each boundary vertex to its nearest seed
 * 2. For each seed, collect its boundary vertices (in order)
 * 3. Create fan triangles from seed to consecutive boundary vertex pairs
 * 4. Merge adjacent triangles into larger quadrilateral regions
 */
function createRegions(simplifiedRing, seeds, rng) {
  const regions = [];

  if (seeds.length === 1) {
    // Simple fan from single centroid
    const c = seeds[0];
    const merged = mergeTriangles(simplifiedRing, c);
    for (let i = 0; i < merged.length; i++) {
      const verts = merged[i];
      const rc = centroid(verts);
      regions.push({
        id: `region-${i + 1}`,
        name: `District ${i + 1}`,
        path: pointsToPath(verts),
        center: rc,
      });
    }
    return regions;
  }

  // Multi-seed: assign boundary vertices to nearest seed
  const assignments = seeds.map(() => []);
  for (let i = 0; i < simplifiedRing.length; i++) {
    const v = simplifiedRing[i];
    let minD = Infinity;
    let nearest = 0;
    for (let s = 0; s < seeds.length; s++) {
      const d = dist2(v, seeds[s]);
      if (d < minD) {
        minD = d;
        nearest = s;
      }
    }
    assignments[nearest].push(i);
  }

  let regionIdx = 0;
  for (let s = 0; s < seeds.length; s++) {
    const indices = assignments[s];
    if (indices.length < 2) continue;

    const seed = seeds[s];
    // Create regions from consecutive pairs of assigned boundary vertices
    for (let i = 0; i < indices.length - 1; i++) {
      const p1 = simplifiedRing[indices[i]];
      const p2 = simplifiedRing[indices[i + 1]];
      const verts = [seed, p1, p2];
      const rc = centroid(verts);
      regionIdx++;
      regions.push({
        id: `region-${regionIdx}`,
        name: `District ${regionIdx}`,
        path: pointsToPath(verts),
        center: rc,
      });
    }
    // Close the gap if this seed has the last and first boundary vertices
    // (only for single-seed, multi-seed doesn't wrap)
  }

  return regions;
}

/** Merge pairs of adjacent fan triangles into quadrilaterals */
function mergeTriangles(ring, center) {
  const merged = [];
  for (let i = 0; i < ring.length; i += 2) {
    const p1 = ring[i];
    const p2 = ring[(i + 1) % ring.length];
    const p3 = ring[(i + 2) % ring.length];
    if (i + 1 < ring.length) {
      // Merge two triangles: center→p1→p2 and center→p2→p3
      merged.push([center, p1, p2, p3]);
    } else {
      // Odd triangle at the end
      merged.push([center, p1, p2]);
    }
  }
  return merged;
}

// ── Main ────────────────────────────────────────────────

const geojsonPath = join(__dirname, '..', 'public', 'india-states.geojson');
const outputDir = join(__dirname, '..', 'public', 'maps', 'states');

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const geojson = JSON.parse(readFileSync(geojsonPath, 'utf-8'));
const registry = [];

console.log(`Processing ${geojson.features.length} states/UTs...\n`);

for (const feature of geojson.features) {
  const name = feature.properties.st_nm;
  const code = STATE_NAME_TO_CODE[name];

  if (!code) {
    console.warn(`⚠ No code for "${name}", skipping`);
    continue;
  }

  const slug = toSlug(name);
  const rng = seededRandom(code.charCodeAt(0) * 1000 + code.charCodeAt(1));

  // Get all outer rings for outline
  const allRings = getAllOuterRings(feature.geometry);
  const bounds = computeBounds(allRings);

  // Project all rings for outline
  const projectedRings = allRings.map(r => projectRing(r, bounds));
  const outlinePaths = projectedRings.map(r => pointsToPath(r));
  const outline = outlinePaths.join(' ');

  // Use largest ring for region subdivision
  const mainRing = getLargestRing(feature.geometry);
  const projectedMain = projectRing(mainRing, bounds);

  // Remove duplicate closing vertex
  let cleanRing = [...projectedMain];
  if (cleanRing.length > 1) {
    const f = cleanRing[0];
    const l = cleanRing[cleanRing.length - 1];
    if (f[0] === l[0] && f[1] === l[1]) {
      cleanRing = cleanRing.slice(0, -1);
    }
  }

  // Determine target region count based on polygon complexity
  const area = polygonArea(cleanRing);
  const complexity = cleanRing.length;
  let targetRegions = Math.min(
    MAX_REGIONS,
    Math.max(MIN_REGIONS, Math.round(complexity / 12))
  );

  // Small states/UTs get fewer regions
  if (area < 3000) targetRegions = Math.min(targetRegions, 5);
  else if (area < 8000) targetRegions = Math.min(targetRegions, 8);

  // Simplify for region generation (need 2x target since we merge pairs)
  const simplifiedCount = targetRegions * 2;
  const simplified = simplifyPolygon(cleanRing, simplifiedCount);

  // Always use single-centroid fan with merged quads for clean look
  const c = centroid(simplified);
  let regions = createRegions(simplified, [c], rng);

  // Ensure we have at least some regions
  if (regions.length === 0) {
    const c = centroid(cleanRing);
    regions = [{
      id: 'region-1',
      name: 'District 1',
      path: pointsToPath(cleanRing),
      center: c,
    }];
  }

  const stateData = {
    name,
    code,
    slug,
    viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`,
    outline,
    regions,
  };

  const outPath = join(outputDir, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(stateData, null, 2));

  registry.push({ name, code, slug, regionCount: regions.length });
  console.log(`✓ ${name} (${code}) → ${slug}.json  [${regions.length} regions]`);
}

console.log(`\n✅ Generated ${registry.length} state map files in ${outputDir}`);

// Write registry
const registryPath = join(__dirname, '..', 'src', 'maps', 'stateMapRegistry.js');
const registryContent = `/** Auto-generated state map registry */
export const STATE_MAP_REGISTRY = {
${registry.map(r => `  '${r.code}': { name: '${r.name.replace(/'/g, "\\'")}', slug: '${r.slug}', regionCount: ${r.regionCount} },`).join('\n')}
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
console.log(`✅ Generated registry at ${registryPath}`);
