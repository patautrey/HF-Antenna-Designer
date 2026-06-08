/* ============================================================
   HF Antenna Designer — Lazy‑Loading Router Engine
   ============================================================ */

import ModuleRegistry from "./modules.js";

const Router = {

    currentModule: null,

    async navigate(moduleName) {
        const path = ModuleRegistry.getModulePath(moduleName);
        if (!path) {
            console.error("Module not found:", moduleName);
            return;
        }

        this.currentModule = moduleName;
        await this.loadModule(path);
    },

    async loadModule(path) {
        try {
            const container = document.getElementById("main");
            if (container) container.innerHTML = "";

            const moduleFile = await import(path);
            if (!moduleFile || !moduleFile.default) {
                console.error("Invalid module:", path);
                return;
            }

            const moduleObj = moduleFile.default;

            if (typeof moduleObj.init === "function") {
                moduleObj.init(container);
            }

        } catch (err) {
            console.error("Error loading module:", path, err);
        }
    }
};

export default Router;
