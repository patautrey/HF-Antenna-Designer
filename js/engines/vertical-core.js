/* ============================================================
   HF Antenna Designer — Vertical Core Engine (Part 1)
   UI + Input Builder
   ============================================================ */

import UIEngine from "./ui-engine.js";

const VerticalCore = {

    /* ------------------------------------------------------------
       1. VERTICAL TYPE LIST
       ------------------------------------------------------------ */
    verticalTypes: [
        // Standard
        { value: "quarter", label: "1/4‑Wave Vertical" },
        { value: "half", label: "1/2‑Wave Vertical" },
        { value: "fiveeighths", label: "5/8‑Wave Vertical" },
        { value: "noradial", label: "No‑Radial Vertical" },

        // Loaded
        { value: "loaded", label: "Loaded Vertical" },
        { value: "baseloaded", label: "Base‑Loaded Vertical" },
        { value: "centerloaded", label: "Center‑Loaded Vertical" },
        { value: "toploaded", label: "Top‑Loaded Vertical" },
        { value: "slinky", label: "Slinky Vertical" },

        // Specialty
        { value: "41ft", label: "41‑Foot Vertical" },
        { value: "70percent", label: "70% Vertical — DX Mode" },
        { value: "rybakov", label: "Rybakov Vertical" },
        { value: "marconi", label: "Marconi Vertical" },
        { value: "foldover", label: "Fold‑Over Vertical" },
        { value: "endfed", label: "End‑Fed Vertical" },
        { value: "verticaldipole", label: "Vertical Dipole" },
        { value: "performer", label: "Performer Vertical" },
        { value: "dominator", label: "Dominator Vertical" },

        // Loops
        { value: "deltaloop", label: "Delta Loop (Vertical)" },
        { value: "squareloop", label: "Square Loop Vertical" },

        // Phased / Arrays
        { value: "phasedpair", label: "Phased Vertical Pair" },
        { value: "halfsquare", label: "Half‑Square Vertical" },
        { value: "array2", label: "Vertical Array (2‑Element)" },
        { value: "array4", label: "Vertical Array (4‑Square)" },

        // Vertical Beams
        { value: "yagi2", label: "Vertical Yagi (2‑Element)" },
        { value: "yagi3", label: "Vertical Yagi (3‑Element)" },
        { value: "moxon", label: "Vertical Moxon" }
    ],

    /* ------------------------------------------------------------
       2. BUILD INPUT PANEL
       ------------------------------------------------------------ */
    buildInputPanel() {
        const panel = UIEngine.panel("Vertical Antenna Configuration");

        // Vertical type dropdown
        panel.appendChild(
            UIEngine.select("Vertical Type", "verticalType", this.verticalTypes)
        );

        // Frequency
        panel.appendChild(
            UIEngine.input("Frequency (MHz)", "freq", "number", 14.2)
        );

        // Height
        panel.appendChild(
            UIEngine.input("Height (meters)", "height", "number", 10)
        );

        // Radials
        panel.appendChild(
            UIEngine.input("Radial Count", "radialCount", "number", 16)
        );

        panel.appendChild(
            UIEngine.input("Radial Length (m)", "radialLength", "number", 10)
        );

        // Ground model
        panel.appendChild(
            UIEngine.select("Ground Type", "groundType", [
                { value: "average", label: "Average Ground" },
                { value: "poor", label: "Poor Ground" },
                { value: "good", label: "Good Ground" },
                { value: "seaside", label: "Seaside (Saltwater)" }
            ])
        );

        // DX Mode
        panel.appendChild(
            UIEngine.select("DX Mode", "dxMode", [
                { value: "off", label: "Off" },
                { value: "low", label: "Low Angle Bias" },
                { value: "extreme", label: "Extreme DX Mode" }
            ])
        );

        // Calculate button
        panel.appendChild(UIEngine.button("Calculate", "calcVertical"));

        return panel;
    },

    /* ------------------------------------------------------------
       3. BUILD OUTPUT PANELS (placeholders for now)
       ------------------------------------------------------------ */
    buildOutputPanels() {
        return [
            UIEngine.chartContainer("azimuthPlot", "Azimuth Pattern"),
            UIEngine.chartContainer("elevationPlot", "Elevation Pattern"),
            UIEngine.chartContainer("swrPlot", "SWR Curve"),
            UIEngine.chartContainer("currentPlot", "Current Distribution")
        ];
    },

    /* ------------------------------------------------------------
       4. RENDER UI (Part 1 only)
       ------------------------------------------------------------ */
    render(container) {
        const inputPanel = this.buildInputPanel();
        const outputPanels = this.buildOutputPanels();

        UIEngine.render(container, [
            inputPanel,
            ...outputPanels
        ]);
    }
};

export default VerticalCore;
