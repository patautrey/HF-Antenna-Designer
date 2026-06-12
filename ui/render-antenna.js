import { renderParamsForm } from "./render-params.js";
import { validateNEC } from "../engine/nec-validator.js";
import { runNEC } from "../engine/nec2-wasm.js";
import { parseNECOutput } from "../engine/nec-parser.js";
import { renderPolarPlot, renderSWRPlot } from "./plot-engine.js";

export function renderAntenna(antenna) {
  const panel = document.getElementById("panel");

  panel.innerHTML = `
    <h2>${antenna.label}</h2>
    <div id="params"></div>
    <h3>NEC Input Deck</h3>
    <textarea id="necDeck" style="width:100%;height:250px;font-family:monospace;"></textarea>
    <button id="runNEC">Run Simulation</button>
    <pre id="necErrors" style="color:red;"></pre>
    <h3>Simulation Output</h3>
    <div id="polar"></div>
    <div id="swr"></div>
  `;

  let params = {};
  for (const key in antenna.paramsSchema) {
    params[key] = antenna.paramsSchema[key].default;
  }

  function updateDeck() {
    const deck = antenna.generateDeck(params);
    document.getElementById("necDeck").value = deck;
  }

  renderParamsForm(
    document.getElementById("params"),
    antenna.paramsSchema,
    params,
    (newParams) => {
      params = newParams;
      updateDeck();
    }
  );

  updateDeck();

  document.getElementById("runNEC").onclick = async () => {
    const deck = document.getElementById("necDeck").value;
    const errors = validateNEC(deck);

    if (errors.length) {
      document.getElementById("necErrors").innerText = errors.join("\n");
      return;
    }

    const raw = await runNEC(deck);
    const parsed = parseNECOutput(raw);

    renderPolarPlot(parsed.pattern, document.getElementById("polar"));
    renderSWRPlot(parsed.swr, document.getElementById("swr"));
  };
}
