export default function runPanel(app, panelName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const key = panelName.toLowerCase();
    const panelFn = app.panels[key];

    if (!panelFn) {
        target.innerHTML = `<div style="color:red;">Panel '${panelName}' not found.</div>`;
        return;
    }

    // Insert panel HTML
    target.innerHTML = panelFn(app.runSimulation);

    // Attach button handler AFTER HTML is inserted
    const btn = target.querySelector("#runBtn");
    if (btn) {
        btn.onclick = () => {
            const config = {
                type: key,
                freq: parseFloat(target.querySelector("#freq").value),
                vf: parseFloat(target.querySelector("#vf").value)
            };

            const result = app.runSimulation(config);
            console.log("Simulation result:", result);
        };
    }
}
