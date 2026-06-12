export default function runPanel(app, panelName) {
    const panelDiv = document.getElementById("panel");

    if (!app.panels[panelName]) {
        panelDiv.innerHTML = `<p style="color:red;">Panel not found: ${panelName}</p>`;
        return;
    }

    panelDiv.innerHTML = app.panels[panelName]();
}
