// HF-Antenna-Designer/app/app.js
// Central engine registry for all antenna types (scalable to 200+ engines)

// Import your antenna engines here
// Example imports — add your real engines as you build them
import FlowerpotEngine from "../engines/FlowerpotEngine.js";
import VerticalYagiEngine from "../engines/VerticalYagiEngine.js";
import EndFedEngine from "../engines/EndFedEngine.js";
import DipoleEngine from "../engines/DipoleEngine.js";

// ------------------------------------------------------------
// Engine Registry
// ------------------------------------------------------------
//
// Each key is the antenna type string used in config.type
// Each value is a factory function returning a new engine instance
//
// Example:
//   config.type = "flowerpot"
//   → engineFactory = app["flowerpot"]
//   → engine = engineFactory(config)
//

const app = {
    flowerpot: (config) => new FlowerpotEngine(config),
    verticalYagi: (config) => new VerticalYagiEngine(config),
    endFed: (config) => new EndFedEngine(config),
    dipole: (config) => new DipoleEngine(config),

    // Add new antennas here:
    // myNewAntenna: (config) => new MyNewAntennaEngine(config),
};

// ------------------------------------------------------------
// Safe Export
// ------------------------------------------------------------

export default app;
