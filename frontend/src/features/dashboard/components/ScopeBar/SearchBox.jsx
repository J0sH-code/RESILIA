import { useEffect, useId, useMemo, useRef, useState } from "react";

import searchIcon from "@/assets/icons/search.svg";
import Icon from "@/components/ui/Icon.jsx";
import { fetchBarangayIndex } from "../../api/mapApi.js";
import styles from "./ScopeBar.module.css";

const MAX_RESULTS = 8;
const TYPE_LABEL = {
  province: "Province",
  municipality: "City / municipality",
  barangay: "Barangay",
  hospital: "Hospital",
  school: "School",
};

/** Lower-case and strip accents so "penaranda" finds "Peñaranda". */
const normalize = (text) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const isMac = () => {
  const platform = navigator.userAgentData?.platform ?? navigator.userAgent;
  return /mac|iphone|ipad/i.test(platform);
};

/**
 * Client-side search over provinces, municipalities, barangays and named
 * facilities. Future: GET /api/search?q= returns the same result shape.
 */
export default function SearchBox({ mapData, onSelectArea, onFocusFacility }) {
  const inputRef = useRef(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [barangayIndex, setBarangayIndex] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const loadBarangays = () => {
    if (!barangayIndex) fetchBarangayIndex().then(setBarangayIndex).catch(() => setBarangayIndex([]));
  };

  /** Search entries built once per data load: { type, label, sub, key, select }. */
  const entries = useMemo(() => {
    if (mapData.status !== "ready") return [];
    const municipalityByPcode = new Map(mapData.municipalities.map((f) => [f.properties.pcode, f.properties]));
    const list = [];
    for (const { properties: p } of mapData.provinces) {
      list.push({ type: "province", label: p.name, sub: "Region III", key: p.pcode,
        select: () => onSelectArea({ provincePcode: p.pcode }, "provincial") });
    }
    for (const { properties: p } of mapData.municipalities) {
      list.push({ type: "municipality", label: p.name, sub: p.province, key: p.pcode,
        select: () => onSelectArea({ provincePcode: p.province_pcode, municipalityPcode: p.pcode }, "municipal") });
    }
    for (const [pcode, name, municipalityPcode] of barangayIndex ?? []) {
      const m = municipalityByPcode.get(municipalityPcode);
      if (!m) continue;
      list.push({ type: "barangay", label: name, sub: `${m.name}, ${m.province}`, key: pcode,
        select: () => onSelectArea(
          { provincePcode: m.province_pcode, municipalityPcode, barangayPcode: pcode }, "barangay") });
    }
    for (const { properties: p } of mapData.allFacilities) {
      if (!p.name) continue;
      list.push({ type: p.kind, label: p.name, sub: `${p.municipality}, ${p.province}`, key: p.osm_id,
        select: () => {
          onSelectArea({ provincePcode: p.province_pcode, municipalityPcode: p.municipality_pcode }, "municipal");
          onFocusFacility(p.osm_id);
        } });
    }
    return list.map((entry) => ({ ...entry, haystack: normalize(entry.label) }));
  }, [mapData, barangayIndex, onSelectArea, onFocusFacility]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    const starts = [];
    const contains = [];
    for (const entry of entries) {
      if (entry.haystack.startsWith(q)) starts.push(entry);
      else if (entry.haystack.includes(q)) contains.push(entry);
      if (starts.length >= MAX_RESULTS) break;
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [entries, query]);

  const choose = (entry) => {
    entry.select();
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length >= 2;

  return (
    <div className={styles.searchWrap}>
      <label className={styles.search}>
        <Icon src={searchIcon} />
        <span className="visually-hidden">Search place or facility</span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
          className={styles.searchInput}
          placeholder="Search province, city, barangay or facility"
          value={query}
          onFocus={() => {
            loadBarangays();
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <kbd className={styles.shortcut}>{isMac() ? "⌘ K" : "Ctrl K"}</kbd>
      </label>

      {showList && (
        <ul className={styles.results} id={listId} role="listbox">
          {results.length === 0 && <li className={styles.noResults}>No matches in Region III</li>}
          {results.map((entry, index) => (
            <li
              key={`${entry.type}-${entry.key}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={styles.result}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(entry)}
            >
              <span className={styles.resultLabel}>{entry.label}</span>
              <span className={styles.resultMeta}>
                {TYPE_LABEL[entry.type]} · {entry.sub}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
