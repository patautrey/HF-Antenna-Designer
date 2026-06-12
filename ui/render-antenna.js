export function renderAntenna({ name, module, json, diagram }) {
  const panel = document.getElementById("panel");

  const antennaName = json && json.name ? json.name : name;

  panel.innerHTML = `
    <h2>${antennaName}</h2>
    <div id="diagram"></div>

    <h3>Parameters</h3>
    <pre>${json ? JSON.stringify(json, null, 2) : "No JSON available for this antenna."}</pre>

    <h3>Module Output</h3>
    <pre>${JSON.stringify(module, null, 2)}</pre>
  `;

  if (diagram && typeof diagram.render === "function") {
    diagram.render(document.getElementById("diagram"));
  }
}
