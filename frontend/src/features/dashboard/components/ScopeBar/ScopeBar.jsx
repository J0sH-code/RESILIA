import { useEffect, useRef } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down-scope.svg";
import mapPinIcon from "@/assets/icons/map-pin-scope.svg";
import searchIcon from "@/assets/icons/search.svg";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import SegmentedControl from "@/components/ui/SegmentedControl.jsx";
import styles from "./ScopeBar.module.css";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function ScopeBar({
  scopes,
  scope,
  onScopeChange,
  scenarios,
  scenario,
  onScenarioChange,
  locality,
}) {
  const searchRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <Icon src={mapPinIcon} />
        <span className={styles.label} id="lgu-scope-label">
          LGU SCOPE
        </span>
        <SegmentedControl
          label="LGU scope"
          options={scopes}
          value={scope}
          onChange={onScopeChange}
        />
        <Button size="sm" icon={chevronDownIcon} aria-haspopup="listbox">
          {locality}
        </Button>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>SCENARIO</span>
        <SegmentedControl
          label="Hazard scenario"
          options={scenarios}
          value={scenario}
          onChange={onScenarioChange}
        />
      </div>

      <label className={styles.search}>
        <Icon src={searchIcon} />
        <span className="visually-hidden">Search place or facility</span>
        <input
          ref={searchRef}
          type="search"
          className={styles.searchInput}
          placeholder="Search place or facility"
        />
        <kbd className={styles.shortcut}>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
      </label>
    </div>
  );
}
