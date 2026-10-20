import { useState } from "react";

import AppHeader, { WORKSPACE_TABS } from "./components/AppHeader/AppHeader.jsx";
import CandidateSitesPanel from "./components/PlanningControls/CandidateSitesPanel.jsx";
import GapThresholdsPanel from "./components/PlanningControls/GapThresholdsPanel.jsx";
import SpatialLayersPanel from "./components/PlanningControls/SpatialLayersPanel.jsx";
import InvestmentPanel from "./components/ScenarioInsights/InvestmentPanel.jsx";
import ProjectHandoffPanel from "./components/ScenarioInsights/ProjectHandoffPanel.jsx";
import ScenarioImpactPanel from "./components/ScenarioInsights/ScenarioImpactPanel.jsx";
import SiteRationalePanel from "./components/ScenarioInsights/SiteRationalePanel.jsx";
import RegionMap from "./components/RegionMap/RegionMap.jsx";
import ScopeBar from "./components/ScopeBar/ScopeBar.jsx";
import SupplyRoutingPanel from "./components/SupplyRoutingPanel/SupplyRoutingPanel.jsx";
import CapacitySurgePanel from "./components/SurgeAnalytics/CapacitySurgePanel.jsx";
import PlanningToolsPanel from "./components/SurgeAnalytics/PlanningToolsPanel.jsx";
import TravelTimePanel from "./components/SurgeAnalytics/TravelTimePanel.jsx";
import { formatNumber } from "./format.js";
import { useDashboardData } from "./hooks/useDashboardData.js";
import { useMapData } from "./hooks/useMapData.js";
import { usePlannerState } from "./hooks/usePlannerState.js";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { status, data, error } = useDashboardData();

  if (status === "loading") {
    return <p className={styles.status}>Loading planning workspace…</p>;
  }
  if (status === "error") {
    return (
      <p className={styles.status} role="alert">
        Could not load the planning workspace: {error.message}
      </p>
    );
  }
  return <PlanningConsole data={data} />;
}

/** Breadcrumb for the workspace heading, from widest to narrowest area. */
function areaContext(mapData) {
  if (mapData.status !== "ready") return ["Loading Region III…"];
  const { region, provinces, municipalities, province, municipality, barangay } = mapData;
  if (barangay) return ["Region III", barangay.properties.province, barangay.properties.municipality, barangay.properties.name];
  if (municipality) {
    const p = municipality.properties;
    return ["Region III", p.province, p.name, `${formatNumber(p.barangay_count)} barangays`];
  }
  if (province) {
    const p = province.properties;
    return ["Region III", p.name, `${p.municipality_count} cities & municipalities`, `${formatNumber(p.barangay_count)} barangays`];
  }
  return [
    region.properties.name,
    `${provinces.length} provinces`,
    `${municipalities.length} cities & municipalities`,
    `${formatNumber(region.properties.barangay_count)} barangays`,
  ];
}

function PlanningConsole({ data }) {
  const [activeTab, setActiveTab] = useState("console");
  const planner = usePlannerState(data);
  const mapData = useMapData(planner.area);
  const context = areaContext(mapData);
  const { workspace } = data;
  const impactCandidate = data.candidates.find(
    (candidate) => candidate.id === data.impact.candidateId,
  );

  return (
    <div className={styles.page}>
      <header>
        <AppHeader activeTab={activeTab} onTabChange={setActiveTab} planner={data.planner} />
        <ScopeBar
          scopes={data.scopes}
          scope={planner.scope}
          onScopeChange={planner.setScope}
          scenarios={data.scenarios}
          scenario={planner.scenario}
          onScenarioChange={planner.setScenario}
          mapData={mapData}
          area={planner.area}
          onSelectArea={planner.selectArea}
          onFocusFacility={planner.setFocusedFacilityId}
        />
      </header>

      <main className={styles.workspace}>
        {activeTab === "console" ? (
          <>
            <div className={styles.heading}>
              <div className={styles.title}>
                <h1>{workspace.title}</h1>
                <span className={styles.scenarioStatus}>{workspace.scenarioStatus}</span>
              </div>
              <p className={styles.context}>
                {context.map((part, index) => (
                  <span key={part} className={styles.contextPart}>
                    {index > 0 && <span aria-hidden="true">/</span>}
                    {part}
                  </span>
                ))}
              </p>
            </div>

            <div className={styles.columns}>
              <div className={`${styles.column} ${styles.controls}`}>
                <SpatialLayersPanel
                  layers={data.layers}
                  layerState={planner.layers}
                  onToggleLayer={planner.toggleLayer}
                  counts={{
                    hospitals: mapData.facilities?.hospital.length,
                    schools: mapData.facilities?.school.length,
                  }}
                  vulnerability={data.vulnerability}
                  vulnerableGroups={planner.vulnerableGroups}
                  onToggleGroup={planner.toggleVulnerableGroup}
                />
                <GapThresholdsPanel
                  travelTimeOptions={data.thresholds.travelTimeOptions}
                  travelTime={planner.travelTime}
                  onTravelTimeChange={planner.setTravelTime}
                  capacityDeficit={planner.capacityDeficit}
                  onCapacityDeficitChange={planner.setCapacityDeficit}
                />
                <CandidateSitesPanel
                  className={styles.grow}
                  candidates={data.candidates}
                  selectedId={planner.selectedCandidate.id}
                  onSelect={planner.selectCandidate}
                />
              </div>

              <div className={`${styles.column} ${styles.mapColumn}`}>
                <RegionMap
                  mapData={mapData}
                  scope={planner.scope}
                  area={planner.area}
                  onSelectArea={planner.selectArea}
                  layers={planner.layers}
                  scenario={planner.activeScenario}
                  focusedFacilityId={planner.focusedFacilityId}
                />
                <SupplyRoutingPanel className={styles.grow} route={data.supplyRoute} />
              </div>

              <div className={`${styles.column} ${styles.insights}`}>
                <ScenarioImpactPanel impact={data.impact} candidate={impactCandidate} />
                <SiteRationalePanel rationale={data.rationale} />
                <InvestmentPanel investment={data.investment} />
                <ProjectHandoffPanel className={styles.grow} />
              </div>
            </div>

            <div className={styles.analytics}>
              <CapacitySurgePanel rows={data.capacitySurge} />
              <TravelTimePanel bins={data.travelTime} totalResidents={workspace.residentCount} />
              <PlanningToolsPanel
                tools={data.planningTools}
                horizon={planner.horizon}
                onHorizonChange={planner.setHorizon}
              />
            </div>
          </>
        ) : (
          <section className={styles.placeholder}>
            <h1>{WORKSPACE_TABS.find((tab) => tab.id === activeTab).label}</h1>
            <p>This workspace is not part of the demo yet.</p>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>{workspace.disclaimer}</p>
        <p className={styles.version}>{workspace.version}</p>
      </footer>
    </div>
  );
}
