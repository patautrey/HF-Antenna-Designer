// ui/runPanel.js
import panels from "./panels/index.js";

export function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    // IMPORTANT: must use "new" for ES6 classes
    const panel = new PanelClass(app);

    // Render panel UI
    document.getElementById("panel").innerHTML = panel.render();

    // Attach event handlers
    panel.attachEvents();
}
