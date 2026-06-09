/* ---------------------------------------------------------
   HF Workbench — Flowerpot Landing Page
--------------------------------------------------------- */

export default function initFlowerpotLanding(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial Antenna Suite</h2>

            <p>The Flowerpot (T2LT) antenna is a coaxial sleeve vertical offering excellent performance, portability, and ease of construction.</p>

            <ul class="tool-list">
                <li><a href="#flowerpot-coaxial">Main Calculator</a></li>
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
