// HF-Antenna-Designer/ui/panels/index.js

import FlowerpotPanel from "./FlowerpotPanel.js";
import DipolePanel from "./DipolePanel.js";
import EndFedPanel from "./EndFedPanel.js";
import LoopPanel from "./LoopPanel.js";
import QuadPanel from "./QuadPanel.js";
import MoxonPanel from "./MoxonPanel.js";
import VerticalYagiPanel from "./VerticalYagiPanel.js";
import JPolePanel from "./JPolePanel.js";
import InvertedVPanel from "./InvertedVPanel.js";
import Yagi3Panel from "./Yagi3Panel.js";

export const panels = {
    flowerpot: FlowerpotPanel,
    dipole: DipolePanel,
    endFed: EndFedPanel,
    loop: LoopPanel,
    quad: QuadPanel,
    moxon: MoxonPanel,
    verticalYagi: VerticalYagiPanel,
    jPole: JPolePanel,
    invertedV: InvertedVPanel,
    yagi3: Yagi3Panel
};
