// js/master-index.js
// HF Antenna Designer — Master Router & UI
// Uses existing antenna modules; no changes required to them.

import { PlotEngine } from "./plot-engine.js";

// ---- MODULE MANIFEST ------------------------------------------------------
// You can extend this list over time. Start with key designers;
// add more entries as you go. No need to rename existing files.

const MODULES = [
    // Horizontal / loops / dipoles
    { id: "doublet",        label: "HF Doublet Designer",        category: "Horizontal",   path: "./doublet-designer.js" },
    { id: "skyloop",        label: "Skyloop Designer",           category: "Horizontal",   path: "./skyloop-designer.js" },
    { id: "loop",           label: "Horizontal Loop Designer",   category: "Horizontal",   path: "./loop-designer.js" },
    { id: "fullwave-loop",  label: "Fullwave Loop Designer",     category: "Horizontal",   path: "./fullwave-loop-designer.js" },
    { id: "delta-loop",     label: "Delta Loop Designer",        category: "Horizontal",   path: "./hf-delta-loop.js" },

    // Verticals
    { id: "vertical-dx",    label: "Vertical DX Designer",       category: "Vertical",     path: "./vertical-dx-designer.js" },
    { id: "vertical-nvis",  label: "Vertical NVIS Designer",     category: "Vertical",     path: "./vertical-nvis-designer.js" },
    { id: "quarterwave",    label: "Quarter-wave Vertical",      category: "Vertical",     path: "./quarterwave-designer.js" },
    { id: "5-8wave",        label: "5/8-wave Vertical",          category: "Vertical",     path: "./58wave-designer.js" },

    // Arrays / beams
    { id: "yagi",           label: "Yagi Designer",              category: "Arrays & Beams", path: "./yagi-designer.js" },
    { id: "quad",           label: "Quad Designer",              category: "Arrays & Beams", path: "./quad-designer.js" },
    { id: "curtain",        label: "Curtain Array Designer",     category: "Arrays & Beams", path: "./curtainarray-designer.js" },
    { id: "bobtail",        label: "Bobtail Curtain Designer",   category: "Arrays & Beams", path: "./bobtail-designer.js" },
    { id: "vertical-array-2el", label: "Vertical Array 2el",     category: "Arrays & Beams", path: "./vertical-array-2el-designer.js" },

    // End-fed / EFHW / random wire
    { id: "efhw",           label: "EFHW Designer",              category: "End-Fed & Random", path: "./efhw-designer.js" },
    { id: "randomwire",     label: "Random Wire Designer",       category: "End-Fed & Random", path: "./randomwire-designer.js" },
    { id: "ocf-dipole",     label: "OCF Dipole Designer",        category: "End-Fed & Random", path: "./ocf-dipole-designer.js" },

    // Beverages / long wires
    { id: "beverage",       label: "Beverage Designer",          category: "Long Wire & Beverage", path: "./beverage-designer.js" },
    { id: "longwire",       label: "Longwire Designer",          category: "Long Wire & Beverage", path: "./hf-longwire.js" },

    // Labs & tools
    { id: "feedline-lab",   label: "Feedline Lab",               category: "Labs & Tools",  path: "./coax-lab.js" },
    { id: "ground-lab",     label: "Ground Lab",                 category: "Labs & Tools",  path: "./ground-lab.js" },
    { id: "pattern-lab",    label: "Pattern Lab",                category: "Labs & Tools",  path: "./pattern-lab.js" },
    { id: "swr-lab",        label: "SWR Lab",                    category: "Labs & Tools",  path: "./swr-lab.js" },
    { id: "link-budget",    label: "Link Budget",                category: "Labs & Tools",  path: "./link-budget.js" },
    { id: "propagation",    label: "Propagation Explorer",       category: "Labs & Tools",  path: "./propagation.js" },
    { id: "rf-safety",      label: "RF Safety",                  category: "Labs & Tools",  path: "./rf-safety.js" },

    // Docs
    { id: "quick-start",    label: "Quick Start Guide",          category: "Documentation", path: "./quick-start.js" },
    { id: "user-manual",    label: "User Manual",                category: "Documentation", path: "./user-manual.js" },
    { id: "glossary",       label: "Glossary",                   category: "Documentation", path: "./glossary.js" }
];

// ---- STATE -----------------------------------------------------------------

const state = {
    currentModuleId: null,
    favorites: new Set()
};

// ---- DOM HELPERS -----------------------------------------------------------

function $(id) {
    return document.getElementById(id);
}

// ---- SIDEBAR RENDERING -----------------------------------------------------

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

// ---- MODULE LOADING --------------------------------------------------------

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

        // Convention: each designer exports an init function
        if (typeof module.init === "function") {
            await module.init({ PlotEngine });
        } else if (typeof module.default === "function") {
            await module.default({ PlotEngine });
        } else {
            content.innerHTML += `<p><em>Module loaded, but no init() or default() function was found.</em></p>`;
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
        <p>Check the console for more details.</p>
    `;
}

// ---- URL HASH HANDLING -----------------------------------------------------

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

// ---- INIT ------------------------------------------------------------------

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
