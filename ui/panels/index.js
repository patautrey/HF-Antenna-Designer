import FlowerpotFieldPanel from "/ui/panels/flowerpot-field-panel.js";
import FlowerpotHeightPanel from "/ui/panels/flowerpot-height-panel.js";
import FlowerpotCoaxLossPanel from "/ui/panels/flowerpot-coaxloss-panel.js";

export const PANEL_MAP = {
    "flowerpot": FlowerpotPanel,
    "flowerpot-diagram": FlowerpotDiagramPanel,
    "flowerpot-buildsheet": FlowerpotBuildSheetPanel,
    "flowerpot-multiband": FlowerpotMultibandPanel,
    "flowerpot-performance": FlowerpotPerformancePanel,
    "flowerpot-field": FlowerpotFieldPanel,
    "flowerpot-height": FlowerpotHeightPanel,
    "flowerpot-coaxloss": FlowerpotCoaxLossPanel
};
