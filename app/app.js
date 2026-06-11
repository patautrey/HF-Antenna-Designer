// HF-Antenna-Designer/app/app.js
// Browser‑safe registry (NO import.meta.glob)

// ENGINE IMPORTS
import FlowerpotEngine from "../engines/FlowerpotEngine.js";
import InvertedvEngine from "../engines/InvertedvEngine.js";
import Yagi3Engine from "../engines/Yagi3Engine.js";

// PANEL IMPORTS
import FlowerpotPanel from "../ui/panels/FlowerpotPanel.js";
import InvertedvPanel from "../ui/panels/InvertedvPanel.js";
import Yagi3Panel from "../ui/panels/Yagi3Panel.js";

// REGISTRY
const app = {
    engines: {
        flowerpot: (config) => new FlowerpotEngine(config),
        invertedv: (config) => new InvertedvEngine(config),
        yagi3: (config) => new Yagi3Engine(config)
    },

    panels: {
        flowerpot: FlowerpotPanel,
        invertedv: InvertedvPanel,
        yagi3: Yagi3Panel
    },

    runSimulation(config) {
        const type = config.type.toLowerCase();
        const factory = this.engines[type];
        if (!factory) throw new Error(`Engine '${type}' not found`);
        return factory(config).run();
    }
};

export default app;
