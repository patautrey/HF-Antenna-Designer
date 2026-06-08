// ============================================================
// HF Antenna Designer — Automatic Module Discovery
// Scans /js/modules/ and loads every module dynamically
// ============================================================

// Scan all JS files inside /js/modules/
const moduleFiles = import.meta.glob("./modules/*.js");

// Build module map
const modules = {};

for (const path in moduleFiles) {
    // Extract filename: "./modules/vertical-designer.js" → "vertical-designer"
    const id = path
        .split("/")
        .pop()
        .replace(".js", "");

    // Lazy-load module when requested
    modules[id] = async (container) => {
        const mod = await moduleFiles[path]();
        mod.default(container);
    };
}

export default modules;
