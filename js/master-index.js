// ============================================================
// HF Antenna Designer — Master Module Index
// Exports ALL antenna modules in a clean, category‑organized map
// ============================================================

// ------------------------------
// IMPORT ALL MODULES
// ------------------------------

// Verticals
import verticalDesigner from "./vertical-designer.js";
import verticalHalfwave from "./vertical-halfwave.js";
import vertical58 from "./vertical-5-8.js";
import verticalToploaded from "./vertical-toploaded.js";
import verticalLoaded from "./vertical-loaded.js";
import verticalGroundplane from "./vertical-groundplane.js";
import verticalDXDesigner from "./vertical-dx-designer.js";
import verticalArray2 from "./vertical-array-2el-designer.js";
import verticalArray3 from "./vertical-array-3el-designer.js";
import verticalRadiatorArray from "./vertical-radiator-array.js";
import verticalNVISDesigner from "./vertical-nvis-designer.js";
import verticalDeltaLoop from "./vertical-delta-loop.js";

// Dipoles & Wires
import doubletDesigner from "./doublet-designer.js";
import efhwDesigner from "./efhw-designer.js";
import ocfDipoleDesigner from "./ocf-dipole-designer.js";
import fanDipoleDesigner from "./fan-dipole-designer.js";
import randomWireDesigner from "./randomwire-designer.js";
import terminatedDipole from "./terminated-dipole.js";
import edzDesigner from "./edz-designer.js";
import marconiInvertedL from "./hf-marconi-inverted-l.js";
import marconiSloper from "./hf-marconi-sloper.js";

// Loops
import horizontalLoopDesigner from "./horizontal-loop-designer.js";
import fullwaveLoopDesigner from "./fullwave-loop-designer.js";
import deltaLoopDesigner from "./loop-designer.js";
import skyloopDesigner from "./skyloop-designer.js";
import hloop from "./hloop.js";

// Yagis & Beams
import yagiDesigner from "./yagi-designer.js";
import beamLab from "./beam-lab.js";
import moxonDesigner from "./moxon-designer.js";
import hexbeamDesigner from "./hexbeam-designer.js";
import lpdaDesigner from "./lpda-designer.js";
import quagi from "./quagi.js";
import quadDesigner from "./quad-designer.js";

// Longwires & Beverages
import longwire from "./hf-longwire.js";
import beverageDesigner from "./beverage-designer.js";
import beverageReverse from "./hf-beverage-reverse-fed.js";
import slopingDirectional from "./hf-sloping-longwire-directional.js";

// Arrays
import phasedArray from "./phased-array.js";
import foursquareDesigner from "./foursquare-designer.js";
import curtainArrayDesigner from "./curtainarray-designer.js";
import sterbaDesigner from "./sterba-designer.js";

// Labs & Tools
import feedlineLab from "./feedline.js";
import swrLab from "./swr-lab.js";
import patternLab from "./pattern-lab.js";
import groundLab from "./ground-lab.js";
import efficiencyLab from "./efficiency-lab.js";
import bandOpening from "./band-opening.js";
import noiseLab from "./noise-lab.js";
import feedpointAnalyzer from "./feedpoint-analyzer.js";
import exporter from "./workbench-exporter.js";

// Documentation
import userManual from "./user-manual.js";
import glossary from "./glossary.js";

// ============================================================
// EXPORT MODULE MAP
// ============================================================

export default {
    // Verticals
    "vertical-designer": verticalDesigner,
    "vertical-halfwave": verticalHalfwave,
    "vertical-5-8": vertical58,
    "vertical-toploaded": verticalToploaded,
    "vertical-loaded": verticalLoaded,
    "vertical-groundplane": verticalGroundplane,
    "vertical-dx-designer": verticalDXDesigner,
    "vertical-array-2el-designer": verticalArray2,
    "vertical-array-3el-designer": verticalArray3,
    "vertical-radiator-array": verticalRadiatorArray,
    "vertical-nvis-designer": verticalNVISDesigner,
    "vertical-delta-loop": verticalDeltaLoop,

    // Dipoles & Wires
    "doublet-designer": doubletDesigner,
    "efhw-designer": efhwDesigner,
    "ocf-dipole-designer": ocfDipoleDesigner,
    "fan-dipole-designer": fanDipoleDesigner,
    "randomwire-designer": randomWireDesigner,
    "terminated-dipole": terminatedDipole,
    "edz-designer": edzDesigner,
    "marconi-inverted-l": marconiInvertedL,
    "marconi-sloper": marconiSloper,

    // Loops
    "horizontal-loop-designer": horizontalLoopDesigner,
    "fullwave-loop-designer": fullwaveLoopDesigner,
    "delta-loop-designer": deltaLoopDesigner,
    "skyloop-designer": skyloopDesigner,
    "hloop": hloop,

    // Yagis & Beams
    "yagi-designer": yagiDesigner,
    "beam-lab": beamLab,
    "moxon-designer": moxonDesigner,
    "hexbeam-designer": hexbeamDesigner,
    "lpda-designer": lpdaDesigner,
    "quagi": quagi,
    "quad-designer": quadDesigner,

    // Longwires & Beverages
    "hf-longwire": longwire,
    "beverage-designer": beverageDesigner,
    "beverage-reverse-fed": beverageReverse,
    "sloping-longwire-directional": slopingDirectional,

    // Arrays
    "phased-array": phasedArray,
    "foursquare-designer": foursquareDesigner,
    "curtainarray-designer": curtainArrayDesigner,
    "sterba-designer": sterbaDesigner,

    // Labs & Tools
    "feedline": feedlineLab,
    "swr-lab": swrLab,
    "pattern-lab": patternLab,
    "ground-lab": groundLab,
    "efficiency-lab": efficiencyLab,
    "band-opening": bandOpening,
    "noise-lab": noiseLab,
    "feedpoint-analyzer": feedpointAnalyzer,
    "workbench-exporter": exporter,

    // Documentation
    "user-manual": userManual,
    "glossary": glossary
};
