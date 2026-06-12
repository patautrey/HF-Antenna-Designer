import { 
  renderPolarPlot, 
  renderSWRPlot, 
  renderLengthPlot 
} from "./plot-engine.js";

export function renderAntenna({ name, json, diagram, output }) {
  const panel = document.getElementById("panel");

  const antennaName = json?.name || name;

  panel.innerHTML = `
    <h2>${antennaName}</h2>

    <!-- Diagram -->
    <div id="diagram" style="margin-bottom:20px;"></div>

    <!-- Parameters -->
    <h3>Parameters</h3>
    ${json ? renderParamsTable(json) : "<p>No JSON available for this antenna.</p>"}

    <!-- Calculation Output -->
    <h3>Calculation Output</h3>
    ${output ? renderCalcTable(output) : "<p>No calculation returned.</p>"}

    <!-- Radiation Pattern -->
    <h3>Radiation Pattern</h3>
    <div id="polar"></div>

    <!-- SWR Curve -->
    <h3>SWR Curve</h3>
    <div id="swr"></div>

    <!-- Length vs Frequency -->
    <h3>Length vs Frequency</h3>
    <div id="length"></div>
  `;

  // Render diagram if available
  if (diagram && typeof diagram.render === "function") {
    diagram.render(document.getElementById("diagram"));
  }

  // Render plots if data exists
  if (output?.pattern) {
    renderPolarPlot(output.pattern, document.getElementById("polar"));
  }

  if (output?.swr) {
    renderSWRPlot(output.swr, document.getElementById("swr"));
  }

  if (output?.lengthSweep) {
    renderLengthPlot(output.lengthSweep, document.getElementById("length"));
  }
}



// ------------------------------------------------------------
// TABLE RENDERERS
// ------------------------------------------------------------

function renderParamsTable(json) {
  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><th colspan="2">Antenna Parameters</th></tr>
      <tr><td><b>Name</b></td><td>${json.name}</td></tr>
      <tr><td><b>Description</b></td><td>${json.description}</td></tr>
      <tr><td><b>Image Queries</b></td><td>${json.imageQueries.join(", ")}</td></tr>
      <tr><td><b>Modeling Notes</b></td><td>${json.modelingNotes.join("<br>")}</td></tr>
    </table>
  `;
}


function renderCalcTable(output) {
  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><th colspan="2">Calculation Output</th></tr>
      <tr><td><b>Success</b></td><td>${output.success}</td></tr>
      <tr><td><b>Frequency (MHz)</b></td><td>${output.frequencyMHz}</td></tr>
      ${renderCalcRows(output.calculated)}
      <tr><td><b>Notes</b></td><td>${output.notes.join("<br>")}</td></tr>
    </table>
  `;
}


function renderCalcRows(calculated) {
  return Object.entries(calculated)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
      return `<tr><td><b>${label}</b></td><td>${value}</td></tr>`;
    })
    .join("");
}
