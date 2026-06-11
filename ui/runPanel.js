// HF-Antenna-Designer/ui/runPanel.js

import { panels } from "./panels/index.js";

export default function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    if (!PanelClass) {
        document.getElementById("panel").innerHTML =
            `<p style="color:red;">Unknown panel: ${panelName}</p>`;
        return;
    }

    const panel = new PanelClass(app);

    // Render panel HTML
    document.getElementById("panel").innerHTML = panel.render();

    // Attach all event handlers for that panel
    panel.attachEvents();
}
