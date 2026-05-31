/* ---------------------------------------------------------
   HF Workbench — Router
   Loads the correct module into #content based on hash route.
--------------------------------------------------------- */

import initVerticalDX from "./modules/vertical-dx.js";
import initPerformer from "./modules/performer.js";
import initDominator from "./modules/dominator.js";
import initVerticalNVIS from "./modules/vertical-nvis.js";
import initNVISDesigner from "./modules/nvis-designer.js";

import initOCF from "./modules/ocf.js";
import initEFHW from "./modules/efhw.js";
import initRandomWire from "./modules/random-wire.js";
import initDoublet from "./modules/doublet.js";
import initHLoop from "./modules/hloop.js";
import initSkyloop from "./modules/skyloop.js";

const routes = {
    "#vertical-dx": initVerticalDX,
    "#performer": initPerformer,
    "#dominator": initDominator,
    "#vertical-nvis": initVerticalNVIS,
    "#nvis-designer": initNVISDesigner,

    "#ocf": initOCF,
    "#efhw": initEFHW,
    "#random-wire": initRandomWire,
    "#doublet": initDoublet,
    "#hloop": initHLoop,
    "#skyloop": initSkyloop
};

function loadRoute() {
    const hash = window.location.hash || "#vertical-dx";
    const loader = routes[hash];

    const content = document.querySelector("#content");
    if (!content) return;

    if (loader) {
        loader(content);
    } else {
        content.innerHTML = `
            <section class="tool">
                <h2>Unknown Tool</h2>
                <p>The requested tool does not exist.</p>
            </section>
        `;
    }
}

window.addEventListener("hashchange", loadRoute);
window.addEventListener("DOMContentLoaded", loadRoute);
