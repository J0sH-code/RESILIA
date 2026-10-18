/**
 * Demo dataset for the planning console, transcribed from the RESILIA Figma
 * dashboard. Everything here is synthetic. Map coordinates are pixels on the
 * 944 × 530 illustrative map canvas, not real geography.
 *
 * Keep this shape stable: it is the contract a future FastAPI
 * `/api/dashboard` endpoint is expected to return (see ../api/dashboardApi.js).
 */
export const mockDashboard = {
  workspace: {
    title: "Spatial accessibility planner",
    scenarioStatus: "DRAFT SCENARIO · 04",
    municipality: "Illustrative municipality",
    barangayCount: 12,
    residentCount: 50000,
    locality: "San Isidro · Demo",
    version: "RESILIA / PLANNING PREVIEW 1.0",
    disclaimer:
      "DEMO WORKSPACE — Synthetic geography, facility inventory and model outputs. Not for operational dispatch or investment approval.",
  },

  planner: { initials: "MP", govSyncConnected: false },

  scopes: [
    { value: "barangay", label: "Barangay" },
    { value: "municipal", label: "Municipal" },
    { value: "provincial", label: "Provincial" },
    { value: "regional", label: "Regional" },
  ],

  scenarios: [
    { value: "dry", label: "Normal dry conditions", mapBadge: "DRY CONDITIONS", flooding: false },
    { value: "flood-100", label: "100-year flood event", mapBadge: "100-YEAR FLOOD", flooding: true },
    { value: "earthquake", label: "Earthquake hazard", mapBadge: "EARTHQUAKE", flooding: false },
  ],

  layers: [
    { id: "hospitals", label: "Hospitals", meta: "03", enabled: true },
    { id: "evacuation", label: "Evacuation centers", meta: "08", enabled: true },
    { id: "schools", label: "Schools", meta: "14", enabled: true },
    { id: "flood", label: "Flood hazard", meta: "100 yr", enabled: true },
    { id: "landslide", label: "Landslide hazard", meta: "—", enabled: false },
    { id: "earthquake", label: "Earthquake hazard", meta: "—", enabled: false },
    { id: "population", label: "Population density", meta: "/ km²", enabled: true },
    { id: "roads", label: "Road network", meta: "126 km", enabled: true },
  ],

  vulnerability: {
    groups: [
      { id: "seniors", label: "Seniors", enabled: true },
      { id: "infants", label: "Infants", enabled: true },
      { id: "pwd", label: "PWD", enabled: true },
    ],
    priorityResidents: 7840,
  },

  thresholds: {
    travelTimeOptions: [
      { value: "15", label: "< 15 min" },
      { value: "30", label: "< 30 min" },
      { value: "custom", label: "Custom" },
    ],
    travelTime: "15",
    capacityDeficitPercent: 20,
  },

  // Only candidate 01 has modeled simulation outputs (catchments, impact,
  // investment). Details for candidates 02–03 are placeholder demo values.
  candidates: [
    {
      id: "candidate-01",
      rank: 1,
      name: "Mabini upland lot",
      residentsCovered: 9000,
      score: 92,
      facility: "Proposed evacuation center",
      capacity: 600,
      areaHa: 1.8,
      hazardNote: "outside modeled flood extent",
      pin: { x: 412, y: 246 },
      simulated: true,
    },
    {
      id: "candidate-02",
      rank: 2,
      name: "San Roque annex",
      residentsCovered: 6200,
      score: 86,
      facility: "Proposed evacuation center",
      capacity: 450,
      areaHa: 1.1,
      hazardNote: "outside modeled flood extent",
      pin: { x: 255, y: 129 },
      simulated: false,
    },
    {
      id: "candidate-03",
      rank: 3,
      name: "Maligaya civic lot",
      residentsCovered: 4800,
      score: 81,
      facility: "Proposed evacuation center",
      capacity: 380,
      areaHa: 0.9,
      hazardNote: "near flood extent fringe",
      pin: { x: 785, y: 334 },
      simulated: false,
    },
  ],

  existingFacilities: [
    { id: "evac-santa-elena", type: "evacuation", x: 357, y: 428 },
    { id: "evac-riverside", type: "evacuation", x: 740, y: 406 },
    { id: "hospital-maligaya", type: "hospital", x: 820, y: 196 },
    { id: "school-poblacion", type: "school", x: 123, y: 382 },
    { id: "evac-upland", type: "evacuation", x: 423, y: 140 },
    { id: "school-san-roque", type: "school", x: 327, y: 100 },
    { id: "evac-mabini", type: "evacuation", x: 219, y: 229 },
    { id: "hospital-district", type: "hospital", x: 136, y: 141 },
  ],

  mapLabels: [
    { text: "San Isidro River", x: 643, y: 155, kind: "river" },
    { text: "Upland road", x: 358, y: 105, kind: "road" },
    { text: "SANTA ELENA", x: 259, y: 463, kind: "barangay" },
    { text: "RIVERSIDE", x: 648, y: 424, kind: "flood" },
    { text: "MALIGAYA", x: 749, y: 270, kind: "barangay" },
    { text: "POBLACION", x: 80, y: 282, kind: "barangay" },
    { text: "MABINI", x: 328, y: 177, kind: "barangay" },
    { text: "SAN ROQUE", x: 158, y: 65, kind: "barangay" },
  ],

  impact: {
    candidateId: "candidate-01",
    coverage: {
      thresholdMinutes: 15,
      before: 62,
      after: 80,
      peopleBefore: 31000,
      peopleAfter: 40000,
    },
    metrics: [
      { label: "Underserved barangays", before: 7, after: 3, change: "−4" },
      { label: "Capacity deficit · places", before: 1200, after: 600, change: "−600" },
      { label: "Avg. emergency · min", before: 28, after: 16, change: "−12 min" },
    ],
  },

  rationale: {
    summary:
      "Mabini connects four underserved barangays to the upland road. The parcel is outside the modeled flood extent and adds 600 evacuation places.",
    factors: [
      { label: "Access", weight: 45 },
      { label: "Safety", weight: 35 },
      { label: "Capacity", weight: 20 },
    ],
    reviewNote: "Verify land tenure and hazard survey before approval.",
  },

  investment: {
    currency: "PHP",
    uncertaintyPercent: 30,
    items: [
      { label: "Acquisition", amount: 2_400_000, footnote: 1 },
      { label: "Land", amount: 10_200_000 },
      { label: "Construction", amount: 36_000_000 },
    ],
    beneficiaries: 9000,
    footnote: "Transaction & acquisition fees, excluding land purchase.",
  },

  supplyRoute: {
    from: "District depot",
    to: "Mabini site",
    minutes: 18,
    distanceKm: 6.4,
    restrictions: [
      { label: "B-01: 10 t limit", tone: "neutral" },
      { label: "Truck: 6 t", tone: "neutral" },
      { label: "B-02 flooded: avoid", tone: "danger" },
    ],
    note: "Uses passable upland road · bridge load checked in demo model",
    shortages: [
      [
        { label: "Doctors", count: 2 },
        { label: "Nurses", count: 6 },
        { label: "Volunteers", count: 18 },
      ],
      [
        { label: "Generators", count: 2 },
        { label: "Water purification units", count: 1 },
        { label: "ICU beds", count: 4 },
      ],
    ],
  },

  capacitySurge: [
    { barangay: "Mabini", demand: 900, existing: 300, withCandidate: 900 },
    { barangay: "San Roque", demand: 700, existing: 400, withCandidate: 400 },
    { barangay: "Maligaya", demand: 620, existing: 350, withCandidate: 350 },
    { barangay: "Santa Elena", demand: 480, existing: 450, withCandidate: 450 },
  ],

  travelTime: [
    { label: "0–15 min", before: 31000, after: 40000 },
    { label: "15–30 min", before: 11500, after: 7500 },
    { label: ">30 min", before: 7500, after: 2500 },
  ],

  planningTools: {
    replayEvent: "Demo flood · 2020",
    horizons: [
      { value: "25", label: "25-year" },
      { value: "50", label: "50-year" },
      { value: "100", label: "100-year" },
    ],
    horizon: "100",
    citizenView: {
      title: "Citizen Emergency View",
      description: "Nearby open centers, occupancy & safe routes",
      sample: "Mabini school · demo open · 180 / 300 places · 1.2 km",
      note: "Cached demo snapshot · not a live emergency advisory",
    },
  },
};
