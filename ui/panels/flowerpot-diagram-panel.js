/* ============================================================
   Flowerpot (T2LT) Antenna — Diagram Panel
   ============================================================ */

import { FlowerpotDiagram } from "/ui/diagrams/flowerpot-diagram.js";

export default class FlowerpotDiagramPanel {

    constructor(app) {
        this.app = app;
    }

    render() {
        return `
        <div class="antenna-panel">
            <h2>Flowerpot (T2LT) — Build Diagram</h2>
            <div class="diagram-container">
                ${FlowerpotDiagram}
            </div>
        </div>
        `;
    }

    attachEvents() {
        // No events needed for static diagram
    }
}
