import L from "leaflet";

import hospitalPinIcon from "@/assets/icons/hospital-pin.svg";

/*
 * Popup and tooltip content is built with DOM nodes and `textContent`, never
 * HTML strings: OSM names are user-contributed and must not be injected as HTML.
 */

const OSM_ID = /^(node|way|relation)\/\d+$/;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function boundaryTooltip(properties, hint) {
  const root = el("div");
  root.append(el("strong", null, properties.name));
  if (hint) root.append(el("div", "resilia-map-hint", hint));
  return root;
}

const KIND_LABEL = { hospital: "Hospital", school: "School" };

export function facilityPopup(properties) {
  const root = el("div", "resilia-map-popup");
  root.append(el("strong", null, properties.name || `Unnamed ${properties.kind}`));
  root.append(
    el(
      "div",
      null,
      [KIND_LABEL[properties.kind], properties.operator].filter(Boolean).join(" · "),
    ),
  );
  root.append(el("div", null, `${properties.municipality}, ${properties.province}`));
  if (OSM_ID.test(properties.osm_id)) {
    const link = el("a", null, "View on OpenStreetMap ↗");
    link.href = `https://www.openstreetmap.org/${properties.osm_id}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    root.append(link);
  }
  return root;
}

/** Hospital pin; only trusted, constant markup goes into `html`. */
export const hospitalIcon = (className, boxClassName) =>
  L.divIcon({
    className: boxClassName,
    html: `<span class="${className}"><img src="${hospitalPinIcon}" alt="" width="15" height="15"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12],
  });

export const draftIcon = (className, label) =>
  L.divIcon({
    className: "",
    html: `<span class="${className}">${label.replace(/[^\w]/g, "")}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

/** Reads a design token so canvas-drawn markers use the same colors as CSS. */
export function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
