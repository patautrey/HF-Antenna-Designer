// js/master-index.js
// HF Antenna Designer — Auto‑Path Router + Sidebar UI

import { PlotEngine } from "./plot-engine.js";

// ---------------------------------------------------------------------------
// MODULE REGISTRY
// ---------------------------------------------------------------------------
// You ONLY list the filenames. The router builds the correct "../" path.
// No more broken imports. No more missing sidebar.

const MODULES = [
    // Horizontal
    { id: "doublet", label: "HF Doublet Designer", file: "doublet-designer.js", category: "Horizontal" },
    { id: "skyloop", label: "Skyloop Designer", file: "skyloop-designer.js", category: "Horizontal" },
    { id: "loop", label: "Horizontal Loop Designer", file: "loop-designer.js", category: "Horizontal" },
    { id: "fullwave-loop", label: "Fullwave Loop Designer", file: "fullwave-loop-designer.js", category: "Horizontal" },
    { id: "horizontal-loop", label: "HF Horizontal Loop", file: "horizontal-loop-designer.js", category: "Horizontal" },

    // Verticals
    { id: "vertical-dx", label: "Vertical DX Designer", file: "vertical-dx-designer.js", category: "Vertical" },
    { id: "vertical-nvis", label: "Vertical NVIS Designer", file: "vertical-nvis-designer.js", category: "Vertical" },
    { id: "quarterwave", label: "Quarter-wave Vertical", file: "quarterwave-designer.js", category: "Vertical" },
    { id: "58wave", label: "5/8-wave Vertical", file: "58wave-designer.js", category: "Vertical" },

    // Arrays
    { id: "yagi", label: "Yagi Designer", file: "yagi-designer.js", category: "Arrays & Beams" },
    { id: "quad", label: "Quad Designer", file: "quad-designer.js", category: "Arrays & Beams" },
    { id: "curtain", label: "Curtain Array Designer", file: "curtainarray-designer.js", category: "Arrays & Beams" },
    { id: "bobtail", label: "Bobtail Curtain Designer", file: "bobtail-designer.js", category: "Arrays & Beams" },

    // End-fed / Random Wire
    { id: "efhw", label: "EFHW Designer", file: "efhw-designer.js", category: "End-Fed & Random" },
    { id: "randomwire", label: "Random Wire Designer", file: "randomwire-designer.js", category: "End-Fed & Random" },

    // Labs
    { id: "feedline-lab", label: "Feedline Lab", file: "coax-lab.js", category: "Labs & Tools" },
    { id: "pattern-lab", label: "Pattern Lab", file: "pattern-lab.js", category: "Labs & Tools" },
    { id: "swr-lab", label: "SWR Lab", file: "swr-lab.js", category: "Labs & Tools" },

    // Docs
    { id: "quick-start", label: "Quick Start Guide", file: "quick-start.js", category: "Documentation" },
    { id: "user-manual", label: "User Manual", file: "user-manual.js", category: "Documentation" },
    { id: "glossary", label: "Glossary", file: "glossary.js", category: "Documentation" }
];

// ---------------------------------------------------------------------------
// PATH BUILDER — THIS IS THE FIX
// ---------------------------------------------------------------------------
// All modules live in the repo root, so we import them using "../".
// This guarantees correct imports regardless of how many modules you add.

function modulePath(file) {
    return `../${file}`;
}

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

        if (module.init) {
            module.init({ PlotEngine, container: content });
        } else if (module.default) {
            module.default({ PlotEngine, container: content });
        } else {
            content.innerHTML += `<p><em>Module loaded (no init function).</em></p>`;
        }
    } catch (err) {
        console.error(err);
        content.innerHTML = `<h2>Error</h2><p>Failed to load ${mod.file}</p>`;
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
