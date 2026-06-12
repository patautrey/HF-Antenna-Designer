import { renderNECEditor } from "./nec-editor.js";
import { validateNEC } from "../engine/nec-validator.js";
import { runNEC } from "../engine/nec2-wasm.js";
import { parseNECOutput } from "../engine/nec-parser.js";
import { renderPolarPlot, renderSWRPlot } from "./plot-engine.js";

export function renderAntenna({ name, necDeck }) {
  const panel = document.getElementById("panel");

  panel.innerHTML = `
    <h2>${name}</h2>
    <div id="necEditorContainer"></div>
    <h3>Simulation Output</h3>
    <div id="polar"></div>
    <div id="swr"></div>
  `;

  renderNECEditor(
    document.getElementById("necEditorContainer"),
    necDeck,
    async (deck) => {
      const errors = validateNEC(deck);
      if (errors.length) {
        document.getElementById("necErrors").innerText = errors.join("\n");
        return;
      }

      const rawOutput = await runNEC(deck);
      const parsed = parseNECOutput(rawOutput);

      renderPolarPlot(parsed.pattern, document.getElementById("polar"));
      renderSWRPlot(parsed.swr, document.getElementById("swr"));
    }
  );
}
