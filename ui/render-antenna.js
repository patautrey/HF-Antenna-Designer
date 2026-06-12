export function renderAntenna({ name, json, diagram, output }) {
  const panel = document.getElementById("panel");

  const antennaName = json?.name || name;

  panel.innerHTML = `
    <h2>${antennaName}</h2>
    <div id="diagram"></div>

    <h3>Parameters</h3>
    <pre>${json ? JSON.stringify(json, null, 2) : "No JSON available for this antenna."}</pre>

    <h3>Calculation Output</h3>
    <pre>${output ? JSON.stringify(output, null, 2) : "No calculation returned."}</pre>
  `;

  if (diagram && typeof diagram.render === "function") {
    diagram.render(document.getElementById("diagram"));
  }
}
