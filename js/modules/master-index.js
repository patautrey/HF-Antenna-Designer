/* ---------------------------------------------------------
   Antenna Workbench — Master Index (FULL VERSION)
   Includes:
   - All antennas (HF, verticals, loops, arrays, NVIS, specialty)
   - All designers & calculators
   - VHF/UHF Workbench entry
   - Full integration with ui-shell.js
--------------------------------------------------------- */

import { } from "../ui-shell.js"; // ensures shell is loaded

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

    // Load the UI shell (global)
    if (window.awAttachShell) {
        window.awAttachShell(root, "master-index", "Antenna Workbench");
    }

    // Build categories
    const categories = window.AW_CATEGORIES;
    const categoryList = container.querySelector("#aw-category-list");
    const categoryPanels = container.querySelector("#aw-category-panels");
    const searchInput = container.querySelector("#aw-search");
    const recentList = container.querySelector("#aw-recent-list");
    const compareA = container.querySelector("#aw-compare-a");
    const compareB = container.querySelector("#aw-compare-b");
    const compareRun = container.querySelector("#aw-compare-run");

    // Build category nav
    categories.forEach(cat => {
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
    categories.forEach(cat => {
        cat.items.forEach(item => {
            const optA = document.createElement("option");
            optA.value = item.id;
            optA.textContent = item.label;
            compareA.appendChild(optA);

            const optB = document.createElement("option");
            optB.value = item.id;
            optB.textContent = item.label;
            compareB.appendChild(optB);
        });
    });

    // Build category panels
    categories.forEach(cat => {
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

    // Category nav scroll
    categoryList.querySelectorAll(".nav-cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const section = categoryPanels.querySelector(`section[data-category-id="${targetId}"]`);
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Collapsible categories
    categoryPanels.querySelectorAll(".collapse-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const catId = btn.getAttribute("data-cat");
            const section = categoryPanels.querySelector(`section[data-category-id="${catId}"]`);
            const body = section.querySelector(".index-category-body");
            const chevron = btn.querySelector(".chevron");
            const expanded = btn.getAttribute("aria-expanded") === "true";

            btn.setAttribute("aria-expanded", expanded ? "false" : "true");
            body.style.display = expanded ? "none" : "";
            chevron.textContent = expanded ? "▸" : "▾";
        });
    });

    // Load modules
    categoryPanels.querySelectorAll(".index-item-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const moduleName = btn.getAttribute("data-module");
            const label = btn.querySelector(".item-label").textContent;
            window.awLoadModule(moduleName, root);
            window.awAddRecent(moduleName, label);
            window.awRenderRecent(recentList, root);
        });
    });

    // Search
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        window.awFilterItems(categoryPanels, query);
    });

    // Compare
    compareRun.addEventListener("click", () => {
        const a = compareA.value;
        const b = compareB.value;
        if (!a || !b || a === b) {
            alert("Select two different antennas to compare.");
            return;
        }
        window.awOpenSideBySide(a, b, root);
    });

    // Render recent
    window.awRenderRecent(recentList, root);
}
