/* ============================================================
   HF Antenna Designer — Vertical Yagi Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "./engine-base.js";
import BoostEngine from "./boost-engine.js";

export default class VerticalYagiEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            drivenLength,
            reflectorLength,
            directorLength,
            spacing,
            height,
            segments = 80,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        const addElement = (xOffset, length, isDriven) => {
            for (let i = 0; i < segments; i++) {
                const f1 = i / segments;
                const f2 = (i + 1) / segments;

                const z1 = height + f1 * length;
                const z2 = height + f2 * length;

                segList.push({
                    x1: xOffset, y1: 0, z1,
                    x2: xOffset, y2: 0, z2,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segments),
                    driven: isDriven
                });
            }
        };

        // Driven element
        addElement(0, drivenLength, true);

        // Reflector
        addElement(-spacing, reflectorLength, false);

        // Director
        addElement(+spacing, directorLength, false);

        const feedSegment = 0;

        let geometry = {
            type: "vertical-yagi",
            frequency,
            feedImpedance,
            groundType,
            segments: segList,
            feedSegment,
            feedVector: buildFeedVector(segList.length, feedSegment)
        };

        return BoostEngine.applyBoosts(this.config, geometry);
    }

    async calculate() {
        const geometry = this.buildGeometry();
        const { currents, impedance } = await this.solve(geometry);
        const pattern = await this.computePattern(currents, geometry);
        const swr = await this.computeSWR(impedance);

        return { impedance, currents, pattern, swr };
    }
}

/* ------------------------------------------------------------
   Adaptive weighting
------------------------------------------------------------ */
function adaptiveWeight(i, N) {
    const dist = Math.abs(i - 0);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

/* ------------------------------------------------------------
   Feed excitation vector
------------------------------------------------------------ */
function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}
