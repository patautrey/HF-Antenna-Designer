// HF-Antenna-Designer/app/app.js
// Central registry for BOTH engines and panels

// ----------------------
// Engine Imports
// ----------------------
import FlowerpotEngine from "../engines/FlowerpotEngine.js";
import VerticalYagiEngine from "../engines/VerticalYagiEngine.js";
import EndFedEngine from "../engines/EndFedEngine.js";
import DipoleEngine from "../engines/DipoleEngine.js";
import InvertedVEngine from "../engines/InvertedVEngine.js";
import Yagi3Engine from "../engines/Yagi3Engine.js";

// ----------------------
// Panel Imports
// ----------------------
import FlowerpotPanel from "../ui/panels/FlowerpotPanel.js";
import VerticalYagiPanel from "../ui/panels/VerticalYagiPanel.js";
import EndFedPanel from "../ui/panels/EndFedPanel.js";
import DipolePanel from "../ui/panels/DipolePanel.js";
import InvertedVPanel from "../ui/panels/InvertedVPanel.js";
import Yagi3Panel from "../ui/panels/Yagi3Panel.js";

// ----------------------
// App Registry
// ----------------------
const app = {

    // ENGINE FACTORIES
    engines: {
        flowerpot: (config) => new FlowerpotEngine(config),
        verticalYagi: (config) => new VerticalYagiEngine(config),
        endFed: (config) => new EndFedEngine(config),
        dipole: (config) => new DipoleEngine(config),
        invertedV: (config) => new InvertedVEngine(config),
        yagi3: (config) => new Yagi3Engine(config)
    },

    // PANEL FACTORIES
    panels: {
        flowerpot: FlowerpotPanel,
        verticalYagi: VerticalYagiPanel,
        endFed: EndFedPanel,
        dipole: DipolePanel,
        invertedV: InvertedVPanel,
        yagi3: Yagi3Panel
    }
};

export default app;
