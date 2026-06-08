// ============================================================
// HF Antenna Designer — Module Validation Tool
// Run this in the browser console to verify module integrity
// ============================================================

(async function validateModules() {

    console.log("🔍 Validating HF Antenna Designer modules...");

    // 1. Discover all modules in /js/modules/
    const discovered = import.meta.glob("./modules/*.js");

    const discoveredIDs = Object.keys(discovered).map(path =>
        path.split("/").pop().replace(".js", "")
    );

    // 2. Collect all sidebar module IDs
    const sidebarItems = document.querySelectorAll(".menu-item");
    const sidebarIDs = [...sidebarItems].map(i => i.dataset.module);

    // 3. Find missing modules
    const missing = sidebarIDs.filter(id => !discoveredIDs.includes(id));

    // 4. Find unused modules
    const unused = discoveredIDs.filter(id => !sidebarIDs.includes(id));

    // 5. Find duplicates
    const duplicates = discoveredIDs.filter((id, idx, arr) =>
        arr.indexOf(id) !== idx
    );

    console.log("📁 Discovered modules:", discoveredIDs.length);
    console.log("📋 Sidebar modules:", sidebarIDs.length);

    if (missing.length) {
        console.warn("❌ Missing modules:", missing);
    } else {
        console.log("✅ No missing modules");
    }

    if (unused.length) {
        console.warn("⚠️ Unused modules:", unused);
    } else {
        console.log("✅ No unused modules");
    }

    if (duplicates.length) {
        console.error("❌ Duplicate module IDs:", duplicates);
    } else {
        console.log("✅ No duplicate modules");
    }

    console.log("✔ Validation complete");

})();
