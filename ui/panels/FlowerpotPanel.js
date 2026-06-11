import PanelTemplate from "./PanelTemplate.js";

export default function FlowerpotPanel(runSimulation) {
    return PanelTemplate("flowerpot", [
        { id: "freq", label: "Frequency (MHz)", default: 146 },
        { id: "vf", label: "Velocity Factor", default: 0.66 }
    ], runSimulation);
}
