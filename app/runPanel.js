// HF-Antenna-Designer/app/runPanel.js
// Registry Mode — Full Replacement File

export default function runPanel(app, panelName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
        console.error(`runPanel: target element '${targetId}' not found`);
        return;
    }

    const panelFn = app[panelName];
    if (typeof panelFn !== "function") {
        target.innerHTML = `
            <div style="padding:1rem; color:red;">
                Error: Panel '${panelName}' is not registered.
            </div>
        `;
        return;
    }

    try {
        const html = panelFn();
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
