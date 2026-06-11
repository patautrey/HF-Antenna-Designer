import panels from "./panels/index.js";

export function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    // FIXED: must use "new"
    const panel = new PanelClass(app);

    document.getElementById("panel").innerHTML = panel.render();
    panel.attachEvents();
}
