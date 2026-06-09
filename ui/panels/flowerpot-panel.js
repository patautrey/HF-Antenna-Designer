import { FlowerpotPresets } from "/ui/presets/flowerpot-presets.js";

attachEvents() {

    // Handle preset selection
    document.getElementById("fp_preset").onchange = () => {
        const key = document.getElementById("fp_preset").value;
        if (!key) return;

        const p = FlowerpotPresets[key];

        document.getElementById("fp_freq").value = p.frequency;
        document.getElementById("fp_coax").value = p.coaxType;
        document.getElementById("fp_pvc_od").value = p.pvcOD;
        document.getElementById("fp_pvc_mode").value = p.pvcMode;
        document.getElementById("fp_xl").value = p.targetReactance;
    };

    // Run simulation
    document.getElementById("fp_run").onclick = () => {
        const config = {
            type: "flowerpot",
            frequency: Number(document.getElementById("fp_freq").value) * 1e6,
            coaxType: document.getElementById("fp_coax").value,
            pvcOD: Number(document.getElementById("fp_pvc_od").value),
            pvcMode: document.getElementById("fp_pvc_mode").value,
            targetReactance: Number(document.getElementById("fp_xl").value)
        };

        this.app.runSimulation(config, "fp_results");
    };
}
