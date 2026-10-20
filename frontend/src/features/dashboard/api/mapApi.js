/**
 * Map data for Region III.
 *
 * Every function loads a pre-processed static file from `public/data/region3/`
 * for now. Each one names the backend endpoint that should replace it; when
 * that endpoint exists, change only the URL here (responses keep the same
 * GeoJSON shape). See frontend/DASHBOARD.md, section 7.
 */
const DATA_ROOT = `${import.meta.env.BASE_URL}data/region3`;

const cache = new Map();

async function getJson(path) {
  if (!cache.has(path)) {
    const request = fetch(`${DATA_ROOT}/${path}`).then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
      return response.json();
    });
    // Drop failed requests from the cache so they can be retried.
    request.catch(() => cache.delete(path));
    cache.set(path, request);
  }
  return cache.get(path);
}

/** Future: GET /api/boundaries?level=region&pcode=PH03 */
export const fetchRegion = () => getJson("region.geojson");

/** Future: GET /api/boundaries?level=province&region=PH03 */
export const fetchProvinces = () => getJson("provinces.geojson");

/** Future: GET /api/boundaries?level=municipality&province={pcode} */
export const fetchMunicipalities = () => getJson("municipalities.geojson");

/** Future: GET /api/boundaries?level=barangay&municipality={pcode} */
export const fetchBarangays = (municipalityPcode) =>
  getJson(`barangays/${encodeURIComponent(municipalityPcode)}.geojson`);

/** Future: GET /api/search?q= (barangays are the only level not loaded up front) */
export const fetchBarangayIndex = () => getJson("barangay-index.json");

/** Future: GET /api/facilities?kind=hospital|school&province={pcode} */
export const fetchFacilities = (kind) => getJson(`${kind}s.geojson`);
