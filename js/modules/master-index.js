/* ---------------------------------------------------------
   Antenna Workbench — Master Antenna Index (Full Suite)
   Features:
   1) Left-side navigation panel
   2) Search / filter across all antennas
   3) Icons per category
   4) Collapsible categories
   5) Recently used antennas list
   6) Compare Antennas panel (select two, load sequentially)
--------------------------------------------------------- */

const ANTENNA_CATEGORIES = [
    {
        id: "dipoles",
        label: "Dipoles & Multiband Wires",
        icon: "🎸",
        items: [
            { id: "hf-fan-dipole", label: "Fan Dipole" },
            { id: "hf-multiband-dipole", label: "Multiband Dipole" },
            { id: "hf-ocf-dipole", label: "OCF Dipole" },
            { id: "hf-doublet", label: "Doublet (Ladder-line)" },
            { id: "hf-extended-double-zepp", label: "Extended Double Zepp" },
            { id: "hf-random-wire", label: "Random Wire" },
            { id: "hf-efhw", label: "EFHW (49:1)" },
            { id: "hf-rybakov", label: "Rybakov Vertical Wire" }
        ]
    },
    {
        id: "loops",
        label: "Loops",
        icon: "🌀",
        items: [
            { id: "hf-horizontal-loop", label: "Horizontal Loop / Skywire" },
            { id: "hf-fullwave-loop", label: "Full-Wave Loop" },
            { id: "hf-vertical-delta-loop", label: "Vertical Delta Loop" },
            { id: "hf-quad-loop", label: "Quad Loop (Single Element)" }
        ]
    },
    {
        id: "verticals",
        label: "Verticals",
        icon: "📡",
        items: [
            { id: "hf-quarter-wave-vertical", label: "1/4-Wave Vertical" },
            { id: "hf-half-wave-vertical", label: "1/2-Wave Vertical" },
            { id: "hf-five-eighths-vertical", label: "5/8-Wave Vertical" },
            { id: "hf-loaded-vertical", label: "Loaded Vertical" },
            { id: "hf-trap-vertical", label: "Trap Vertical" },
            { id: "hf-multiband-vertical", label: "Multiband Vertical" },
            { id: "hf-dx-commander", label: "DX Commander Style Vertical" },
            { id: "hf-passive-radiator-vertical", label: "Passive Radiator Vertical" }
        ]
    },
    {
        id: "beams",
        label: "Beams",
        icon: "🎯",
        items: [
            { id: "hf-moxon", label: "Moxon Rectangle" },
            { id: "hf-hexbeam", label: "Hexbeam" }
        ]
    },
    {
        id: "arrays",
        label: "Arrays",
        icon: "🧬",
        items: [
            { id: "hf-lazy-h", label: "Lazy-H" },
            { id: "hf-sterba-curtain", label: "Sterba Curtain" },
            { id: "hf-bobtail-curtain", label: "Bobtail Curtain" },
            { id: "hf-2el-vertical-array", label: "2-Element Vertical Array" },
            { id: "hf-phased-verticals", label: "Phased Verticals" }
        ]
    },
    {
        id: "nvis",
        label: "NVIS Antennas",
        icon: "🌌",
        items: [
            { id: "hf-nvis-dipole", label: "NVIS Dipole" },
            { id: "hf-nvis-inverted-v", label: "NVIS Inverted-V" },
            { id: "hf-nvis-loop", label: "NVIS Loop" },
            { id: "hf-nvis-reflector", label: "NVIS Reflector Panels" }
        ]
    },
    {
        id: "designers",
        label: "Designers & Calculators",
        icon: "🛠️",
        items: [
            { id: "vertical-designer", label: "Vertical Designer" },
            { id: "doublet-designer", label: "Doublet Designer" },
            { id: "nvis-designer", label: "NVIS Designer" },
            { id: "feedline-calculator", label: "Feedline Calculator" },
            { id: "dx-propagation", label: "DX Propagation Tool" }
        ]
    }
];

const RECENT_KEY = "antennaWorkbench_recentAntennas_v1";
const MAX_RECENT = 8;

function loadRecent() {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
}

function saveRecent(list) {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
    } catch {
        // ignore
    }
}

function addRecent(id, label) {
    const current = loadRecent();
    const filtered = current.filter(item => item.id !== id);
    filtered.unshift({ id, label });
    saveRecent(filtered);
}

function findItemById(id) {
    for (const cat of ANTENNA_CATEGORIES) {
        const found = cat.items.find(i => i.id === id);
        if (found) return { category: cat, item: found };
    }
    return null;
}

export default function initMasterIndex(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool master-layout">
            <aside class="nav-panel">
                <h2>Antenna Workbench</h2>
                <div class="search-block">
                    <label>
                        <span>Search</span>
                        <input id="aw-search" type="text" placeholder="Type to filter antennas...">
                    </label>
                </div>

                <div class="nav-section">
                    <h3>Categories</h3>
                    <ul id="aw-category-list"></ul>
                </div>

                <div class="nav-section">
                    <h3>Recently Used</h3>
                    <ul id="aw-recent-list" class="recent-list"></ul>
                </div>

                <div class="nav-section">
                    <h3>Compare Antennas</h3>
                    <div class="compare-block">
                        <label>First
                            <select id="aw-compare-a">
                                <option value="">(select)</option>
                            </select>
                        </label>
                        <label>Second
                            <select id="aw-compare-b">
                                <option value="">(select)</option>
                            </select>
                        </label>
                        <button id="aw-compare-run">Load Both</button>
                    </div>
                </div>
            </aside>

            <main class="content-panel">
                <h2>Antenna Index</h2>
                <p>Select any antenna or tool from the list below, or use the left navigation.</p>

                <div id="aw-category-panels"></div>
            </main>
        </section>
    `;

    applyMasterStyles();

    const searchInput = container.querySelector("#aw-search");
    const categoryList = container.querySelector("#aw-category-list");
    const recentList = container.querySelector("#aw-recent-list");
    const categoryPanels = container.querySelector("#aw-category-panels");
    const compareA = container.querySelector("#aw-compare-a");
    const compareB = container.querySelector("#aw-compare-b");
    const compareRun = container.querySelector("#aw-compare-run");

    // Build category list in nav
    ANTENNA_CATEGORIES.forEach(cat => {
        const li = document.createElement("li");
        li.innerHTML = `
            <button class="nav-cat-btn" data-target="${cat.id}">
                <span class="icon">${cat.icon}</span>
                <span class="label">${cat.label}</span>
            </button>
        `;
        categoryList.appendChild(li);
    });

    // Build compare dropdowns
    ANTENNA_CATEGORIES.forEach(cat => {
        cat.items.forEach(item => {
            const optA = document.createElement("option");
            optA.value = item.id;
            optA.textContent = `${item.label}`;
            compareA.appendChild(optA);

            const optB = document.createElement("option");
            optB.value = item.id;
            optB.textContent = `${item.label}`;
            compareB.appendChild(optB);
        });
    });

    // Build category panels (collapsible)
    ANTENNA_CATEGORIES.forEach(cat => {
        const section = document.createElement("section");
        section.className = "index-category";
        section.dataset.categoryId = cat.id;

        section.innerHTML = `
            <header class="index-category-header">
                <button class="collapse-toggle" data-cat="${cat.id}" aria-expanded="true">
                    <span class="icon">${cat.icon}</span>
                    <span class="label">${cat.label}</span>
                    <span class="chevron">▾</span>
                </button>
            </header>
            <div class="index-category-body">
                <ul class="index-list">
                    ${cat.items.map(item => `
                        <li>
                            <button class="index-item-btn" data-module="${item.id}">
                                <span class="item-label">${item.label}</span>
                            </button>
                        </li>
                    `).join("")}
                </ul>
            </div>
        `;

        categoryPanels.appendChild(section);
    });

    // Wire up category nav buttons (scroll to section)
    categoryList.querySelectorAll(".nav-cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const section = categoryPanels.querySelector(`section[data-category-id="${targetId}"]`);
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Wire up collapsible headers
    categoryPanels.querySelectorAll(".collapse-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const catId = btn.getAttribute("data-cat");
            const section = categoryPanels.querySelector(`section[data-category-id="${catId}"]`);
            if (!section) return;
            const body = section.querySelector(".index-category-body");
            const chevron = btn.querySelector(".chevron");
            const expanded = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", expanded ? "false" : "true");
            if (expanded) {
                body.style.display = "none";
                if (chevron) chevron.textContent = "▸";
            } else {
                body.style.display = "";
                if (chevron) chevron.textContent = "▾";
            }
        });
    });

    // Wire up item buttons (load modules)
    categoryPanels.querySelectorAll(".index-item-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const moduleName = btn.getAttribute("data-module");
            const label = btn.querySelector(".item-label")?.textContent || moduleName;
            loadModule(moduleName, root);
            addRecent(moduleName, label);
            renderRecent(recentList, root);
        });
    });

    // Search / filter
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        filterItems(categoryPanels, query);
    });

    // Compare: load A then B
    compareRun.addEventListener("click", () => {
        const a = compareA.value;
        const b = compareB.value;
        if (!a || !b || a === b) {
            alert("Select two different antennas to compare.");
            return;
        }
        loadModule(a, root);
        setTimeout(() => {
            loadModule(b, root);
        }, 200);
        const aInfo = findItemById(a);
        const bInfo = findItemById(b);
        if (aInfo) addRecent(aInfo.item.id, aInfo.item.label);
        if (bInfo) addRecent(bInfo.item.id, bInfo.item.label);
        renderRecent(recentList, root);
    });

    // Initial recent render
    renderRecent(recentList, root);
}

function filterItems(categoryPanels, query) {
    const sections = categoryPanels.querySelectorAll(".index-category");
    sections.forEach(section => {
        const items = section.querySelectorAll(".index-item-btn");
        let anyVisible = false;
        items.forEach(btn => {
            const label = btn.querySelector(".item-label")?.textContent.toLowerCase() || "";
            const match = !query || label.includes(query);
            btn.closest("li").style.display = match ? "" : "none";
            if (match) anyVisible = true;
        });
        section.style.display = anyVisible ? "" : "none";
    });
}

function renderRecent(recentList, root) {
    recentList.innerHTML = "";
    const recent = loadRecent();
    if (!recent.length) {
        const li = document.createElement("li");
        li.textContent = "(none yet)";
        recentList.appendChild(li);
        return;
    }
    recent.forEach(entry => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = entry.label;
        btn.addEventListener("click", () => {
            loadModule(entry.id, root);
        });
        li.appendChild(btn);
        recentList.appendChild(li);
    });
}

function loadModule(moduleName, root) {
    import(`./${moduleName}.js`).then(mod => {
        if (typeof mod.default === "function") {
            mod.default(root);
        }
    }).catch(err => {
        console.error("Failed to load module", moduleName, err);
        alert(`Failed to load module: ${moduleName}`);
    });
}

function applyMasterStyles() {
    const css = `
        .master-layout {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 1rem;
        }
        .nav-panel {
            border-right: 1px solid #ccc;
            padding-right: 1rem;
        }
        .nav-panel h2 {
            margin-top: 0;
        }
        .search-block label {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.9rem;
        }
        .search-block input {
            padding: 0.25rem 0.4rem;
        }
        .nav-section {
            margin-top: 1rem;
        }
        .nav-section h3 {
            margin-bottom: 0.25rem;
            font-size: 0.95rem;
        }
        #aw-category-list,
        #aw-recent-list {
            list-style: none;
            padding-left: 0;
            margin: 0;
        }
        #aw-category-list li,
        #aw-recent-list li {
            margin-bottom: 0.25rem;
        }
        .nav-cat-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.25rem 0.4rem;
            font-size: 0.9rem;
        }
        .nav-cat-btn .icon {
            width: 1.4rem;
            text-align: center;
        }
        .recent-list button {
            width: 100%;
            text-align: left;
            padding: 0.2rem 0.4rem;
            font-size: 0.85rem;
        }
        .compare-block {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        .compare-block label {
            display: flex;
            flex-direction: column;
            font-size: 0.85rem;
        }
        .compare-block select {
            padding: 0.2rem 0.3rem;
        }
        .compare-block button {
            margin-top: 0.25rem;
            padding: 0.3rem 0.5rem;
            font-size: 0.85rem;
        }
        .content-panel h2 {
            margin-top: 0;
        }
        .index-category {
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 0.75rem;
        }
        .index-category-header {
            background: #f7f7f7;
            padding: 0.25rem 0.5rem;
        }
        .collapse-toggle {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            font-size: 0.95rem;
        }
        .collapse-toggle .icon {
            margin-right: 0.25rem;
        }
        .index-category-body {
            padding: 0.4rem 0.6rem 0.6rem;
        }
        .index-list {
            list-style: none;
            padding-left: 0;
            margin: 0;
        }
        .index-list li {
            margin-bottom: 0.25rem;
        }
        .index-item-btn {
            width: 100%;
            text-align: left;
            padding: 0.25rem 0.4rem;
            font-size: 0.9rem;
        }
        @media (max-width: 800px) {
            .master-layout {
                grid-template-columns: 1fr;
            }
            .nav-panel {
                border-right: none;
                border-bottom: 1px solid #ccc;
                padding-bottom: 0.75rem;
                margin-bottom: 0.75rem;
            }
        }
    `;
    if (!document.getElementById("aw-master-index-style")) {
        const style = document.createElement("style");
        style.id = "aw-master-index-style";
        style.textContent = css;
        document.head.appendChild(style);
    }
}
