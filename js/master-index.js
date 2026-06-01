// js/master-index.js
// HF Antenna Designer — Correct GitHub Pages Router
// Loads ALL modules from: /HF-Antenna-Designer/js/modules/<filename>.js

import { PlotEngine } from "./plot-engine.js";

let ACTIVE_ITEM = null;

// ---------------------------------------------------------------------------
// STATIC MODULE LIST (from your PDF)
// ---------------------------------------------------------------------------

const MODULES = [
    // Designers
    { file: "58wave-designer.js", label: "58 Wave Vertical", category: "Designers" },
    { file: "doublet-designer.js", label: "Doublet Designer", category: "Designers" },
    { file: "skyloop-designer.js", label: "Skyloop Designer", category: "Designers" },
    { file: "loop-designer.js", label: "Loop Designer", category: "Designers" },
    { file: "horizontal-loop-designer.js", label: "Horizontal Loop Designer", category: "Designers" },
    { file: "fullwave-loop-designer.js", label: "Fullwave Loop Designer", category: "Designers" },
    { file: "fan-dipole-designer.js", label: "Fan Dipole Designer", category: "Designers" },
    { file: "edz-designer.js", label: "EDZ Designer", category: "Designers" },
    { file: "nvis-dipole-designer.js", label: "NVIS Dipole Designer", category: "Designers" },
    { file: "ocf-dipole-designer.js", label: "OCF Dipole Designer", category: "Designers" },
    { file: "vertical-designer.js", label: "Vertical Designer", category: "Designers" },
    { file: "vertical-dx-designer.js", label: "Vertical DX Designer", category: "Designers" },
    { file: "vertical-nvis-designer.js", label: "Vertical NVIS Designer", category: "Designers" },
    { file: "quarterwave-designer.js", label: "Quarterwave Designer", category: "Designers" },
    { file: "vertical-array-2el-designer.js", label: "Vertical Array 2el", category: "Designers" },
    { file: "vertical-array-3el-designer.js", label: "Vertical Array 3el", category: "Designers" },
    { file: "rybakov-designer.js", label: "Rybakov Designer", category: "Designers" },
    { file: "moxon-designer.js", label: "Moxon Designer", category: "Designers" },
    { file: "quad-designer.js", label: "Quad Designer", category: "Designers" },
    { file: "lpda-designer.js", label: "LPDA Designer", category: "Designers" },
    { file: "curtainarray-designer.js", label: "Curtain Array Designer", category: "Designers" },
    { file: "rhombic-designer.js", label: "Rhombic Designer", category: "Designers" },
    { file: "sterba-designer.js", label: "Sterba Curtain Designer", category: "Designers" },
    { file: "vbeam-designer.js", label: "V-Beam Designer", category: "Designers" },
    { file: "bobtail-designer.js", label: "Bobtail Curtain Designer", category: "Designers" },
    { file: "jpole-designer.js", label: "J-Pole Designer", category: "Designers" },

    // HF Antennas
    { file: "hf-longwire.js", label: "HF Longwire", category: "HF Antennas" },
    { file: "hf-beverage.js", label: "HF Beverage", category: "HF Antennas" },
    { file: "hf-beverage-reverse-fed.js", label: "HF Beverage Reverse-fed", category: "HF Antennas" },
    { file: "hf-doublet.js", label: "HF Doublet", category: "HF Antennas" },
    { file: "hf-efhw-49to1.js", label: "HF EFHW 49:1", category: "HF Antennas" },
    { file: "hf-extended-double-zepp.js", label: "HF EDZ", category: "HF Antennas" },
    { file: "hf-fan-dipole.js", label: "HF Fan Dipole", category: "HF Antennas" },
    { file: "hf-fullwave-loop.js", label: "HF Fullwave Loop", category: "HF Antennas" },
    { file: "hf-half-square.js", label: "HF Half Square", category: "HF Antennas" },
    { file: "hf-hexbeam.js", label: "HF Hexbeam", category: "HF Antennas" },
    { file: "hf-horizontal-loop.js", label: "HF Horizontal Loop", category: "HF Antennas" },
    { file: "hf-lazy-h.js", label: "HF Lazy-H", category: "HF Antennas" },
    { file: "hf-marconi-inverted-l.js", label: "HF Marconi Inverted-L", category: "HF Antennas" },
    { file: "hf-marconi-sloper.js", label: "HF Marconi Sloper", category: "HF Antennas" },
    { file: "hf-marconi-t.js", label: "HF Marconi T", category: "HF Antennas" },
    { file: "hf-moxon.js", label: "HF Moxon", category: "HF Antennas" },
    { file: "hf-multiband-dipole.js", label: "HF Multiband Dipole", category: "HF Antennas" },
    { file: "hf-ocf-dipole.js", label: "HF OCF Dipole", category: "HF Antennas" },
    { file: "hf-quad-loop.js", label: "HF Quad Loop", category: "HF Antennas" },
    { file: "hf-quad-yagi-hybrid.js", label: "HF Quad-Yagi Hybrid", category: "HF Antennas" },
    { file: "hf-quarter-wave-vertical.js", label: "HF Quarterwave Vertical", category: "HF Antennas" },
    { file: "hf-random-wire-9to1.js", label: "HF Random Wire 9:1", category: "HF Antennas" },
    { file: "hf-randomwire-endfed.js", label: "HF Randomwire Endfed", category: "HF Antennas" },
    { file: "hf-randomwire-multisection.js", label: "HF Randomwire Multisection", category: "HF Antennas" },
    { file: "hf-rybakov-vertical.js", label: "HF Rybakov Vertical", category: "HF Antennas" },
    { file: "hf-sloping-longwire-directional.js", label: "HF Sloping Longwire Directional", category: "HF Antennas" },
    { file: "hf-sloping-longwire-multidirectional.js", label: "HF Sloping Longwire Multidirectional", category: "HF Antennas" },
    { file: "hf-sloping-longwire-nvis-advanced.js", label: "HF Sloping Longwire NVIS Advanced", category: "HF Antennas" },
    { file: "hf-sterba-curtain.js", label: "HF Sterba Curtain", category: "HF Antennas" },
    { file: "hf-vertical-array-2el.js", label: "HF Vertical Array 2el", category: "HF Antennas" },
    { file: "hf-vertical-delta-loop.js", label: "HF Vertical Delta Loop", category: "HF Antennas" },

    // Labs
    { file: "coax-lab.js", label: "Coax Lab", category: "Labs" },
    { file: "ground-lab.js", label: "Ground Lab", category: "Labs" },
    { file: "ground-loss-lab.js", label: "Ground Loss Lab", category: "Labs" },
    { file: "array-lab.js", label: "Array Lab", category: "Labs" },
    { file: "balun-lab.js", label: "Balun Lab", category: "Labs" },
    { file: "beam-lab.js", label: "Beam Lab", category: "Labs" },
    { file: "doublet-lab.js", label: "Doublet Lab", category: "Labs" },
    { file: "dx-lab.js", label: "DX Lab", category: "Labs" },
    { file: "efficiency-lab.js", label: "Efficiency Lab", category: "Labs" },
    { file: "loop-lab.js", label: "Loop Lab", category: "Labs" },
    { file: "loop-nvis-lab.js", label: "Loop NVIS Lab", category: "Labs" },
    { file: "match-lab.js", label: "Match Lab", category: "Labs" },
    { file: "mobile-lab.js", label: "Mobile Lab", category: "Labs" },
    { file: "noise-lab.js", label: "Noise Lab", category: "Labs" },
    { file: "noise-snr-lab.js", label: "Noise SNR Lab", category: "Labs" },
    { file: "nvis-lab.js", label: "NVIS Lab", category: "Labs" },
    { file: "pattern-lab.js", label: "Pattern Lab", category: "Labs" },
    { file: "propagation-lab.js", label: "Propagation Lab", category: "Labs" },
    { file: "swr-lab.js", label: "SWR Lab", category: "Labs" },
    { file: "stacking-lab.js", label: "Stacking Lab", category: "Labs" },
    { file: "tilt-lab.js", label: "Tilt Lab", category: "Labs" },
    { file: "trap-lab.js", label: "Trap Lab", category: "Labs" },
    { file: "tuner-lab.js", label: "Tuner Lab", category: "Labs" },

    // Tools
    { file: "link-budget.js", label: "Link Budget", category: "Tools" },
    { file: "loss-budget.js", label: "Loss Budget", category: "Tools" },
    { file: "system-gain.js", label: "System Gain", category: "Tools" },
    { file: "rf-safety.js", label: "RF Safety", category: "Tools" },
    { file: "band-opening.js", label: "Band Opening", category: "Tools" },
    { file: "bandwidth-estimator.js", label: "Bandwidth Estimator", category: "Tools" },
    { file: "feedpoint-analyzer.js", label: "Feedpoint Analyzer", category: "Tools" },
    { file: "height-optimizer.js", label: "Height Optimizer", category: "Tools" },
    { file: "harmonic-explorer.js", label: "Harmonic Explorer", category: "Tools" },
    { file: "radials-optimizer.js", label: "Radials Optimizer", category: "Tools" },
    { file: "radiation-resistance.js", label: "Radiation Resistance", category: "Tools" },
    { file: "q-factor-analyzer.js", label: "Q Factor Analyzer", category: "Tools" },
    { file: "nec-synth.js", label: "NEC Synth", category: "Tools" },

    // Docs
    { file: "quick-start.js", label: "Quick Start", category: "Docs" },
    { file: "user-manual.js", label: "User Manual", category: "Docs" },
    { file: "glossary.js", label: "Glossary", category: "Docs" }
];

// ---------------------------------------------------------------------------
// SIDEBAR
// ---------------------------------------------------------------------------

function $(id) { return document.getElementById(id); }

function groupByCategory(list) {
    const map = new Map();
    list.forEach(m => {
        if (!map.has(m.category)) map.set(m.category, []);
        map.get(m.category).push(m);
    });
    return map;
}

function renderSidebar() {
    const sidebar = $("sidebar");
    sidebar.innerHTML = "";

    const grouped = groupByCategory(MODULES);

    grouped.forEach((mods, category) => {
        const h = document.createElement("h3");
        h.textContent = category;
        sidebar.appendChild(h);

        mods.forEach(mod => {
            const item = document.createElement("div");
            item.className = "nav-item";
            item.textContent = mod.label;
            item.onclick = () => loadModule(mod);
            sidebar.appendChild(item);
        });
    });
}

// ---------------------------------------------------------------------------
// MODULE LOADING (FINAL, CORRECTED PATH)
// ---------------------------------------------------------------------------

async function loadModule(mod) {
    const content = $("content");
    content.innerHTML = `<h2>${mod.label}</h2><p>Loading...</p>`;

    try {
        const module = await import(`/HF-Antenna-Designer/js/modules/${mod.file}`);

        PlotEngine.clearPlot();

        if (typeof module.init === "function") {
            module.init({ PlotEngine, container: content });
        } else if (typeof module.default === "function") {
            module.default({ PlotEngine, container: content });
        } else {
            content.innerHTML += `<p><em>Module loaded, but no init() found.</em></p>`;
        }
    } catch (err) {
        content.innerHTML = `
            <h2>Error</h2>
            <p>Failed to load: <code>/HF-Antenna-Designer/js/modules/${mod.file}</code></p>
            <pre>${err}</pre>
        `;
    }
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    $("content").innerHTML = `
        <h2>Welcome to HF Antenna Designer</h2>
        <p>Select an antenna module from the sidebar.</p>
    `;
});
