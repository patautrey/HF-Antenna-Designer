/* ---------------------------------------------------------
   HF Workbench — Sidebar Entries for Flowerpot Suite
--------------------------------------------------------- */

export function loadFlowerpotSidebar(sidebar) {

    sidebar.innerHTML += `
        <h3>Flowerpot Coaxial</h3>
        <ul>
            <li><a href="#flowerpot-index">Overview</a></li>
            <li><a href="#flowerpot-coaxial">Main Calculator</a></li>
            <li><a href="#flowerpot-diagram">Diagram</a></li>
            <li><a href="#flowerpot-buildsheet">Build Sheet</a></li>
            <li><a href="#flowerpot-multiband">Multiband</a></li>
            <li><a href="#flowerpot-performance">Performance</a></li>
            <li><a href="#flowerpot-field">Field Planner</a></li>
            <li><a href="#flowerpot-height">Height Optimizer</a></li>
            <li><a href="#flowerpot-coaxloss">Coax Loss</a></li>
        </ul>
    `;
}
