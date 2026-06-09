/* ============================================================
   Application Core
   Provides: runSimulation()
   ============================================================ */

import { ENGINE_MAP } from "/engines/index.js";

export const app = {

    async runSimulation(config, targetId, callback) {

        const EngineClass = ENGINE_MAP[config.type];
        if (!EngineClass) {
            document.getElementById(targetId).innerHTML =
                "<p>Unknown engine type.</p>";
            return;
        }

        const engine = new EngineClass(config);
        const result = await engine.calculate();

        if (callback) {
            callback(result);
            return;
        }

        document.getElementById(targetId).innerHTML =
            `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    }
};
