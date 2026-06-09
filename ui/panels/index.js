/* ============================================================
   UI Panel Registry
   ============================================================ */

import FlowerpotPanel from "/ui/panels/flowerpot-panel.js";
import FlowerpotDiagramPanel from "/ui/panels/flowerpot-diagram-panel.js";
import FlowerpotBuildSheetPanel from "/ui/panels/flowerpot-buildsheet-panel.js";
import FlowerpotMultibandPanel from "/ui/panels/flowerpot-multiband-panel.js";
import FlowerpotPerformancePanel from "/ui/panels/flowerpot-performance-panel.js";

export const PANEL_MAP = {
    "flowerpot": FlowerpotPanel,
    "flowerpot-diagram": FlowerpotDiagramPanel,
    "flowerpot-buildsheet": FlowerpotBuildSheetPanel,
    "flowerpot-multiband": FlowerpotMultibandPanel,
    "flowerpot-performance": FlowerpotPerformancePanel
};
