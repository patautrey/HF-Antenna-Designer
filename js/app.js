// ============================================================
// HF Antenna Designer — Core Application Router
// Clean, stable, category‑friendly, Passive‑Vertical‑Designer style
// ============================================================

// Import ALL modules automatically via master-index.js
// This file should export an object: { "module-id": moduleFunction, ... }
import modules from "./master-index.js";

export default function initWorkbench() {

    const content = document.getElementById("content");
    const menuItems = document.querySelectorAll(".menu-item");

    // ------------------------------------------------------------
    // Load a module by ID
    // ------------------------------------------------------------
    function loadModule(id) {
        const mod = modules[id];

        if (!mod) {
            content.innerHTML = `
                <h2>Module Not Found</h2>
                <p>No module exists with ID: <strong>${id}</strong></p>
            `;
            return;
        }

        // Render module into content area
        mod(content);

        // Highlight active menu item
        menuItems.forEach(item => item.classList.remove("active"));
        const active = document.querySelector(`[data-module="${id}"]`);
        if (active) active.classList.add("active");
    }

    // ------------------------------------------------------------
    // Attach click handlers to sidebar items
    // ------------------------------------------------------------
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const id = item.dataset.module;
            loadModule(id);
        });
    });

    // ------------------------------------------------------------
    // Default startup module
    // ------------------------------------------------------------
    if (modules["vertical-designer"]) {
        loadModule("vertical-designer");
    } else {
        content.innerHTML = `<h2>Welcome</h2><p>Select a module from the sidebar.</p>`;
    }
}

// Initialize immediately
initWorkbench();
