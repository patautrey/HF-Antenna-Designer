/* ============================================================
   Panel Loader
   ============================================================ */

import { PANEL_MAP } from "/ui/panels/index.js";

export function runPanel(app, panelName, targetId) {
    const PanelClass = PANEL_MAP[panelName];
    if (!PanelClass) return;

    const panel = new PanelClass(app);
    document.getElementById(targetId).innerHTML = panel.render();
    panel.attachEvents();
}
