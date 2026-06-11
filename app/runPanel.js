export default function runPanel(app, panelName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const key = panelName.toLowerCase();
    const panelFn = app.panels[key];

    if (!panelFn) {
        target.innerHTML = `<div style="color:red;">Panel '${panelName}' not found.</div>`;
        return;
    }

    try {
        target.innerHTML = panelFn(app.runSimulation);
    } catch (err) {
        target.innerHTML = `<div style="color:red;">${err.message}</div>`;
    }
}
