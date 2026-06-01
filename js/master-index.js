// js/master-index.js
// HF Antenna Designer — Auto‑Discovery Router + Sidebar UI
// Automatically loads EVERY .js file inside /js/modules/

import { PlotEngine } from "./plot-engine.js";

// ---------------------------------------------------------------------------
// AUTO‑DISCOVERY OF MODULES
// ---------------------------------------------------------------------------
// GitHub Pages serves directory listings as HTML.
// We fetch the directory, parse out all .js filenames, and build the module list.

async function discoverModules() {
    const response = await fetch("./modules/");
    const html = await response.text();

    // Extract filenames ending in .js (skip .j files)
    const regex = /href="([^"]+\.js)"/g;
    const modules = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
        const file = match[1];

        // Skip master-index.js, plot-engine.js, etc.
        if (file.includes("master-index")) continue;
        if (file.includes("plot-engine")) continue;

        modules.push({
            id: file.replace(".js", ""),
            label: file.replace(".js", "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            file,
            category: categorize(file)
        });
    }

    return modules;
}

// ---------------------------------------------------------------------------
// CATEGORY DETECTION (simple but effective)
// ---------------------------------------------------------------------------

function categorize(file) {
    if (file.includes("designer")) return "Designers";
    if (file.includes("lab")) return "Labs";
    if (file.includes("hf-")) return "HF Antennas";
    if (file.includes("vertical")) return "Verticals";
    if (file.includes("loop")) return "Loops";
    if (file.includes("dipole")) return "Dipoles";
    if (file.includes("yagi") || file.includes("quad") || file.includes("beam")) return "Beams & Arrays";
    return "Other Modules";
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
// SIDEBAR RENDERING
// ---------------------------------------------------------------------------

function renderSidebar(modules) {
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
        renderModuleList(modules, search.value.toLowerCase());
    });

    sidebar.appendChild(search);

    const list = document.createElement("div");
    list.id = "module-list";
    sidebar.appendChild(list);

    renderModuleList(modules, "");
}

function renderModuleList(modules, filter) {
    const list = $("module-list");
    list.innerHTML = "";

    const filtered = modules.filter(m =>
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
        const module = await import(`./modules/${mod.file}`);

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
            <p>Failed to load: <code>./modules/${mod.file}</code></p>
        `;
    }
}

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    const modules = await discoverModules();
    renderSidebar(modules);

    $("content").innerHTML = `
        <h2>Welcome to HF Antenna Designer</h2>
        <p>Select an antenna module from the sidebar.</p>
    `;
});
