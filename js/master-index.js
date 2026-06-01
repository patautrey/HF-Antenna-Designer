// js/master-index.js
// HF Antenna Designer — Router + Sidebar UI
// Uses antenna modules in js/modules/

import { PlotEngine } from "./plot-engine.js";

// ---------------------------------------------------------------------------
// MODULE REGISTRY
// ---------------------------------------------------------------------------
// You ONLY list the filenames. The router builds "./modules/<file>" paths.

const MODULES = [
    // Horizontal
    { id: "doublet",        label: "HF Doublet Designer",        file: "doublet-designer.js",        category: "Horizontal" },
    { id: "skyloop",        label: "Skyloop Designer",           file: "skyloop-designer.js",        category: "Horizontal" },
    { id: "loop",           label: "Horizontal Loop Designer",   file: "loop-designer.js",           category: "Horizontal" },
    { id: "fullwave-loop",  label: "Fullwave Loop Designer",     file: "fullwave-loop-designer.js",  category: "Horizontal" },
    { id: "horizontal-loop",label: "HF Horizontal Loop",         file: "horizontal-loop-designer.js",category: "Horizontal" },
    { id: "fan-dipole",     label: "Fan Dipole Designer",        file: "fan-dipole-designer.js",     category: "Horizontal" },
    { id: "nvis-dipole",    label: "NVIS Dipole Designer",       file: "nvis-dipole-designer.js",    category: "Horizontal" },
    { id: "ocf-dipole",     label: "OCF Dipole Designer",        file: "ocf-dipole-designer.js",     category: "Horizontal" },

    // Verticals
    { id: "vertical-dx",    label: "Vertical DX Designer",       file: "vertical-dx-designer.js",    category: "Vertical" },
    { id: "vertical-nvis",  label: "Vertical NVIS Designer",     file: "vertical-nvis-designer.js",  category: "Vertical" },
    { id: "vertical",       label: "General Vertical Designer",  file: "vertical-designer.js",       category: "Vertical" },
    { id: "quarterwave",    label: "Quarter-wave Vertical",      file: "quarterwave-designer.js",    category: "Vertical" },
    { id: "58wave",         label: "5/8-wave Vertical",          file: "58wave-designer.js",         category: "Vertical" },
    { id: "vertical-array-2el", label: "Vertical Array 2el",     file: "vertical-array-2el-designer.js", category: "Vertical" },
    { id: "vertical-array-3el", label: "Vertical Array 3el",     file: "vertical-array-3el-designer.js", category: "Vertical" },
    { id: "rybakov",        label: "Rybakov Vertical Designer",  file: "rybakov-designer.js",        category: "Vertical" },

    // Arrays / beams / quads
    { id: "yagi",           label: "Yagi Designer",              file: "yagi-designer.js",           category: "Arrays & Beams" },
    { id: "lpda",           label: "LPDA Designer",              file: "lpda-designer.js",           category: "Arrays & Beams" },
    { id: "quad",           label: "Quad Designer",              file: "quad-designer.js",           category: "Arrays & Beams" },
    { id: "moxon",          label: "Moxon Designer",             file: "moxon-designer.js",          category: "Arrays & Beams" },
    { id: "curtain",        label: "Curtain Array Designer",     file: "curtainarray-designer.js",   category: "Arrays & Beams" },
    { id: "rhombic",        label: "Rhombic Designer",           file: "rhombic-designer.js",        category: "Arrays & Beams" },
    { id: "sterba",         label: "Sterba Curtain Designer",    file: "sterba-designer.js",         category: "Arrays & Beams" },
    { id: "vbeam",          label: "V-Beam Designer",            file: "vbeam-designer.js",          category: "Arrays & Beams" },
    { id: "foursquare",     label: "Foursquare Designer",        file: "foursquare-designer.js",     category: "Arrays & Beams" },
    { id: "bobtail",        label: "Bobtail Curtain Designer",   file: "bobtail-designer.js",        category: "Arrays & Beams" },

    // End-fed / Random Wire
    { id: "efhw",           label: "EFHW Designer",              file: "efhw-designer.js",           category: "End-Fed & Random" },
    { id: "efhw-lab",       label: "EFHW Lab",                   file: "efhw-lab.js",                category: "End-Fed & Random" },
    { id: "randomwire",     label: "Random Wire Designer",       file: "randomwire-designer.js",     category: "End-Fed & Random" },
    { id: "terminated-dipole", label: "Terminated Dipole",       file: "terminated-dipole.js",       category: "End-Fed & Random" },

    // Long wires / beverages
    { id: "beverage",       label: "Beverage Designer",          file: "beverage-designer.js",       category: "Long Wire & Beverage" },
    { id: "hf-beverage",    label: "HF Beverage",                file: "hf-beverage.js",             category: "Long Wire & Beverage" },
    { id: "hf-beverage-reverse-fed", label: "HF Beverage Reverse-fed", file: "hf-beverage-reverse-fed.js", category: "Long Wire & Beverage" },
    { id: "hf-longwire",    label: "HF Longwire",                file: "hf-longwire.js",             category: "Long Wire & Beverage" },

    // Labs & tools
    { id: "feedline-lab",   label: "Feedline Lab",               file: "coax-lab.js",                category: "Labs & Tools" },
    { id: "ground-lab",     label: "Ground Lab",                 file: "ground-lab.js",              category: "Labs & Tools" },
    { id: "ground-loss-lab",label: "Ground Loss Lab",            file: "ground-loss-lab.js",         category: "Labs & Tools" },
    { id: "pattern-lab",    label: "Pattern Lab",                file: "pattern-lab.js",             category: "Labs & Tools" },
    { id: "swr-lab",        label: "SWR Lab",                    file: "swr-lab.js",                 category: "Labs & Tools" },
    { id: "noise-lab",      label: "Noise Lab",                  file: "noise-lab.js",               category: "Labs & Tools" },
    { id: "noise-snr-lab",  label: "Noise SNR Lab",              file: "noise-snr-lab.js",           category: "Labs & Tools" },
    { id: "link-budget",    label: "Link Budget",                file: "link-budget.js",             category: "Labs & Tools" },
    { id: "loss-budget",    label: "Loss Budget",                file: "loss-budget.js",             category: "Labs & Tools" },
    { id: "propagation",    label: "Propagation Explorer",       file: "propagation.js",             category: "Labs & Tools" },
    { id: "muf-luf",        label: "MUF/LUF Explorer",           file: "muf-luf-explorer.js",        category: "Labs & Tools" },
    { id: "system-gain",    label: "System Gain",                file: "system-gain.js",             category: "Labs & Tools" },
    { id: "rf-safety",      label: "RF Safety",                  file: "rf-safety.js",               category: "Labs & Tools" },

    // Docs
    { id: "quick-start",    label: "Quick Start Guide",          file: "quick-start.js",             category: "Documentation" },
    { id: "user-manual",    label: "User Manual",                file: "user-manual.js",             category: "Documentation" },
    { id: "glossary",       label: "Glossary",                   file: "glossary.js",                category: "Documentation" }
];

// ---------------------------------------------------------------------------
// PATH BUILDER
// ---------------------------------------------------------------------------

function modulePath(file) {
    // All antenna modules live in js/modules/
    return `./modules/${file}`;
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
