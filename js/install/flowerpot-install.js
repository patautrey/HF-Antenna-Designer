/* ---------------------------------------------------------
   HF Workbench — Flowerpot Installer Script
   Registers all Flowerpot modules with the hash router
--------------------------------------------------------- */

import initFlowerpotIndex from "../modules/flowerpot-index.js";
import initFlowerpotCoaxial from "../modules/flowerpot-coaxial.js";
import initFlowerpotDiagram from "../modules/flowerpot-diagram.js";
import initFlowerpotBuildSheet from "../modules/flowerpot-buildsheet.js";
import initFlowerpotMultiband from "../modules/flowerpot-multiband.js";
import initFlowerpotPerformance from "../modules/flowerpot-performance.js";
import initFlowerpotField from "../modules/flowerpot-field.js";
import initFlowerpotHeight from "../modules/flowerpot-height.js";
import initFlowerpotCoaxLoss from "../modules/flowerpot-coaxloss.js";

export function installFlowerpotModules(router) {

    router.register("flowerpot-index", initFlowerpotIndex);
    router.register("flowerpot-coaxial", initFlowerpotCoaxial);
    router.register("flowerpot-diagram", initFlowerpotDiagram);
    router.register("flowerpot-buildsheet", initFlowerpotBuildSheet);
    router.register("flowerpot-multiband", initFlowerpotMultiband);
    router.register("flowerpot-performance", initFlowerpotPerformance);
    router.register("flowerpot-field", initFlowerpotField);
    router.register("flowerpot-height", initFlowerpotHeight);
    router.register("flowerpot-coaxloss", initFlowerpotCoaxLoss);
}
