import { mockDashboard } from "../data/mockDashboard.js";

/**
 * Loads the planning console data.
 *
 * Returns the bundled demo dataset for now. When the backend exposes a
 * dashboard endpoint, replace the body with:
 *   const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`);
 *   if (!response.ok) throw new Error(`Dashboard request failed: ${response.status}`);
 *   return response.json();
 */
export async function fetchDashboard() {
  return structuredClone(mockDashboard);
}
