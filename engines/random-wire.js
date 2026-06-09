/* ============================================================
   HF Antenna Designer — Random Wire Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class RandomWireEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            points,          // array of {x,y,z}
            segments = 100,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            segList.push({
                x1: p1.x, y1: p1.y, z1: p1.z,
                x2: p2.x, y2: p2.y, z2: p2.z,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, points.length)
            });
        }

        const feedSegment = 0;

        let geometry = {
            type: "random-wire",
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
    const dist = Math.abs(i - 0);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}
