// app/runPanel.js
import { panels } from "../ui/panels/index.js";

export default function runPanel(app, panelName) {
    const PanelClass = panels[panelName];

    if (!PanelClass) {
        document.getElementById("panel").innerHTML =
            `<p style="color:red;">Unknown panel: ${panelName}</p>`;
        return;
    }

    const panel = new PanelClass(app);

    document.getElementById("panel").innerHTML = panel.render();
    panel.attachEvents();
}
