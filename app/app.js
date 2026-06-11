// HF-Antenna-Designer/app/app.js
// Auto‑registry for unlimited antennas

// Dynamically import all engines in /engines
const engineModules = import.meta.glob("../engines/*.js", { eager: true });

// Dynamically import all panels in /ui/panels
const panelModules = import.meta.glob("../ui/panels/*.js", { eager: true });

// Build registries
const engines = {};
const panels = {};

for (const path in engineModules) {
    const mod = engineModules[path];
    const name = path.split("/").pop().replace("Engine.js", "").toLowerCase();
    engines[name] = (config) => new mod.default(config);
}

for (const path in panelModules) {
    const mod = panelModules[path];
    const name = path.split("/").pop().replace("Panel.js", "").toLowerCase();
    panels[name] = mod.default;
}

const app = {
    engines,
    panels,

    runSimulation(config) {
        const type = config.type.toLowerCase();
        const factory = engines[type];
        if (!factory) throw new Error(`Engine '${type}' not found`);
        return factory(config).run();
    }
};

export default app;
