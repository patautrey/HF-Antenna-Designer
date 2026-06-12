export function renderAntenna({ name, module, json, diagram }) {
  const panel = document.getElementById("panel");

  panel.innerHTML = `
    <h2>${json.name || name}</h2>
    <div id="diagram"></div>

    <h3>Parameters</h3>
    <pre>${JSON.stringify(json, null, 2)}</pre>

    <h3>Module Output</h3>
    <pre>${JSON.stringify(module, null, 2)}</pre>
  `;

  if (diagram && typeof diagram.render === "function") {
    diagram.render(document.getElementById("diagram"));
  }
}
