import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";

function App() {
  return (
    <main className="shell">
      <p className="eyebrow">RESILIA</p>
      <h1>Disaster-aware facility planning</h1>
      <p className="intro">
        A starter interface for exploring underserved communities, critical
        facilities, and resilient planning decisions.
      </p>
      <div className="status-card">
        <span className="status-dot" />
        Frontend is ready to connect to the FastAPI backend.
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
