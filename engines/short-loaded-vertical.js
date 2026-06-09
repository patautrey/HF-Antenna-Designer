/* ============================================================
   HF Antenna Designer — Short Loaded Vertical Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class ShortLoadedVerticalEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            height,
            coilPosition,       // 0–1 fraction of height
            wireDiameter,
            coilReactance,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];
        const coilSeg = Math.floor(segments * coilPosition);

        for (let i = 0; i < segments; i++) {
            const z1 = (i / segments) * height;
            const z2 = ((i + 1) / segments) * height;

            segList.push({
                x1: 0, y1: 0, z1,
                x2: 0, y2: 0, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments),
                load: i === coilSeg ? { type: "coil", reactance: coilReactance } : null
            });
        }

        const feedSegment = 0;

        let geometry = {
            type: "short-loaded-vertical",
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
