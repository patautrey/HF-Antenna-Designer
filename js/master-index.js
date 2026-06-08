// ============================================================
// HF Antenna Designer — Master Module Index (Browser Safe)
// ============================================================

// This object will hold all modules
export const modules = {};

// Dynamically load every JS file inside /js/modules/
async function loadAllModules() {
    try {
        const response = await fetch("./js/modules/modules.json");
        const fileList = await response.json();

        for (const file of fileList) {
            const path = `./modules/${file}`;
            try {
                const mod = await import(path);

                const id = file.replace(".js", "");
                modules[id] = mod;

            } catch (err) {
                console.error("Failed to import:", path, err);
            }
        }

        console.log("Modules loaded:", Object.keys(modules));

    } catch (err) {
        console.error("Failed to load modules.json", err);
    }
}

await loadAllModules();
