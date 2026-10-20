import chevronDownIcon from "@/assets/icons/chevron-down-scope.svg";
import Icon from "@/components/ui/Icon.jsx";
import styles from "./ScopeBar.module.css";

const byName = (a, b) => a.properties.name.localeCompare(b.properties.name);

function Select({ label, value, onChange, children }) {
  return (
    <label className={styles.selectWrap}>
      <span className="visually-hidden">{label}</span>
      <select className={styles.select} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <Icon src={chevronDownIcon} className={styles.selectChevron} />
    </label>
  );
}

/** Province → municipality → barangay drop-downs that mirror the map selection. */
export default function LocalityPicker({ mapData, area, onSelectArea }) {
  if (mapData.status !== "ready") {
    return <span className={styles.pickerPlaceholder}>Loading areas…</span>;
  }

  const { provinces, areaMunicipalities, barangays, province, municipality } = mapData;

  return (
    <div className={styles.picker}>
      <Select
        label="Province"
        value={area.provincePcode ?? ""}
        onChange={(pcode) =>
          pcode ? onSelectArea({ provincePcode: pcode }, "provincial") : onSelectArea({}, "regional")
        }
      >
        <option value="">Region III · all provinces</option>
        {[...provinces].sort(byName).map((f) => (
          <option key={f.properties.pcode} value={f.properties.pcode}>
            {f.properties.name}
          </option>
        ))}
      </Select>

      {province && (
        <Select
          label="City or municipality"
          value={area.municipalityPcode ?? ""}
          onChange={(pcode) =>
            onSelectArea(
              pcode ? { provincePcode: area.provincePcode, municipalityPcode: pcode } : { provincePcode: area.provincePcode },
              pcode ? "municipal" : "provincial",
            )
          }
        >
          <option value="">All of {province.properties.name}</option>
          {[...areaMunicipalities].sort(byName).map((f) => (
            <option key={f.properties.pcode} value={f.properties.pcode}>
              {f.properties.name}
            </option>
          ))}
        </Select>
      )}

      {municipality && barangays.length > 0 && (
        <Select
          label="Barangay"
          value={area.barangayPcode ?? ""}
          onChange={(pcode) =>
            onSelectArea(
              { provincePcode: area.provincePcode, municipalityPcode: area.municipalityPcode, barangayPcode: pcode || null },
              pcode ? "barangay" : "municipal",
            )
          }
        >
          <option value="">All barangays</option>
          {[...barangays].sort(byName).map((f) => (
            <option key={f.properties.pcode} value={f.properties.pcode}>
              {f.properties.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
