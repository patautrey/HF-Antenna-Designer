// js/master-index.js
// HF Antenna Designer — Router + Sidebar UI
// Antenna modules live directly in js/ (same folder as this file)

import { PlotEngine } from "./plot-engine.js";

// ---------------------------------------------------------------------------
// MODULE REGISTRY
// ---------------------------------------------------------------------------

const MODULES = [
    // --- Horizontal / loops / dipoles ---
    { id: "doublet-designer",   label: "HF Doublet Designer",          file: "doublet-designer.js",          category: "Horizontal" },
    { id: "hf-doublet",         label: "HF Doublet (Engine View)",     file: "hf-doublet.js",                category: "Horizontal" },
    { id: "skyloop-designer",   label: "Skyloop Designer",             file: "skyloop-designer.js",          category: "Horizontal" },
    { id: "horizontal-loop-designer", label: "Horizontal Loop Designer", file: "horizontal-loop-designer.js", category: "Horizontal" },
    { id: "fullwave-loop-designer",   label: "Fullwave Loop Designer", file: "fullwave-loop-designer.js",    category: "Horizontal" },
    { id: "loop-designer",      label: "Legacy Loop Designer",         file: "loop-designer.js",             category: "Horizontal" },
    { id: "fan-dipole-designer",label: "Fan Dipole Designer",          file: "fan-dipole-designer.js",       category: "Horizontal" },
    { id: "edz-designer",       label: "Extended Double Zepp Designer",file: "edz-designer.js",              category: "Horizontal" },
    { id: "nvis-dipole-designer",label: "NVIS Dipole Designer",        file: "nvis-dipole-designer.js",      category: "Horizontal" },
    { id: "ocf-dipole-designer",label: "OCF Dipole Designer",          file: "ocf-dipole-designer.js",       category: "Horizontal" },

    // --- Verticals ---
    { id: "vertical-designer",  label: "General Vertical Designer",     file: "vertical-designer.js",         category: "Vertical" },
    { id: "vertical-dx-designer",label: "Vertical DX Designer",         file: "vertical-dx-designer.js",      category: "Vertical" },
    { id: "vertical-nvis-designer", label: "Vertical NVIS Designer",    file: "vertical-nvis-designer.js",    category: "Vertical" },
    { id: "quarterwave-designer",label: "Quarter-wave Vertical Designer", file: "quarterwave-designer.js",   category: "Vertical" },
    { id: "58wave-designer",    label: "5/8-wave Vertical Designer",    file: "58wave-designer.js",          category: "Vertical" },
    { id: "vertical-array-2el-designer", label: "Vertical Array 2el Designer", file: "vertical-array-2el-designer.js", category: "Vertical" },
    { id: "vertical-array-3el-designer", label: "Vertical Array 3el Designer", file: "vertical-array-3el-designer.js", category: "Vertical" },
    { id: "rybakov-designer",   label: "Rybakov Vertical Designer",     file: "rybakov-designer.js",         category: "Vertical" },
    { id: "hf-quarter-wave-vertical", label: "HF Quarter-wave Vertical", file: "hf-quarter-wave-vertical.js", category: "Vertical" },
    { id: "hf-rybakov-vertical", label: "HF Rybakov Vertical",          file: "hf-rybakov-vertical.js",      category: "Vertical" },
    { id: "vertical-5-8",       label: "Vertical 5/8 Engine",           file: "vertical-5-8.js",             category: "Vertical" },
    { id: "vertical-groundplane",label: "Vertical Groundplane",         file: "vertical-groundplane.js",     category: "Vertical" },
    { id: "vertical-fullwave",  label: "Vertical Fullwave",             file: "vertical-fullwave.js",        category: "Vertical" },
    { id: "vertical-halfwave",  label: "Vertical Halfwave",             file: "vertical-halfwave.js",        category: "Vertical" },
    { id: "vertical-loaded",    label: "Loaded Vertical",               file: "vertical-loaded.js",          category: "Vertical" },
    { id: "vertical-toploaded", label: "Top-loaded Vertical",           file: "vertical-toploaded.js",       category: "Vertical" },
    { id: "vertical-radiator-array", label: "Vertical Radiator Array",  file: "vertical-radiator-array.js",  category: "Vertical" },

    // --- Arrays / beams / quads ---
    { id: "yagi-designer",      label: "Yagi Designer",                 file: "yagi-designer.js",            category: "Arrays & Beams" },
    { id: "quad-designer",      label: "Quad Designer",                 file: "quad-designer.js",            category: "Arrays & Beams" },
    { id: "lpda-designer",      label: "LPDA Designer",                 file: "lpda-designer.js",            category: "Arrays & Beams" },
    { id: "moxon-designer",     label: "Moxon Designer",                file: "moxon-designer.js",           category: "Arrays & Beams" },
    { id: "curtainarray-designer", label: "Curtain Array Designer",     file: "curtainarray-designer.js",    category: "Arrays & Beams" },
    { id: "rhombic-designer",   label: "Rhombic Designer",              file: "rhombic-designer.js",         category: "Arrays & Beams" },
    { id: "half-rhombic-designer", label: "Half Rhombic Designer",      file: "half-rhombic-designer.js",    category: "Arrays & Beams" },
    { id: "sterba-designer",    label: "Sterba Curtain Designer",       file: "sterba-designer.js",          category: "Arrays & Beams" },
    { id: "vbeam-designer",     label: "V-Beam Designer",               file: "vbeam-designer.js",           category: "Arrays & Beams" },
    { id: "foursquare-designer",label: "Foursquare Designer",           file: "foursquare-designer.js",      category: "Arrays & Beams" },
    { id: "bobtail-designer",   label: "Bobtail Curtain Designer",      file: "bobtail-designer.js",         category: "Arrays & Beams" },

    // --- End-fed / random / OCF ---
    { id: "efhw-designer",      label: "EFHW Designer",                 file: "efhw-designer.js",            category: "End-Fed & Random" },
    { id: "efhw-lab",           label: "EFHW Lab",                      file: "efhw-lab.js",                 category: "End-Fed & Random" },
    { id: "randomwire-designer",label: "Random Wire Designer",          file: "randomwire-designer.js",      category: "End-Fed & Random" },
    { id: "terminated-dipole",  label: "Terminated Dipole",             file: "terminated-dipole.js",        category: "End-Fed & Random" },
    { id: "hf-random-wire-9to1",label: "HF Random Wire 9:1",           file: "hf-random-wire-9to1.js",      category: "End-Fed & Random" },
    { id: "hf-randomwire-endfed", label: "HF Randomwire Endfed",        file: "hf-randomwire-endfed.js",     category: "End-Fed & Random" },
    { id: "hf-randomwire-multisection", label: "HF Randomwire Multisection", file: "hf-randomwire-multisection.js", category: "End-Fed & Random" },
    { id: "hf-efhw-49to1",      label: "HF EFHW 49:1",                  file: "hf-efhw-49to1.js",            category: "End-Fed & Random" },
    { id: "hf-ocf-dipole",      label: "HF OCF Dipole",                 file: "hf-ocf-dipole.js",            category: "End-Fed & Random" },

    // --- Long wires / beverages ---
    { id: "beverage-designer",  label: "Beverage Designer",             file: "beverage-designer.js",        category: "Long Wire & Beverage" },
    { id: "hf-beverage",        label: "HF Beverage",                   file: "hf-beverage.js",              category: "Long Wire & Beverage" },
    { id: "hf-beverage-reverse-fed", label: "HF Beverage Reverse-fed",  file: "hf-beverage-reverse-fed.js",  category: "Long Wire & Beverage" },
    { id: "hf-longwire",        label: "HF Longwire",                   file: "hf-longwire.js",              category: "Long Wire & Beverage" },
    { id: "hf-sloping-longwire-directional", label: "HF Sloping Longwire Directional", file: "hf-sloping-longwire-directional.js", category: "Long Wire & Beverage" },
    { id: "hf-sloping-longwire-multidirectional", label: "HF Sloping Longwire Multidirectional", file: "hf-sloping-longwire-multidirectional.js", category: "Long Wire & Beverage" },
    { id: "hf-sloping-longwire-nvis-advanced", label: "HF Sloping Longwire NVIS Advanced", file: "hf-sloping-longwire-nvis-advanced.js", category: "Long Wire & Beverage" },

    // --- Labs & tools ---
    { id: "coax-lab",           label: "Coax / Feedline Lab",           file: "coax-lab.js",                 category: "Labs & Tools" },
    { id: "ground-lab",         label: "Ground Lab",                    file: "ground-lab.js",               category: "Labs & Tools" },
    { id: "ground-loss-lab",    label: "Ground Loss Lab",               file: "ground-loss-lab.js",          category: "Labs & Tools" },
    { id: "array-lab",          label: "Array Lab",                     file: "array-lab.js",                category: "Labs & Tools" },
    { id: "balun-lab",          label: "Balun Lab",                     file: "balun-lab.js",                category: "Labs & Tools" },
    { id: "beam-lab",           label: "Beam Lab",                      file: "beam-lab.js",                 category: "Labs & Tools" },
    { id: "doublet-lab",        label: "Doublet Lab",                   file: "doublet-lab.js",              category: "Labs & Tools" },
    { id: "dx-lab",             label: "DX Lab",                        file: "dx-lab.js",                   category: "Labs & Tools" },
    { id: "efficiency-lab",     label: "Efficiency Lab",                file: "efficiency-lab.js",           category: "Labs & Tools" },
    { id: "feedpoint-analyzer", label: "Feedpoint Analyzer",            file: "feedpoint-analyzer.js",       category: "Labs & Tools" },
    { id: "loop-lab",           label: "Loop Lab",                      file: "loop-lab.js",                 category: "Labs & Tools" },
    { id: "loop-nvis-lab",      label: "Loop NVIS Lab",                 file: "loop-nvis-lab.js",            category: "Labs & Tools" },
    { id: "match-lab",          label: "Match Lab",                     file: "match-lab.js",                category: "Labs & Tools" },
    { id: "mobile-lab",         label: "Mobile Lab",                    file: "mobile-lab.js",               category: "Labs & Tools" },
    { id: "noise-lab",          label: "Noise Lab",                     file: "noise-lab.js",                category: "Labs & Tools" },
    { id: "noise-snr-lab",      label: "Noise SNR Lab",                 file: "noise-snr-lab.js",            category: "Labs & Tools" },
    { id: "nvis-lab",           label: "NVIS Lab",                      file: "nvis-lab.js",                 category: "Labs & Tools" },
    { id: "pattern-lab",        label: "Pattern Lab",                   file: "pattern-lab.js",              category: "Labs & Tools" },
    { id: "propagation-lab",    label: "Propagation Lab",               file: "propagation-lab.js",          category: "Labs & Tools" },
    { id: "swr-lab",            label: "SWR Lab",                       file: "swr-lab.js",                  category: "Labs & Tools" },
    { id: "stacking-lab",       label: "Stacking Lab",                  file: "stacking-lab.js",             category: "Labs & Tools" },
    { id: "tilt-lab",           label: "Tilt Lab",                      file: "tilt-lab.js",                 category: "Labs & Tools" },
    { id: "trap-lab",           label: "Trap Lab",                      file: "trap-lab.js",                 category: "Labs & Tools" },
    { id: "tuner-lab",          label: "Tuner Lab",                     file: "tuner-lab.js",                category: "Labs & Tools" },
    { id: "vhf-uhf-workbench",  label: "VHF/UHF Workbench",             file: "vhf-uhf-workbench.js",        category: "Labs & Tools" },
    { id: "link-budget",        label: "Link Budget",                   file: "link-budget.js",              category: "Labs & Tools" },
    { id: "loss-budget",        label: "Loss Budget",                   file: "loss-budget.js",              category: "Labs & Tools" },
    { id: "propagation",        label: "Propagation Explorer",          file: "propagation.js",              category: "Labs & Tools" },
    { id: "muf-luf-explorer",   label: "MUF/LUF Explorer",              file: "muf-luf-explorer.js",         category: "Labs & Tools" },
    { id: "system-gain",        label: "System Gain",                   file: "system-gain.js",              category: "Labs & Tools" },
    { id: "rf-safety",          label: "RF Safety",                     file: "rf-safety.js",                category: "Labs & Tools" },

    // --- Docs ---
    { id: "quick-start",        label: "Quick Start Guide",             file: "quick-start.js",              category: "Documentation" },
    { id: "user-manual",        label: "User Manual",                   file: "user-manual.js",              category: "Documentation" },
    { id: "glossary",           label: "Glossary",                      file: "glossary.js",                 category: "Documentation" }
];

// ---------------------------------------------------------------------------
// PATH BUILDER
// ---------------------------------------------------------------------------

function modulePath(file) {
    // Antenna modules live in the same folder as this file: /js/
    return `./${file}`;
}

// ---------------------------------------------------------------------------
// DOM HELPERS
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

// ---------------------------------------------------------------------------
// SIDEBAR
// ---------------------------------------------------------------------------

function renderSidebar() {
    const sidebar = $("sidebar");
    sidebar.innerHTML = "";

    const search = document.createElement("input");
    search.placeholder = "Search modules…";
    search.style.width = "100%";
    search.style.padding = "0.4rem";
    search.style.marginBottom = "1rem";
    search.style.background = "#111";
    search.style.border = "1px solid #444";
    search.style.color = "#eee";

    search.addEventListener("input", () => {
        renderModuleList(search.value.toLowerCase());
    });

    sidebar.appendChild(search);

    const list = document.createElement("div");
    list.id = "module-list";
    sidebar.appendChild(list);

    renderModuleList("");
}

function renderModuleList(filter) {
    const list = $("module-list");
    list.innerHTML = "";

    const filtered = MODULES.filter(m =>
        m.label.toLowerCase().includes(filter) ||
        m.category.toLowerCase().includes(filter)
    );

    const grouped = groupByCategory(filtered);

    grouped.forEach((mods, category) => {
        const section = document.createElement("div");
        section.className = "nav-section";

        const h = document.createElement("h3");
        h.textContent = category;
        section.appendChild(h);

        mods.forEach(mod => {
            const item = document.createElement("div");
            item.className = "nav-item";
            item.textContent = mod.label;
            item.onclick = () => loadModule(mod);
            section.appendChild(item);
        });

        list.appendChild(section);
    });
}

// ---------------------------------------------------------------------------
// MODULE LOADING
// ---------------------------------------------------------------------------

async function loadModule(mod) {
    const content = $("content");
    content.innerHTML = `<h2>${mod.label}</h2><p>Loading…</p>`;

    try {
        const module = await import(modulePath(mod.file));

        PlotEngine.clearPlot();

        if (typeof module.init === "function") {
            module.init({ PlotEngine, container: content });
        } else if (typeof module.default === "function") {
            module.default({ PlotEngine, container: content });
        } else {
            content.innerHTML += `<p><em>Module loaded (no init function detected).</em></p>`;
        }
    } catch (err) {
        console.error(err);
        content.innerHTML = `
            <h2>Error</h2>
            <p>Failed to load: <code>${modulePath(mod.file)}</code></p>
        `;
    }
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    const content = $("content");
    content.innerHTML = `
        <h2>Welcome to HF Antenna Designer</h2>
        <p>Select an antenna module from the sidebar.</p>
    `;
});
