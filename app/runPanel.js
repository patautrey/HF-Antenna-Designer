export default function runPanel(app, panelName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const key = panelName.toLowerCase();
    const panelFn = app.panels[key];

    target.innerHTML = panelFn(app.runSimulation);

    const btn = target.querySelector("#runBtn");
    if (!btn) return;

    btn.onclick = () => {
        const config = { type: key };

        target.querySelectorAll("input, select").forEach(el => {
            const id = el.id;
            let val = el.value;

            if (el.type === "number") val = parseFloat(val);
            config[id] = val;
        });

        const result = app.runSimulation(config);
        console.log("Simulation result:", result);
    };
}
