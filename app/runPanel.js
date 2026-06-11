// HF-Antenna-Designer/app/runPanel.js
// Corrected Panel Loader — FINAL VERSION

export default function runPanel(app, panelName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
        console.error(`runPanel: target element '${targetId}' not found`);
        return;
    }

    // FIXED: Panels live inside app.panels, not app
    const panelFn = app.panels?.[panelName];

    if (typeof panelFn !== "function") {
        target.innerHTML = `
            <div style="padding:1rem; color:red;">
                Error: Panel '${panelName}' is not registered.
            </div>
        `;
        return;
    }

    try {
        // Panels expect runSimulation to be passed in
        const html = panelFn(app.runSimulation);
        target.innerHTML = html;
    } catch (err) {
        target.innerHTML = `
            <div style="padding:1rem; color:red;">
                Panel '${panelName}' failed to render.<br>
                ${err.message}
            </div>
        `;
        console.error(err);
    }
}
