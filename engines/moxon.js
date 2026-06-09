/* ============================================================
   HF Antenna Designer — Moxon Rectangle Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class MoxonEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            width,
            height,
            gap,
            spacing,
            boomHeight,
            segments = 120,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        const addSide = (x1, y1, x2, y2, z) => {
            for (let i = 0; i < segments / 4; i++) {
                const f1 = i / (segments / 4);
                const f2 = (i + 1) / (segments / 4);

                segList.push({
                    x1: x1 + (x2 - x1) * f1,
                    y1: y1 + (y2 - y1) * f1,
                    z1: z,
                    x2: x1 + (x2 - x1) * f2,
                    y2: y1 + (y2 - y1) * f2,
                    z2: z,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segments / 4)
                });
            }
        };

        const z = boomHeight;

        addSide(-width/2, 0, -width/2, height, z);
        addSide(-width/2, height, -gap/2, height, z);
        addSide(gap/2, height, width/2, height, z);
        addSide(width/2, height, width/2, 0, z);

        const feedSegment = Math.floor(segments / 8);

        let geometry = {
            type: "moxon",
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

function adaptiveWeight(i, N) {
    const center = 0;
    const dist = Math.abs(i - center);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}
