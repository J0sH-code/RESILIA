import { useCallback, useMemo, useState } from "react";

/** Local, in-browser planner selections seeded from the dashboard data. */
export function usePlannerState(data) {
  const [scope, setScope] = useState("municipal");
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
  const [popupOpen, setPopupOpen] = useState(true);
  const [horizon, setHorizon] = useState(data.planningTools.horizon);

  const toggleLayer = useCallback(
    (id) => setLayers((current) => ({ ...current, [id]: !current[id] })),
    [],
  );
  const toggleVulnerableGroup = useCallback(
    (id) => setVulnerableGroups((current) => ({ ...current, [id]: !current[id] })),
    [],
  );
  const selectCandidate = useCallback((id) => {
    setSelectedCandidateId(id);
    setPopupOpen(true);
  }, []);

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
    selectCandidate,
    popupOpen,
    setPopupOpen,
    horizon,
    setHorizon,
  };
}
