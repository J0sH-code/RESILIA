import { useEffect, useRef, useState } from "react";

import cloudOffIcon from "@/assets/icons/cloud-off.svg";
import fileDownIcon from "@/assets/icons/file-down.svg";
import saveIcon from "@/assets/icons/save.svg";
import BrandLogo from "@/components/brand/BrandLogo.jsx";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import styles from "./AppHeader.module.css";

export const WORKSPACE_TABS = [
  { id: "console", label: "Planning console" },
  { id: "library", label: "Scenario library" },
  { id: "pipeline", label: "Project pipeline" },
];

export default function AppHeader({ activeTab, onTabChange, planner }) {
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef();

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const handleSave = () => {
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.bar}>
      <div className={styles.identity}>
        <BrandLogo />
        <p className={styles.tagline}>Geospatial infrastructure &amp; accessibility</p>
      </div>

      <nav className={styles.tabs} aria-label="Workspaces">
        {WORKSPACE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={styles.tab}
            aria-current={tab.id === activeTab ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <Badge tone="warning">DEMO DATA</Badge>
      <Button icon={saveIcon} onClick={handleSave} aria-live="polite">
        {saved ? "Scenario saved" : "Save scenario"}
      </Button>
      <Button icon={fileDownIcon} onClick={() => window.print()}>
        Export PDF briefing
      </Button>

      <p className={styles.syncStatus}>
        <Icon src={cloudOffIcon} />
        Gov sync: {planner.govSyncConnected ? "connected" : "not connected"}
      </p>

      <span className={styles.avatar} title="Planner profile">
        {planner.initials}
      </span>
    </div>
  );
}
