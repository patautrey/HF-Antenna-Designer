// HF-Antenna-Designer/ui/panels/index.js

import FlowerpotPanel from "./flowerpot.js";
import DipolePanel from "./dipole.js";
import EndFedPanel from "./endFed.js";
import LoopPanel from "./loop.js";
import QuadPanel from "./quad.js";
import MoxonPanel from "./moxon.js";
import VerticalYagiPanel from "./verticalYagi.js";
import JPolePanel from "./jPole.js";
import InvertedVPanel from "./invertedV.js";
import Yagi3Panel from "./yagi3.js";

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
