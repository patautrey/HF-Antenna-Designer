/* ---------------------------------------------------------
   HF Workbench — Verticals Menu Router
   Loads the correct vertical module into #content
--------------------------------------------------------- */

import initVerticalDX from "./vertical-dx-designer.js";
import initVerticalNVIS from "./vertical-nvis.js";
import initVerticalNVISDesigner from "./vertical-nvis-designer.js";
import initPerformer from "./performer.js";
import initDominator from "./dominator.js";

export default function initVerticals(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical Antenna Tools</h2>

            <div class="menu-list">
                <button class="vbtn" data-view="vertical-dx">Vertical DX Designer</button>
                <button class="vbtn" data-view="vertical-nvis">Vertical NVIS</button>
                <button class="vbtn" data-view="vertical-nvis-designer">Vertical NVIS Designer</button>
                <button class="vbtn" data-view="performer">Performer Vertical</button>
                <button class="vbtn" data-view="dominator">Dominator Array</button>
            </div>

            <div id="vertical-output" style="margin-top:1rem;"></div>
        </section>
    `;

    const output = document.getElementById("vertical-output");

    function loadModule(name) {
        output.innerHTML = ""; // clear previous module

        switch (name) {
            case "vertical-dx":
                initVerticalDX(output);
                break;

            case "vertical-nvis":
                initVerticalNVIS(output);
                break;

            case "vertical-nvis-designer":
                initVerticalNVISDesigner(output);
                break;

            case "performer":
                initPerformer(output);
                break;

            case "dominator":
                initDominator(output);
                break;

            default:
                output.innerHTML = `<p>Unknown module: ${name}</p>`;
        }
    }

    // Attach handlers
    document.querySelectorAll(".vbtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.getAttribute("data-view");
            loadModule(view);
        });
    });
}
