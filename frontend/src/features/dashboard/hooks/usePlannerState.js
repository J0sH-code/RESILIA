import { useCallback, useMemo, useState } from "react";

/** Scope levels from widest to narrowest, and the area field each one needs. */
export const SCOPE_LEVELS = ["regional", "provincial", "municipal", "barangay"];
const AREA_KEYS = { provincial: "provincePcode", municipal: "municipalityPcode", barangay: "barangayPcode" };

const EMPTY_AREA = { provincePcode: null, municipalityPcode: null, barangayPcode: null };

/** Clears the parts of `area` narrower than `scope`. */
function trimArea(area, scope) {
  const depth = SCOPE_LEVELS.indexOf(scope);
  return Object.fromEntries(
    Object.entries(AREA_KEYS).map(([level, key]) => [
      key,
      SCOPE_LEVELS.indexOf(level) <= depth ? area[key] : null,
    ]),
  );
}

/** Local, in-browser planner selections seeded from the dashboard data. */
export function usePlannerState(data) {
  const [scope, setScopeState] = useState("regional");
  const [area, setArea] = useState(EMPTY_AREA);
  const [scenario, setScenario] = useState("flood-100");
  const [layers, setLayers] = useState(() =>
    Object.fromEntries(data.layers.map((layer) => [layer.id, layer.enabled])),
  );
  const [vulnerableGroups, setVulnerableGroups] = useState(() =>
    Object.fromEntries(data.vulnerability.groups.map((group) => [group.id, group.enabled])),
  );
  const [travelTime, setTravelTime] = useState(data.thresholds.travelTime);
  const [capacityDeficit, setCapacityDeficit] = useState(
    data.thresholds.capacityDeficitPercent,
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState(data.candidates[0].id);
  const [focusedFacilityId, setFocusedFacilityId] = useState(null);
  const [horizon, setHorizon] = useState(data.planningTools.horizon);

  /** Changing the scope keeps wider selections and drops narrower ones. */
  const setScope = useCallback((nextScope) => {
    setScopeState(nextScope);
    setArea((current) => trimArea(current, nextScope));
  }, []);

  /** Selects an area and moves the scope to its level. */
  const selectArea = useCallback((nextArea, level) => {
    setArea(trimArea({ ...EMPTY_AREA, ...nextArea }, level));
    setScopeState(level);
    setFocusedFacilityId(null);
  }, []);

  const toggleLayer = useCallback(
    (id) => setLayers((current) => ({ ...current, [id]: !current[id] })),
    [],
  );
  const toggleVulnerableGroup = useCallback(
    (id) => setVulnerableGroups((current) => ({ ...current, [id]: !current[id] })),
    [],
  );

  const activeScenario = useMemo(
    () => data.scenarios.find((option) => option.value === scenario),
    [data.scenarios, scenario],
  );
  const selectedCandidate = useMemo(
    () => data.candidates.find((candidate) => candidate.id === selectedCandidateId),
    [data.candidates, selectedCandidateId],
  );

  return {
    scope,
    setScope,
    area,
    selectArea,
    scenario,
    setScenario,
    activeScenario,
    layers,
    toggleLayer,
    vulnerableGroups,
    toggleVulnerableGroup,
    travelTime,
    setTravelTime,
    capacityDeficit,
    setCapacityDeficit,
    selectedCandidate,
    selectCandidate: setSelectedCandidateId,
    focusedFacilityId,
    setFocusedFacilityId,
    horizon,
    setHorizon,
  };
}
