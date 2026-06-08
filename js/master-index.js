// ============================================================
// HF Antenna Designer — Master Module Index (Full Corrected)
// ============================================================

// This object will hold all discovered modules
export const modules = {};

// Dynamically import every JS file inside /js/modules/
async function loadAllModules() {
    const moduleFiles = import.meta.glob("./modules/*.js");

    for (const path in moduleFiles) {
        try {
            const mod = await moduleFiles[path]();

            // Extract filename without path or extension
            const id = path
                .replace("./modules/", "")
                .replace(".js", "");

            // Store module under its ID
            modules[id] = mod;

        } catch (err) {
            console.error("Module failed to load:", path, err);
        }
    }

    console.log("Modules loaded:", Object.keys(modules));
}

// Load everything immediately
await loadAllModules();
