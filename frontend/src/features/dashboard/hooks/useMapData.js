import { useEffect, useMemo, useState } from "react";

import {
  fetchBarangays,
  fetchFacilities,
  fetchMunicipalities,
  fetchProvinces,
  fetchRegion,
} from "../api/mapApi.js";

const EMPTY = { type: "FeatureCollection", features: [] };

/** Keeps only features inside the selected province / municipality. */
function inArea(features, area) {
  return features.filter(
    (feature) =>
      (!area.provincePcode || feature.properties.province_pcode === area.provincePcode) &&
      (!area.municipalityPcode || feature.properties.municipality_pcode === area.municipalityPcode),
  );
}

/**
 * Loads Region III boundaries and facilities, plus the barangays of the
 * selected municipality, and derives what the current area contains.
 */
export function useMapData(area) {
  const [base, setBase] = useState({ status: "loading", error: null });
  const [barangays, setBarangays] = useState({ pcode: null, data: EMPTY });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchRegion(),
      fetchProvinces(),
      fetchMunicipalities(),
      fetchFacilities("hospital"),
      fetchFacilities("school"),
    ])
      .then(([region, provinces, municipalities, hospitals, schools]) => {
        if (!cancelled) {
          setBase({ status: "ready", error: null, region, provinces, municipalities, hospitals, schools });
        }
      })
      .catch((error) => {
        if (!cancelled) setBase({ status: "error", error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { municipalityPcode } = area;
  useEffect(() => {
    if (!municipalityPcode) return undefined;
    let cancelled = false;
    fetchBarangays(municipalityPcode)
      .then((data) => {
        if (!cancelled) setBarangays({ pcode: municipalityPcode, data });
      })
      .catch(() => {
        if (!cancelled) setBarangays({ pcode: municipalityPcode, data: EMPTY });
      });
    return () => {
      cancelled = true;
    };
  }, [municipalityPcode]);

  // Kept separate so facility markers are not rebuilt when barangays load
  // (rebuilding closes any open facility popup).
  const { provincePcode } = area;
  const facilities = useMemo(() => {
    if (base.status !== "ready") return null;
    const scope = { provincePcode, municipalityPcode };
    return {
      hospital: inArea(base.hospitals.features, scope),
      school: inArea(base.schools.features, scope),
    };
  }, [base, provincePcode, municipalityPcode]);

  const allFacilities = useMemo(
    () => (base.status === "ready" ? [...base.hospitals.features, ...base.schools.features] : []),
    [base],
  );

  return useMemo(() => {
    if (base.status !== "ready") return { status: base.status, error: base.error };

    const byPcode = (collection, pcode) =>
      pcode ? collection.features.find((feature) => feature.properties.pcode === pcode) : null;

    const barangayFeatures =
      municipalityPcode && barangays.pcode === municipalityPcode ? barangays.data.features : [];

    return {
      status: "ready",
      region: base.region.features[0],
      provinces: base.provinces.features,
      municipalities: base.municipalities.features,
      areaMunicipalities: area.provincePcode
        ? base.municipalities.features.filter((f) => f.properties.province_pcode === area.provincePcode)
        : [],
      barangays: barangayFeatures,
      barangaysLoading: Boolean(municipalityPcode) && barangays.pcode !== municipalityPcode,
      province: byPcode(base.provinces, area.provincePcode),
      municipality: byPcode(base.municipalities, area.municipalityPcode),
      barangay: area.barangayPcode
        ? barangayFeatures.find((feature) => feature.properties.pcode === area.barangayPcode) ?? null
        : null,
      facilities,
      allFacilities,
    };
  }, [base, barangays, area, municipalityPcode, facilities, allFacilities]);
}
