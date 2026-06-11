// app/runPanel.js
import { panels } from "../ui/panels/index.js";

export default function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    // Instantiate the panel class
    const panel = new PanelClass(app);

    // Render the panel UI
    document.getElementById("panel").innerHTML = panel.render();

    // Attach event handlers
    panel.attachEvents();
}
