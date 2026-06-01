// js/master-index.js
// HF Antenna Designer — Master Router & UI
// Uses your existing antenna modules; no renaming required.

import { PlotEngine } from "./plot-engine.js";

// ---------------------------------------------------------------------------
// MODULE MANIFEST
// ---------------------------------------------------------------------------
// This is the only place you "register" modules for the UI.
// Paths match the filenames you already have in your repo listing.

const MODULES = [
    // Horizontal / loops / dipoles
    { id: "doublet",        label: "HF Doublet Designer",        category: "Horizontal",   path: "./doublet-designer.js" },
    { id: "skyloop",        label: "Skyloop Designer",           category: "Horizontal",   path: "./skyloop-designer.js" },
    { id: "loop",           label: "Horizontal Loop Designer",   category: "Horizontal",   path: "./loop-designer.js" },
    { id: "fullwave-loop",  label: "Fullwave Loop Designer",     category: "Horizontal",   path: "./fullwave-loop-designer.js" },
    { id: "horizontal-loop",label: "HF Horizontal Loop",         category: "Horizontal",   path: "./horizontal-loop-designer.js" },
    { id: "fan-dipole",     label: "Fan Dipole Designer",        category: "Horizontal",   path: "./fan-dipole-designer.js" },
    { id: "nvis-dipole",    label: "NVIS Dipole Designer",       category: "Horizontal",   path: "./nvis-dipole-designer.js" },
    { id: "ocf-dipole",     label: "OCF Dipole Designer",        category: "Horizontal",   path: "./ocf-dipole-designer.js" },

    // Verticals
    { id: "vertical-dx",    label: "Vertical DX Designer",       category: "Vertical",     path: "./vertical-dx-designer.js" },
    { id: "vertical-nvis",  label: "Vertical NVIS Designer",     category: "Vertical",     path: "./vertical-nvis-designer.js" },
    { id: "vertical",       label: "General Vertical Designer",  category: "Vertical",     path: "./vertical-designer.js" },
    { id: "quarterwave",    label: "Quarter-wave Vertical",      category: "Vertical",     path: "./quarterwave-designer.js" },
    { id: "58wave",         label: "5/8-wave Vertical",          category: "Vertical",     path: "./58wave-designer.js" },
    { id: "vertical-array-2el", label: "Vertical Array 2el",     category: "Vertical",     path: "./vertical-array-2el-designer.js" },
    { id: "vertical-array-3el", label: "Vertical Array 3el",     category: "Vertical",     path: "./vertical-array-3el-designer.js" },
    { id: "rybakov",        label: "Rybakov Vertical Designer",  category: "Vertical",     path: "./rybakov-designer.js" },

    // Arrays / beams / quads
    { id: "yagi",           label: "Yagi Designer",              category: "Arrays & Beams", path: "./yagi-designer.js" },
    { id: "lpda",           label: "LPDA Designer",              category: "Arrays & Beams", path: "./lpda-designer.js" },
    { id: "quad",           label: "Quad Designer",              category: "Arrays & Beams", path: "./quad-designer.js" },
    { id: "moxon",          label: "Moxon Designer",             category: "Arrays & Beams", path: "./moxon-designer.js" },
    { id: "curtain",        label: "Curtain Array Designer",     category: "Arrays & Beams", path: "./curtainarray-designer.js" },
    { id: "rhombic",        label: "Rhombic Designer",           category: "Arrays & Beams", path: "./rhombic-designer.js" },
    { id: "sterba",         label: "Sterba Curtain Designer",    category: "Arrays & Beams", path: "./sterba-designer.js" },
    { id: "vbeam",          label: "V-Beam Designer",            category: "Arrays & Beams", path: "./vbeam-designer.js" },
    { id: "foursquare",     label: "Foursquare Designer",        category: "Arrays & Beams", path: "./foursquare-designer.js" },
    { id: "bobtail",        label: "Bobtail Curtain Designer",   category: "Arrays & Beams", path: "./bobtail-designer.js" },

    // End-fed / EFHW / random wire
    { id: "efhw",           label: "EFHW Designer",              category: "End-Fed & Random", path: "./efhw-designer.js" },
    { id: "efhw-lab",       label: "EFHW Lab",                   category: "End-Fed & Random", path: "./efhw-lab.js" },
    { id: "randomwire",     label: "Random Wire Designer",       category: "End-Fed & Random", path: "./randomwire-designer.js" },
    { id: "terminated-dipole", label: "Terminated Dipole",       category: "End-Fed & Random", path: "./terminated-dipole.js" },
    { id: "hf-randomwire-9to1", label: "Random Wire 9:1",        category: "End-Fed & Random", path: "./hf-random-wire-9to1.js" },

    // Long wires / beverages
    { id: "beverage",       label: "Beverage Designer",          category: "Long Wire & Beverage", path: "./beverage-designer.js" },
    { id: "hf-beverage",    label: "HF Beverage",                category: "Long Wire & Beverage", path: "./hf-beverage.js" },
    { id: "hf-beverage-reverse-fed", label: "HF Beverage Reverse-fed", category: "Long Wire & Beverage", path: "./hf-beverage-reverse-fed.js" },
    { id: "hf-longwire",    label: "HF Longwire",                category: "Long Wire & Beverage", path: "./hf-longwire.js" },
    { id: "hf-sloping-longwire-directional", label: "Sloping Longwire Directional", category: "Long Wire & Beverage", path: "./hf-sloping-longwire-directional.js" },

    // Labs & tools
    { id: "feedline-lab",   label: "Feedline Lab",               category: "Labs & Tools",  path: "./coax-lab.js" },
    { id: "ground-lab",     label: "Ground Lab",                 category: "Labs & Tools",  path: "./ground-lab.js" },
    { id: "ground-loss-lab",label: "Ground Loss Lab",            category: "Labs & Tools",  path: "./ground-loss-lab.js" },
    { id: "pattern-lab",    label: "Pattern Lab",                category: "Labs & Tools",  path: "./pattern-lab.js" },
    { id: "swr-lab",        label: "SWR Lab",                    category: "Labs & Tools",  path: "./swr-lab.js" },
    { id: "noise-lab",      label: "Noise Lab",                  category: "Labs & Tools",  path: "./noise-lab.js" },
    { id: "noise-snr-lab",  label: "Noise SNR Lab",              category: "Labs & Tools",  path: "./noise-snr-lab.js" },
    { id: "link-budget",    label: "Link Budget",                category: "Labs & Tools",  path: "./link-budget.js" },
    { id: "loss-budget",    label: "Loss Budget",                category: "Labs & Tools",  path: "./loss-budget.js" },
    { id: "propagation",    label: "Propagation Explorer",       category: "Labs & Tools",  path: "./propagation.js" },
    { id: "muf-luf",        label: "MUF/LUF Explorer",           category: "Labs & Tools",  path: "./muf-luf-explorer.js" },
    { id: "system-gain",    label: "System Gain",                category: "Labs & Tools",  path: "./system-gain.js" },
    { id: "rf-safety",      label: "RF Safety",                  category: "Labs & Tools",  path: "./rf-safety.js" },

    // Docs
    { id: "quick-start",    label: "Quick Start Guide",          category: "Documentation", path: "./quick-start.js" },
    { id: "user-manual",    label: "User Manual",                category: "Documentation", path: "./user-manual.js" },
    { id: "glossary",       label: "Glossary",                   category: "Documentation", path: "./glossary.js" }
];

// ---------------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------------

const state = {
    currentModuleId: null
};

// ---------------------------------------------------------------------------
// DOM HELPERS
// ---------------------------------------------------------------------------

function $(id) {
    return document.getElementById(id);
}

// ---------------------------------------------------------------------------
// SIDEBAR RENDERING
// ---------------------------------------------------------------------------

function groupByCategory(modules) {
    const map = new Map();
    modules.forEach(m => {
        if (!map.has(m.category)) map.set(m.category, []);
        map.get(m.category).push(m);
    });
    return map;
}

function renderSidebar() {
    const sidebar = $("sidebar");
    if (!sidebar) return;

    sidebar.innerHTML = "";

    // Search box
    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.placeholder = "Search modules…";
    searchBox.style.width = "100%";
    searchBox.style.marginBottom = "0.75rem";
    searchBox.style.padding = "0.3rem";
    searchBox.style.background = "#111";
    searchBox.style.border = "1px solid #444";
    searchBox.style.color = "#eee";
    searchBox.addEventListener("input", () => {
        renderModuleList(searchBox.value.trim().toLowerCase());
    });
    sidebar.appendChild(searchBox);

    // Container for module list
    const listContainer = document.createElement("div");
    listContainer.id = "sidebar-module-list";
    sidebar.appendChild(listContainer);

    renderModuleList("");
}

function renderModuleList(filterText) {
    const listContainer = $("sidebar-module-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const filtered = MODULES.filter(m =>
        m.label.toLowerCase().includes(filterText) ||
        m.category.toLowerCase().includes(filterText)
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
            item.dataset.moduleId = mod.id;

            item.addEventListener("click", () => {
                loadModuleById(mod.id);
            });

            section.appendChild(item);
        });

        listContainer.appendChild(section);
    });
}

// ---------------------------------------------------------------------------
// MODULE LOADING
// ---------------------------------------------------------------------------

async function loadModuleById(id) {
    const mod = MODULES.find(m => m.id === id);
    if (!mod) {
        renderError(`Module not found: ${id}`);
        return;
    }

    state.currentModuleId = id;
    updateLocationHash(id);

    const content = $("content");
    if (!content) return;

    content.innerHTML = `<h2>${mod.label}</h2><p>Loading module…</p>`;

    try {
        const module = await import(mod.path);

        // Clear any existing plot
        PlotEngine.clearPlot();

        // Convention: each designer may export init({ PlotEngine }) or default({ PlotEngine })
        if (typeof module.init === "function") {
            await module.init({ PlotEngine, container: content });
        } else if (typeof module.default === "function") {
            await module.default({ PlotEngine, container: content });
        } else {
            // If the module just writes to #content on its own, that's fine.
            content.innerHTML += `<p><em>Module loaded. No init() or default() function detected; assuming self-rendering.</em></p>`;
        }
    } catch (err) {
        console.error(err);
        renderError(`Failed to load module: ${mod.label}`);
    }
}

function renderError(message) {
    const content = $("content");
    if (!content) return;
    content.innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
        <p>Check the browser console for more details.</p>
    `;
}

// ---------------------------------------------------------------------------
// URL HASH HANDLING
// ---------------------------------------------------------------------------

function updateLocationHash(id) {
    if (!id) return;
    if (location.hash !== `#${id}`) {
        history.replaceState(null, "", `#${id}`);
    }
}

function handleInitialHash() {
    const hash = location.hash.replace("#", "").trim();
    if (!hash) return;

    const mod = MODULES.find(m => m.id === hash);
    if (mod) {
        loadModuleById(hash);
    }
}

window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "").trim();
    if (!hash) return;
    loadModuleById(hash);
});

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

function initApp() {
    renderSidebar();
    handleInitialHash();

    const content = $("content");
    if (content && !location.hash) {
        content.innerHTML = `
            <h2>Welcome to HF Antenna Designer</h2>
            <p>Select an antenna module from the sidebar to begin.</p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", initApp);
