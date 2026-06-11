// app/runPanel.js
import panels from "../ui/panels/index.js";

export default function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    // MUST use "new"
    const panel = new PanelClass(app);

    document.getElementById("panel").innerHTML = panel.render();
    panel.attachEvents();
}
