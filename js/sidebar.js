/* ============================================================
   HF Antenna Designer — Sidebar Navigation Engine
   ============================================================ */

import Router from "./router.js";

const Sidebar = {

    categories: [
        {
            label: "Standard Verticals",
            items: [
                { name: "Quarter‑Wave Vertical", module: "vertical-quarterwave" },
                { name: "Half‑Wave Vertical", module: "vertical-halfwave" },
                { name: "5/8‑Wave Vertical", module: "vertical-fiveeighths" },
                { name: "No‑Radial Vertical", module: "vertical-noradial" }
            ]
        },
        {
            label: "Loaded Verticals",
            items: [
                { name: "Loaded Vertical", module: "vertical-loaded" },
                { name: "Base‑Loaded", module: "vertical-baseloaded" },
                { name: "Center‑Loaded", module: "vertical-centerloaded" },
                { name: "Top‑Loaded", module: "vertical-toploaded" },
                { name: "Slinky Vertical", module: "vertical-slinky" }
            ]
        },
        {
            label: "Vertical Yagis",
            items: [
                { name: "2‑Element Vertical Yagi", module: "vertical-yagi2" },
                { name: "3‑Element Vertical Yagi", module: "vertical-yagi3" },
                { name: "Vertical Moxon", module: "vertical-moxon" }
            ]
        },
        {
            label: "Vertical Arrays",
            items: [
                { name: "2‑Element Phased Array", module: "vertical-array2" },
                { name: "4‑Square Array", module: "vertical-array4square" },
                { name: "Broadside Array", module: "vertical-broadside" },
                { name: "End‑Fire Array", module: "vertical-endfire" }
            ]
        },
        {
            label: "Vertical Loops",
            items: [
                { name: "Delta Loop", module: "vertical-deltaloop" },
                { name: "Square Loop", module: "vertical-squareloop" },
                { name: "Vertical Loop Beam", module: "vertical-loopbeam" }
            ]
        },
        {
            label: "Specialty Verticals",
            items: [
                { name: "41' Vertical", module: "vertical-41ft" },
                { name: "70% DX Vertical", module: "vertical-70percent" },
                { name: "Rybakov Vertical", module: "vertical-rybakov" },
                { name: "Dominator Vertical", module: "vertical-dominator" },
                { name: "Performer Vertical", module: "vertical-performer" },
                { name: "Fold‑Over Vertical", module: "vertical-foldover" },
                { name: "End‑Fed Vertical", module: "vertical-endfed" },
                { name: "No‑Radial Specialty", module: "vertical-special-noradial" },
                { name: "Vertical Dipole", module: "vertical-dipole" }
            ]
        }
    ],

    renderSidebar() {
        const sidebar = document.getElementById("sidebar");
        if (!sidebar) return;

        sidebar.innerHTML = "";

        this.categories.forEach(cat => {
            const section = document.createElement("div");
            section.className = "sidebar-section";

            const title = document.createElement("div");
            title.className = "sidebar-title";
            title.textContent = cat.label;
            section.appendChild(title);

            cat.items.forEach(item => {
                const btn = document.createElement("div");
                btn.className = "sidebar-item";
                btn.textContent = item.name;
                btn.dataset.module = item.module;
                section.appendChild(btn);
            });

            sidebar.appendChild(section);
        });

        this.bindSidebarEvents();
    },

    bindSidebarEvents() {
        const items = document.querySelectorAll(".sidebar-item");

        items.forEach(item => {
            item.addEventListener("click", () => {
                const moduleName = item.dataset.module;

                document.querySelectorAll(".sidebar-item")
                    .forEach(i => i.classList.remove("active"));

                item.classList.add("active");

                Router.navigate(moduleName);
            });
        });
    }
};

export default Sidebar;
