# Region III data files

Temporary, pre-processed data the dashboard loads directly until the backend
serves it (see `frontend/DASHBOARD.md`, section 7). Prepared once on 2026-10-20.

| File | Contents | Source | License |
|---|---|---|---|
| `region.geojson` | Region III outline | PSA / NAMRIA via OCHA HDX "Philippines – Subnational Administrative Boundaries" (updated 2026-05-28) | CC BY-IGO |
| `provinces.geojson` | 7 provinces | same | CC BY-IGO |
| `municipalities.geojson` | 130 cities and municipalities | same | CC BY-IGO |
| `barangays/<municipality pcode>.geojson` | 3,105 barangays, one file per municipality | same | CC BY-IGO |
| `barangay-index.json` | `[pcode, name, municipality_pcode]` rows for search | same | CC BY-IGO |
| `hospitals.geojson` | 281 OSM hospitals (`amenity=hospital` or `healthcare=hospital`) | © OpenStreetMap contributors, Overpass API, 2026-10-20 | ODbL 1.0 |
| `schools.geojson` | 4,342 OSM schools (`amenity=school`) | © OpenStreetMap contributors, Overpass API, 2026-10-20 | ODbL 1.0 |

How the files were made:

1. Kept only features with `adm1_pcode = PH03` (Region III).
2. Simplified shapes (about 10 m for barangays, up to 200 m for the region outline)
   and rounded coordinates to 5 decimals (about 1 m).
3. Added counts (`municipality_count`, `barangay_count`) for the dashboard heading.
4. Joined OSM facilities to the municipality they fall inside.

Notes:

- Coordinates are WGS 84 longitude/latitude (EPSG:4326).
- Shapes are simplified for display. Do not use them for area or distance calculations.
- OSM facility lists are incomplete and may contain duplicates or unnamed entries.
- The ODbL requires keeping the OpenStreetMap credit and sharing changes to the
  OSM-derived files under the same license.
