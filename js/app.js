// ============================================================
// HF Antenna Designer — App Router (Browser Safe)
// ============================================================

import { modules } from "./master-index.js";

const sidebarItems = document.querySelectorAll(".menu-item");
const content = document.getElementById("content");

function loadModule(id) {
    const mod = modules[id];

    if (!mod) {
        content.innerHTML = `
            <h2>Module Not Found</h2>
            <p>ID: <b>${id}</b></p>
        `;
        console.error("Module not found:", id, modules);
        return;
    }

    content.innerHTML = "";
    mod.default(content);
}

sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
        sidebarItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        const id = item.dataset.module;
        loadModule(id);
    });
});
