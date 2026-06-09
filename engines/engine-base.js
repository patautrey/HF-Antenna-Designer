/* ============================================================
   HF Antenna Designer — NEC-Style Base Engine
   Hybrid JS + Web Workers Architecture
   ============================================================ */

export default class BaseEngine {

    constructor(config) {
        this.config = config;
        this.worker = new Worker("/engines/worker-engine.js");
    }

    async solve(geometry) {
        return new Promise((resolve, reject) => {

            this.worker.onmessage = (event) => {
                if (event.data.error) reject(event.data.error);
                else resolve(event.data);
            };

            this.worker.postMessage({
                type: "SOLVE",
                geometry,
                config: this.config
            });
        });
    }

    async computePattern(currents, geometry) {
        return new Promise((resolve, reject) => {

            this.worker.onmessage = (event) => {
                if (event.data.error) reject(event.data.error);
                else resolve(event.data.pattern);
            };

            this.worker.postMessage({
                type: "PATTERN",
                currents,
                geometry,
                config: this.config
            });
        });
    }

    async computeSWR(impedance) {
        const Z0 = this.config.feedImpedance || 50;
        const gamma = (impedance - Z0) / (impedance + Z0);
        return Math.abs((1 + gamma) / (1 - gamma));
    }
}
