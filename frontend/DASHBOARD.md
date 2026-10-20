# Dashboard guide

This file explains the **Planning console** dashboard in `frontend/`:

- what each part of the screen does
- which files depend on which
- which backend endpoints are needed to replace the static data and demo data
- a change log for buttons, design, colors, and data

It is written for both people and coding agents. Keep it up to date when you
change the dashboard (see [How to update this file](#9-how-to-update-this-file)).

- Design source: Figma file `RESILIA`, frame **Dashboard** (node `42:828`)
  https://www.figma.com/design/h2TyFbRgu6sYtVPZhTbRN4/RESILIA?node-id=42-828
- Designed for a 1680 px wide screen. It also works on tablets and phones.
- Map area: **Region III (Central Luzon)**: 7 provinces, 130 cities and
  municipalities, 3,105 barangays.

What is real and what is demo:

| Part | Status |
|---|---|
| Map, boundaries, hospitals, schools, area picker, search | **Real data**, loaded from static files (no backend yet) |
| Candidate sites, impact, investment, charts, routing, thresholds, vulnerability | **DEMO**: synthetic numbers, marked with a `DEMO` badge |
| Flood, landslide, earthquake, population, evacuation centers | **No data yet**: shown as disabled layers |

---

## Contents

1. [Quick start](#1-quick-start)
2. [Screen map](#2-screen-map)
3. [How data flows](#3-how-data-flows)
4. [Files and what depends on what](#4-files-and-what-depends-on-what)
5. [Component reference](#5-component-reference)
6. [Buttons and controls](#6-buttons-and-controls)
7. [Backend endpoints needed](#7-backend-endpoints-needed)
8. [Design system: colors, fonts, shapes](#8-design-system-colors-fonts-shapes)
9. [How to update this file](#9-how-to-update-this-file)
10. [Known issues](#10-known-issues)
11. [Change log](#11-change-log)

---

## 1. Quick start

```bash
cd frontend
npm install
npm run dev      # opens http://localhost:5173
npm run build    # production build, same check as CI
```

Imports can use `@/` as a shortcut for `frontend/src/`
(for example `@/components/ui/Button.jsx`). This is set in `vite.config.js`.

The map needs internet access for the street basemap (OpenStreetMap tiles).
Boundaries and facilities load from `public/data/region3/` and work offline.

---

## 2. Screen map

The page is built from these blocks, top to bottom. Names in `[brackets]` are
the React components.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [AppHeader]  logo · workspace tabs · DEMO DATA · Save · Export · profile   │
├────────────────────────────────────────────────────────────────────────────┤
│ [ScopeBar]   LGU scope · Province ▾ City ▾ Barangay ▾ · scenario · search  │
├────────────────────────────────────────────────────────────────────────────┤
│ Heading: "Spatial accessibility planner" · Region III / Pampanga / ...     │
├──────────────────┬──────────────────────────────────────┬──────────────────┤
│ LEFT (280 px)    │ CENTER (fluid)                       │ RIGHT (384 px)   │
│                  │                                      │                  │
│ [SpatialLayers   │ [RegionMap]  ← real Leaflet map      │ [ScenarioImpact  │
│  Panel]          │   toolbar · map · legend             │  Panel]   DEMO   │
│                  │                                      │ [SiteRationale   │
│ [GapThresholds   │                                      │  Panel]   DEMO   │
│  Panel]   DEMO   │                                      │ [Investment      │
│                  ├──────────────────────────────────────┤  Panel]   DEMO   │
│ [CandidateSites  │ [SupplyRoutingPanel]  DEMO           │ [ProjectHandoff  │
│  Panel]   DEMO   │                                      │  Panel]          │
├──────────────────┴──────────┬───────────────────────────┼──────────────────┤
│ [CapacitySurgePanel] DEMO   │ [TravelTimePanel] DEMO    │ [PlanningTools   │
│                             │                           │  Panel]   DEMO   │
├─────────────────────────────┴───────────────────────────┴──────────────────┤
│ Footer: data credits and disclaimer · version                              │
└────────────────────────────────────────────────────────────────────────────┘
```

How the layout changes on smaller screens (`DashboardPage.module.css`):

| Screen width     | Layout                                                        |
|------------------|---------------------------------------------------------------|
| above 1440 px    | 3 columns: 280 / fluid / 384                                  |
| 1281 – 1440 px   | 3 columns: 260 / fluid / 340                                  |
| 861 – 1280 px    | 2 columns (controls + map); insights move below in 2 columns  |
| 860 px and below | 1 column: map first, then controls, insights, charts          |

---

## 3. How data flows

There are two data paths: **map data** (real) and **dashboard data** (demo).

```
 MAP DATA (real)                              DASHBOARD DATA (demo)

 public/data/region3/*.geojson                mockDashboard.js
        │                                            │
        ▼                                            ▼
 mapApi.js  fetchProvinces(), ...             dashboardApi.js  fetchDashboard()
   ← each function names its future endpoint     ← swap for a real fetch() later
        │                                            │
        ▼                                            ▼
 useMapData(area)                             useDashboardData()
   region, provinces, municipalities,                │
   barangays of the selected municipality,           │
   hospitals + schools inside the area               │
        │                                            │
        └──────────────► DashboardPage ◄─────────────┘
                              │
                     usePlannerState(data)
                     (scope, area, scenario, layers,
                      focused facility, demo choices)
                              │
                              ▼
                        all panels + map
```

Three kinds of state:

| Kind              | Where it lives          | Example                                 | Comes from backend? |
|-------------------|-------------------------|-----------------------------------------|---------------------|
| **Data**          | `useMapData`, `useDashboardData` | boundaries, hospitals, chart values | Yes (later) |
| **User choices**  | `usePlannerState`       | selected province, scope, layers on/off | No, browser only    |
| **Panel-only UI** | `useState` in a panel   | Place-facility mode, draft pins         | No                  |

### The area selection

The selected area is three codes (PSGC codes from PSA, e.g. Pampanga = `PH03054`):

```
area = { provincePcode, municipalityPcode, barangayPcode }   // any can be null
scope = "regional" | "provincial" | "municipal" | "barangay"
```

- `selectArea(area, level)` sets the area **and** moves the scope to that level.
- Changing the scope to a wider level keeps wider choices and clears narrower
  ones (Barangay → Provincial keeps the province, clears city and barangay).
- Changing the scope to a narrower level without a choice shows a prompt on the
  map ("Click a city or municipality to open it").

**Example: opening a city**

1. The planner picks **Pampanga** in the Province drop-down
   → `selectArea({ provincePcode: "PH03054" }, "provincial")`.
2. `useMapData` filters hospitals and schools to Pampanga (76 and 933), and the
   map flies to Pampanga and draws its 22 cities and municipalities.
3. The planner clicks **City of San Fernando** on the map
   → `selectArea({ provincePcode, municipalityPcode }, "municipal")`.
4. `useMapData` loads `barangays/PH0305416.geojson` (35 barangays). The heading
   now reads `Region III / Pampanga / City of San Fernando (Capital) / 35 barangays`.

---

## 4. Files and what depends on what

### 4.1 Folder layout

```
frontend/
├── public/data/region3/            REAL map data (static, temporary, see SOURCES.md)
│   ├── region.geojson              Region III outline
│   ├── provinces.geojson           7 provinces
│   ├── municipalities.geojson      130 cities and municipalities
│   ├── barangays/<pcode>.geojson   3,105 barangays, one file per municipality
│   ├── barangay-index.json         names only, for search
│   ├── hospitals.geojson           281 OSM hospitals
│   ├── schools.geojson             4,342 OSM schools
│   └── SOURCES.md                  sources, licenses, how the files were made
└── src/
    ├── main.jsx, App.jsx
    ├── styles/                     tokens.css (design tokens), global.css
    ├── assets/icons/               50 SVG icons exported from Figma
    ├── components/                 shared, no dashboard knowledge
    │   ├── brand/BrandLogo.jsx
    │   ├── charts/                 ChartLegend, chartUtils
    │   └── ui/                     Badge, Button, Icon, Panel, SegmentedControl
    └── features/dashboard/
        ├── DashboardPage.jsx       layout + wiring
        ├── format.js               number / peso formatting
        ├── api/
        │   ├── mapApi.js           map data loading (ONLY place that fetches map data)
        │   └── dashboardApi.js     demo data loading
        ├── data/mockDashboard.js   demo data + layer list
        ├── hooks/
        │   ├── useMapData.js       boundaries + facilities for the selected area
        │   ├── useDashboardData.js loading / ready / error for demo data
        │   └── usePlannerState.js  scope, area, scenario, layers, focus, ...
        └── components/             one folder per panel (see section 5)
```

### 4.2 Dependency tree

Arrows mean "uses".

```
DashboardPage
├── useDashboardData ──► dashboardApi ──► mockDashboard
├── useMapData ────────► mapApi ──► public/data/region3/*
├── usePlannerState
├── AppHeader ─────────────► BrandLogo, Badge, Button, Icon
├── ScopeBar
│   ├── LocalityPicker       Province ▾ → City ▾ → Barangay ▾
│   └── SearchBox ─────────► mapApi.fetchBarangayIndex (lazy)
├── SpatialLayersPanel ────► Panel, Icon, format
├── GapThresholdsPanel ────► Panel, SegmentedControl, Icon          (DEMO)
├── CandidateSitesPanel ───► Panel, format                          (DEMO)
├── RegionMap ─────────────► react-leaflet, leaflet
│   ├── BoundaryLayers       region outline, clickable areas, siblings
│   ├── FacilityLayers       hospital pins, school dots, popups
│   ├── MapBehaviour         FitToArea (camera), DraftPlacement, DataAttribution
│   └── mapContent.js        safe popup/tooltip DOM, marker icons
├── SupplyRoutingPanel ────► Panel, Badge, Icon                     (DEMO)
├── ScenarioImpactPanel ───► Panel, Badge, Icon, format             (DEMO)
├── SiteRationalePanel ────► Panel, Badge, Icon                     (DEMO)
├── InvestmentPanel ───────► Panel, Badge, format                   (DEMO)
├── ProjectHandoffPanel ───► Panel, Button, Icon
├── CapacitySurgePanel ────► Panel, ChartLegend, chartUtils         (DEMO)
├── TravelTimePanel ───────► Panel, ChartLegend, chartUtils         (DEMO)
└── PlanningToolsPanel ────► Panel, SegmentedControl, Button, Badge (DEMO)

Shared UI (components/ui) ──► styles/tokens.css
```

Rules to keep this tidy (from `AGENT.md`):

- Panels never call `fetch`. Only files in `api/` load data.
- Shared components in `components/` must not import from `features/`.
- Colors and fonts come from `tokens.css` variables, not hard-coded hex values.
- No analysis logic in React. Coverage, travel times, scores and deficits must
  come from the backend. The frontend only filters, counts and formats.
- Never insert data text (names from OSM, PSA, users) as HTML. Use
  `textContent` or JSX. See `RegionMap/mapContent.js`.

---

## 5. Component reference

| Component | Shows | Reads | Planner state |
|---|---|---|---|
| `AppHeader` | Logo, tabs, Save, Export, sync status | `data.planner` | own: active tab, "saved" message |
| `ScopeBar` | LGU scope, area picker, hazard scenario, search | `scopes`, `scenarios`, `mapData` | `scope`, `area`, `scenario`, `focusedFacilityId` |
| `LocalityPicker` | Province ▾ / City ▾ / Barangay ▾ drop-downs | `mapData` | `area` |
| `SearchBox` | Search box with results list (keyboard friendly) | `mapData`, barangay index | `area`, `focusedFacilityId` |
| `SpatialLayersPanel` | 8 layers with live counts, vulnerable groups (DEMO) | `layers`, `vulnerability`, facility counts | `layers`, `vulnerableGroups` |
| `GapThresholdsPanel` | Travel-time choice, deficit slider (DEMO) | `thresholds` | `travelTime`, `capacityDeficit` |
| `CandidateSitesPanel` | Ranked candidates (DEMO, no real location) | `candidates` | `selectedCandidate` |
| `RegionMap` | Leaflet map, boundaries, facilities, legend | `mapData` | `scope`, `area`, `layers`, `scenario`, `focusedFacilityId` |
| `SupplyRoutingPanel` | Route and shortages (DEMO) | `supplyRoute` | – |
| `ScenarioImpactPanel` | Coverage before → after (DEMO) | `impact` | – |
| `SiteRationalePanel` | "Why this site?" (DEMO) | `rationale` | – |
| `InvestmentPanel` | Cost estimate (DEMO) | `investment` | – |
| `ProjectHandoffPanel` | "Push gap to DEPMIS" | – | – |
| `CapacitySurgePanel` | Demand vs capacity chart (DEMO) | `capacitySurge` | – |
| `TravelTimePanel` | Travel-time histogram (DEMO) | `travelTime` | – |
| `PlanningToolsPanel` | Replay, flood horizon, citizen view (DEMO) | `planningTools` | `horizon` |

### 5.1 How the map works

`RegionMap` uses **Leaflet** (through `react-leaflet`). Leaflet only *draws*;
the data comes from `useMapData`.

```
viewport
├── Leaflet map
│   ├── basemap tiles      street map from tile.openstreetmap.org (shown when
│   │                      "Road network" is on)
│   ├── BoundaryLayers     SVG paths, styled with CSS classes
│   │   ├── siblings       faint dashed areas next to the selection (click = switch)
│   │   ├── children       clickable areas inside the selection (click = open)
│   │   ├── selected       thick outline of the selected province/city
│   │   └── region         Region III outline
│   ├── FacilityLayers     hospitals = icon pins, schools = canvas dots
│   └── DraftPlacement     "P1, P2…" pins from Place facility
└── map chrome (above Leaflet)
    status chips · hazard warning · zoom buttons · area chip · legend
```

What you see at each level:

| Selection | Clickable areas | Faint siblings |
|---|---|---|
| Region III | 7 provinces | – |
| A province | its cities/municipalities | other provinces |
| A city/municipality | its barangays | other cities in the province |
| A barangay | same as above, selected barangay filled | same |

Other behaviour:

- **Camera:** `FitToArea` is the only component that moves the map. It flies to
  a focused facility if there is one, otherwise to the selected area.
- **Hospital pins** shrink to small squares below zoom 11 so the region stays readable.
- **Schools** are drawn on a canvas because there are thousands of them.
- **Popups** show name, type, operator, city and a link to the OSM record.
- **Credits** ("© OpenStreetMap contributors", "PSA/NAMRIA via OCHA HDX") always
  show at the bottom right, even with the basemap off. This is required by the licenses.
- Coordinates are longitude/latitude (WGS 84). GeoJSON stores `[lng, lat]`,
  Leaflet wants `[lat, lng]`. Swapping them is the most common map bug.

---

## 6. Buttons and controls

Status: **Works** = fully works · **Demo** = works with fake or local-only
behaviour · **No data** = disabled until the dataset exists · **Not wired** =
does nothing yet.

| Control | Where | What it does now | Status | Needs endpoint |
|---|---|---|---|---|
| Workspace tabs | Header | Switches tab; other tabs show a placeholder | Demo | – |
| Save scenario | Header | Shows "Scenario saved" for 2 s, saves nothing | Demo | `POST /api/scenarios` |
| Export PDF briefing | Header | Opens the browser print dialog | Demo | `POST /api/briefings` |
| LGU scope (Barangay … Regional) | Scope bar | Sets the level; wider levels clear narrower choices | Works | – |
| Province ▾ / City ▾ / Barangay ▾ | Scope bar | Selects an area; map and heading follow | Works | boundaries endpoints |
| Scenario (dry / flood / earthquake) | Scope bar | Changes map badge; warns hazard layer is missing | Demo | `GET /api/hazards` |
| Search + Ctrl/⌘ K | Scope bar | Finds provinces, cities, barangays, named hospitals and schools; selecting one opens it on the map | Works | `GET /api/search?q=` |
| Hospitals, Schools | Layers | Show/hide; counts follow the selected area | Works | `GET /api/facilities` |
| Road network | Layers | Shows/hides the OSM street basemap | Works | – |
| Evacuation centers, Flood, Landslide, Earthquake, Population | Layers | Disabled, labelled "no data" | No data | see section 7.3 |
| Vulnerability chips | Left | Toggle on/off | Demo | `POST /api/analysis` |
| Travel time, Capacity deficit | Left | Change selection | Demo | `POST /api/analysis` |
| Candidate list items | Left | Highlight a candidate (no map location) | Demo | `POST /api/analysis` |
| Place facility | Map | Next map click drops a draft "P1" pin at that real location; Esc cancels | Works (not analysed) | `POST /api/simulations` |
| Clear drafts (N) | Map | Removes draft pins | Works | – |
| Map areas | Map | Click to open (province → city → barangay); hover shows the name | Works | – |
| Facility pins/dots | Map | Click for popup with details and OSM link | Works | – |
| Show all of Region III / Zoom + / Zoom − / Zoom to area | Map | Reset to region, zoom, fit selected area | Works | – |
| Review readiness ↗ | Supply routing | Dead `#` link | Not wired | `GET /api/sites/{id}/readiness` |
| Push gap to DEPMIS | Handoff | Nothing | Not wired | `POST /api/handoffs/depmis` |
| Historical event replay | Planning tools | Toggles label | Demo | `GET /api/events/{id}/replay` |
| Demo flood · 2020 | Planning tools | Nothing (no menu yet) | Not wired | `GET /api/events` |
| Flood projection (25 / 50 / 100-year) | Planning tools | Changes selection | Demo | `GET /api/hazards?horizon=` |
| Scenario tools ↗, Preview view ↗ | Planning tools | Dead `#` links | Not wired | `GET /api/citizen-view` |

---

## 7. Backend endpoints needed

Today the backend only has `GET /api/health`. Everything below is **proposed**
and is meant to be written by the backend developer.
Follow `AGENT.md`: route → Pydantic schema → service → (later) repository.

Base URL comes from `VITE_API_BASE_URL` (default `http://localhost:8000/api`).

### 7.1 Summary

| # | Method + path | Replaces / used by | Priority |
|---|---|---|---|
| 1 | `GET /api/boundaries` | `mapApi.fetchRegion/Provinces/Municipalities/Barangays` | **First** |
| 2 | `GET /api/facilities` | `mapApi.fetchFacilities` | **First** |
| 3 | `GET /api/search` | `SearchBox` (client-side today) | High |
| 4 | `GET /api/hazards` | disabled hazard layers, scenario switch | High (needs team data) |
| 5 | `POST /api/analysis` | thresholds, candidates, impact, charts | High |
| 6 | `POST /api/simulations` | Place facility, candidate simulation | High |
| 7 | `GET /api/dashboard` | `dashboardApi.fetchDashboard` (demo data) | Medium |
| 8 | `POST /api/scenarios` | Save scenario | Medium |
| 9 | `POST /api/briefings` | Export PDF briefing | Low |
| 10 | `GET /api/sites/{id}/readiness`, `GET /api/events`, `GET /api/citizen-view` | small panels | Low |
| 11 | `POST /api/handoffs/depmis` | Push gap to DEPMIS | Later (needs DEPMIS access) |

### 7.2 Map endpoints (start here)

These replace the static files. **Return exactly the same GeoJSON** as the files
in `public/data/region3/`, then only the URLs in `mapApi.js` change.

#### `GET /api/boundaries`

| Param | Values | Example |
|---|---|---|
| `level` | `region`, `province`, `municipality`, `barangay` | `municipality` |
| `province` | province PSGC code | `PH03054` |
| `municipality` | municipality PSGC code (required for `barangay`) | `PH0305416` |
| `simplify` (optional) | tolerance in meters | `50` |

Response: a GeoJSON `FeatureCollection`. One feature:

```json
{
  "type": "Feature",
  "properties": {
    "pcode": "PH0305416",
    "name": "City of San Fernando (Capital)",
    "province": "Pampanga",
    "province_pcode": "PH03054",
    "barangay_count": 35,
    "area_sqkm": 70.11,
    "center_lat": 15.0699,
    "center_lon": 120.6542
  },
  "geometry": { "type": "Polygon", "coordinates": [[[120.6542, 15.0699], "..."]] }
}
```

Property names per level:

| Level | Properties |
|---|---|
| region | `pcode, name, barangay_count, area_sqkm, center_lat, center_lon` |
| province | `pcode, name, municipality_count, barangay_count, area_sqkm, center_lat, center_lon` |
| municipality | `pcode, name, province, province_pcode, barangay_count, area_sqkm, center_lat, center_lon` |
| barangay | `pcode, name, municipality, municipality_pcode, province, province_pcode, area_sqkm, center_lat, center_lon` |

**Use case:** the planner opens Pampanga. The browser calls
`GET /api/boundaries?level=municipality&province=PH03054` and draws 22 shapes.

#### `GET /api/facilities`

| Param | Values |
|---|---|
| `kind` | `hospital`, `school` (later `evacuation_center`) |
| `province`, `municipality` (optional) | PSGC codes to filter |

Response: GeoJSON `FeatureCollection` of `Point`s with properties
`osm_id, kind, name, operator, municipality, municipality_pcode, province, province_pcode`.
When team datasets (DOH, DepEd, LGU) arrive, add `source` and `capacity`, and
keep `osm_id` optional.

#### `GET /api/search?q=san fer&limit=8`

Response (same shape `SearchBox` builds today):

```json
[
  { "type": "municipality", "label": "City of San Fernando (Capital)", "sub": "Pampanga",
    "area": { "provincePcode": "PH03054", "municipalityPcode": "PH0305416" } },
  { "type": "hospital", "label": "Jose B. Lingad Memorial Regional Hospital",
    "sub": "City of San Fernando (Capital), Pampanga", "osm_id": "way/118806480",
    "area": { "provincePcode": "PH03054", "municipalityPcode": "PH0305416" } }
]
```

#### How the static files were made (pipeline to rebuild in the backend)

A good first backend task is to write this as a proper, repeatable script or
service (for example `backend/app/services/boundaries.py` plus a data-prep
command). The steps:

1. Download the official boundaries (OCHA HDX "Philippines – Subnational
   Administrative Boundaries", geodatabase, about 360 MB).
2. Keep features with `adm1_pcode = 'PH03'`.
3. Rename columns (`adm3_name → name`, `adm3_pcode → pcode`, ...).
4. Count children (barangays per municipality, municipalities per province).
5. Simplify shapes for display and round coordinates to 5 decimals.
6. Get OSM hospitals (`amenity=hospital` or `healthcare=hospital`) and schools
   (`amenity=school`) for Region III, then spatial-join each one to its municipality.

Tools: GeoPandas + pyogrio. Details and licenses: `public/data/region3/SOURCES.md`.

### 7.3 Data still needed for the disabled layers

| Layer | Dataset (from the team proposal) | Endpoint |
|---|---|---|
| Evacuation centers | LGU / DSWD lists | `GET /api/facilities?kind=evacuation_center` |
| Flood hazard | MGB, GeoRiskPH / HazardHunterPH, GATES | `GET /api/hazards?type=flood` |
| Landslide hazard | MGB | `GET /api/hazards?type=landslide` |
| Earthquake hazard | PHIVOLCS | `GET /api/hazards?type=earthquake` |
| Population density | PSA census by barangay | add `population` to barangay properties |

To enable a layer: build the endpoint, set `available: true` in
`mockDashboard.js` `layers`, and draw it in `RegionMap`.

### 7.4 Analysis endpoints

#### `POST /api/analysis`

```json
// request
{ "area": { "provincePcode": "PH03054", "municipalityPcode": null },
  "scenario": "flood-100", "travelTimeMinutes": 15,
  "capacityDeficitPercent": 20, "vulnerableGroups": ["seniors", "infants", "pwd"] }
// response: replaces the DEMO parts of mockDashboard
{ "candidates": [...], "impact": {...}, "capacitySurge": [...], "travelTime": [...] }
```

Candidates must then carry a real location: `"location": { "lat": 15.03, "lng": 120.69 }`.

**Use case:** the planner sets 30 minutes for Pampanga under the flood scenario.
The backend routes over the OSM road network with flooded roads removed, and
the ranked candidates, impact and histogram update.

#### `POST /api/simulations`

```json
// request (a draft pin from Place facility)
{ "scenario": "flood-100", "location": { "lat": 15.03, "lng": 120.69 }, "capacity": 400 }
// response
{ "impact": {...}, "rationale": {...}, "investment": {...}, "catchments": { "min15": GeoJSON, "min30": GeoJSON } }
```

Routing options (see the team discussion): start with OSMnx + NetworkX inside
FastAPI (easy to remove flooded roads); move to OSRM later if it gets slow.

### 7.5 Smaller endpoints

| Endpoint | Request → Response (short) |
|---|---|
| `GET /api/dashboard` | → same shape as `mockDashboard.js` |
| `POST /api/scenarios` | `{ name, area, scenario, thresholds }` → `{ id, savedAt }` |
| `POST /api/briefings` | `{ scenarioId }` → PDF file |
| `GET /api/sites/{id}/readiness` | → `{ shortages: [[{ label, count }]] }` |
| `GET /api/events` / `GET /api/events/{id}/replay` | → event list / time steps |
| `GET /api/citizen-view` | → `{ title, description, sample, note }` |
| `POST /api/handoffs/depmis` | `{ scenarioId, candidateId }` → `{ status, reference }` |

Security notes for whoever builds these:

- Validate every parameter with Pydantic: enums for `level`, `kind`, `scenario`;
  a regex like `^PH\d{2,10}$` for PSGC codes; limits on `q` length and `limit`.
- Never build file paths or SQL from raw parameters (path traversal, SQL injection).
- `POST` endpoints change state. Add authentication before exposing them
  outside a local demo.
- Data that may not be public (GATES, LGU lists) must stay on the server.
  Anything in `frontend/public/` is downloadable by anyone.
- Never put secrets in `VITE_` variables. They are visible in the browser.

---

## 8. Design system: colors, fonts, shapes

All values live in `src/styles/tokens.css`. Use the variable, not the hex code.

### 8.1 Colors

| Token | Hex | Used for |
|---|---|---|
| `--color-brand-900` | `#07585e` | Selected options, dark buttons, region and selected outlines, area chip |
| `--color-brand-700` | `#087e83` | Primary button, checkboxes, scores, school dots, area borders |
| `--color-brand-500` | `#1daab4` | Active tab, logo gradient, focus ring, area fill |
| `--color-brand-100` | `#d0e8e4` | Coverage bar track |
| `--color-brand-50`  | `#e5f3f2` | Brand badges, selected candidate card, search highlight |
| `--color-ink`       | `#20383e` | Main text |
| `--color-muted`     | `#657b80` | Secondary text, sibling area outlines |
| `--color-subtle`    | `#8a9da1` | Hints, "data pending" legend note |
| `--color-border`    | `#d9e3e5` | Borders, dividers, grid lines |
| `--color-surface`   | `#ffffff` | Panels |
| `--color-surface-alt` | `#f5f8f8` | Scope bar, neutral chips |
| `--color-page`      | `#edf2f3` | Page background |
| `--color-warning` / `-bg` | `#a76a17` / `#fcf2df` | DEMO badges, estimates, review notes |
| `--color-danger` / `-bg` / `-border` | `#c55b51` / `#fbede9` / `#ecc4bc` | "Hazard layer not loaded" warning, "avoid" badges |
| `--color-chart-demand` | `#d6b87e` | "Projected demand" bars |
| `--color-chart-existing` | `#b9c9cd` | "Existing" / "Before" bars |
| `--color-map-ground` | `#f1f2ea` | Map background while tiles load |

Leaflet map paths are styled with CSS classes in `RegionMap.module.css` (CSS
overrides Leaflet's default blue). Canvas school dots read `--color-brand-700`
at runtime with `token()` in `mapContent.js`.

### 8.2 Fonts

| Font | Weights | Used for |
|---|---|---|
| Inter | 400, 600, 700 | All interface text, including map popups |
| IBM Plex Mono | 400 | Layer counts (`281`, `no data`), version text |
| Gantari | 800 | "RESiLiA" logo only |

### 8.3 Shapes and spacing

| Token | Value | Used for |
|---|---|---|
| `--radius-xs` | 3 px | Checkboxes |
| `--radius-sm` | 4 px | Badges, chips |
| `--radius-md` | 6 px | Buttons, inputs, drop-downs, popups |
| `--radius-lg` | 8 px | Panels |
| `--shadow-float` | `0 3px 12px rgba(36,72,76,.09)` | Things floating on the map |

### 8.4 Shared components

| Component | Variants | Example |
|---|---|---|
| `Button` | `secondary`, `primary`, `strong`; size `md` / `sm` | `<Button size="sm" variant="primary" icon={pinIcon}>Place facility</Button>` |
| `Badge` | `brand`, `warning`, `neutral`, `danger`; passes extra props (e.g. `title`) | `<Badge tone="warning">DEMO DATA</Badge>` |
| `SegmentedControl` | `group`, `tiles`, `chips` | `<SegmentedControl variant="tiles" options={...} value={v} onChange={setV} />` |
| `Panel` / `PanelHeading` / `Divider` | `PanelHeading demo` adds a DEMO badge | `<PanelHeading title="Travel-time histogram" demo />` |
| `Icon` | – | `<Icon src={saveIcon} />` or with `label` |

---

## 9. How to update this file

When you change the dashboard:

1. Add a line to the [Change log](#11-change-log) (newest first): date, type,
   what changed, commit if known.
2. If you added or changed a **button**, update section 6.
3. If you added a **component** or changed what it imports, update sections 4.2 and 5.
4. If you added a **color, font or size**, add it to `tokens.css` first, then section 8.
5. If you connected an **endpoint**, mark it done in section 7, update the
   button status in section 6, and remove the `demo` flag from the panel.
6. If you changed **map data files**, update `public/data/region3/SOURCES.md`.

Change types: `added`, `changed`, `fixed`, `removed`, `design`, `data`, `security`.

---

## 10. Known issues

| Issue | Where | Risk |
|---|---|---|
| Map data is static and public (`frontend/public/data/region3`, 6.7 MB) | `mapApi.js` | Fine for open data; team datasets must not go here (see 7.5) |
| OSM's public tile server is for light use only | `RegionMap.jsx` | Heavy demo traffic can get blocked; use a tile provider or self-host for production |
| OSM facility lists are incomplete; 53 facilities have no name | `hospitals/schools.geojson` | Under-counting; replace with DOH/DepEd data when available |
| Shapes are simplified for display | boundary files | Do not use them for area or distance calculations |
| Candidates have no real location | `mockDashboard.js` | Candidate list is demo only until `POST /api/analysis` exists |
| "Review readiness", "Scenario tools", "Preview view" are dead `#` links; event picker has no menu | Supply routing, Planning tools | Confusing for users |
| Planner state is set once from the data | `usePlannerState` | Stale choices if demo data reloads |
| Fonts load from Google Fonts without an integrity check, and visitor IPs go to Google | `index.html` | Privacy; looks different offline |
| `react`, `react-dom`, `vite` are still `"latest"` in `package.json`; CI runs `npm install` | `package.json`, CI | Supply-chain risk (Leaflet packages are pinned) |

---

## 11. Change log

Newest first.

### 2026-10-20 – Real Region III map

| Type | Change |
|---|---|
| data | Added Region III boundaries (PSA/NAMRIA via OCHA HDX) and OSM hospitals/schools as static GeoJSON in `public/data/region3/`, with `SOURCES.md` |
| added | Leaflet map (`RegionMap`) with OSM basemap, clickable province → city → barangay drill-down, hospital pins, school dots, safe popups |
| added | `mapApi.js` (each function names its future endpoint) and `useMapData` hook |
| added | Province / City / Barangay drop-downs replace the fake "San Isidro · Demo" button |
| added | Working search over provinces, cities, barangays and named facilities, with keyboard support; picking a facility zooms in and opens its popup |
| changed | LGU scope now drives the map; workspace heading shows the real area and counts |
| changed | Layers panel shows live hospital/school counts for the selected area; layers without data are disabled and marked "no data" |
| changed | Demo panels now show a `DEMO` badge (`PanelHeading demo`) |
| changed | Map toolbar: Compare removed (no catchments yet); "Clear drafts" added; Place facility pins use real coordinates |
| removed | Illustrative Figma map (artwork layers, building footprints, fake candidate pins, catchments, supply route, B-02 warning) and 4 unused icons |
| design | Map styles in brand teal: region outline `brand-900`, clickable areas `brand-500` fill, dashed muted siblings, DEMO badges in `warning` |
| fixed | Search and locality picker were not wired up |
| fixed | ⌘/Ctrl K label no longer uses the deprecated `navigator.platform` |
| fixed | Popup of a searched facility was closed by the area zoom; `FitToArea` now owns all camera moves |
| security | Popups and tooltips build DOM with `textContent` (OSM names are user-contributed); Leaflet and react-leaflet pinned to exact versions |

### 2026-10-18 – First version of the dashboard

| Type | Change | Commit |
|---|---|---|
| added | Tooling: `@` import alias, `package-lock.json`, dev-server launch config | `d57e997` |
| design | Design tokens from Figma (teal brand scale, neutrals, warning/danger, chart and map colors) | `6127a96` |
| design | Fonts Inter, IBM Plex Mono, Gantari; RESiLiA logo rebuilt in CSS | `6127a96` |
| added | Shared UI: Button, Badge, Panel, SegmentedControl, Icon, chart helpers | `6127a96` |
| added | 54 icons and 14 map layers exported from Figma | `3c930a9` |
| added | Demo data, `fetchDashboard()` API stub, `useDashboardData`, `usePlannerState` | `e269b32` |
| added | Full planning console page: header, scope bar, controls, map, insights, charts, footer | `bac9d33` |
| added | Responsive layout for tablet and phone | `bac9d33` |
| removed | Old starter screen and `src/styles.css` | `bac9d33` |
| fixed | Selected "< 15 min" option showed white text on a light background | `6127a96` (fixed before commit) |
| fixed | Info and bridge-warning icons were stretched 2 px taller than designed | `bac9d33` (fixed before commit) |
| fixed | Map toolbar title overlapped its buttons on phones | `bac9d33` (fixed before commit) |
