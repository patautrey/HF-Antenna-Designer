// HF-Antenna-Designer/ui/panels/index.js
// Central registry mapping antenna types → panel components

import VerticalYagiPanel from "./VerticalYagiPanel.js";
import FlowerpotPanel from "./FlowerpotPanel.js";
import EndFedPanel from "./EndFedPanel.js";
import DipolePanel from "./DipolePanel.js";
import LoopPanel from "./LoopPanel.js";
import QuadPanel from "./QuadPanel.js";
import MoxonPanel from "./MoxonPanel.js";
import JPolePanel from "./JPolePanel.js";

// Newly added missing antennas
import InvertedVPanel from "./InvertedVPanel.js";
import Yagi3Panel from "./Yagi3Panel.js";

// Optional: placeholder panel for unknown types
function MissingPanel(name) {
    return () => `
        <div class="p-4 border border-red-400 bg-red-50 rounded">
            <h3 class="text-lg font-bold text-red-700 mb-2">Panel Not Found</h3>
            <p class="text-red-600">No panel is registered for antenna type: <b>${name}</b></p>
        </div>
    `;
}

// Main registry
export const panels = {
    verticalYagi: VerticalYagiPanel,
    flowerpot: FlowerpotPanel,
    endFed: EndFedPanel,
    dipole: DipolePanel,
    loop: LoopPanel,
    quad: QuadPanel,
    moxon: MoxonPanel,
    jPole: JPolePanel,

    // Newly added
    invertedV: InvertedVPanel,
    yagi3: Yagi3Panel
};

// Safe accessor
export function getPanel(name) {
    return panels[name] || MissingPanel(name);
}
