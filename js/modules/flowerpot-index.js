/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Index Menu
   - Lists all Flowerpot modules
   - Provides navigation links
--------------------------------------------------------- */

export default function initFlowerpotIndex(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Tool Suite</h2>

            <ul class="tool-list">
                <li><a href="#flowerpot-coaxial">Flowerpot Coaxial (Main Calculator)</a></li>
                <li><a href="#flowerpot-diagram">Diagram Generator</a></li>
                <li><a href="#flowerpot-buildsheet">Build Sheet</a></li>
                <li><a href="#flowerpot-multiband">Multiband Designer</a></li>
                <li><a href="#flowerpot-performance">Performance Analyzer</a></li>
                <li><a href="#flowerpot-field">Field Planner</a></li>
                <li><a href="#flowerpot-height">Height Optimizer</a></li>
                <li><a href="#flowerpot-coaxloss">Coax Loss Calculator</a></li>
            </ul>
        </section>
    `;
}
