// ui/runPanel.js
import panels from "./panels/index.js";

export function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    // FIX: must instantiate ES6 classes with "new"
    const panel = new PanelClass(app);

    // Render the panel UI
    document.getElementById("panel").innerHTML = panel.render();

    // Attach event handlers
    panel.attachEvents();
}
