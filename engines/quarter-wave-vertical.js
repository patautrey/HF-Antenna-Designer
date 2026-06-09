/* ============================================================
   HF Antenna Designer — Quarter‑Wave Vertical Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class QuarterWaveVerticalEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            height,
            wireDiameter,
            radialCount = 16,
            radialLength = height * 0.25,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        /* Vertical radiator */
        const vertSegs = Math.floor(segments * 0.5);
        for (let i = 0; i < vertSegs; i++) {
            const z1 = (i / vertSegs) * height;
            const z2 = ((i + 1) / vertSegs) * height;

            segList.push({
                x1: 0, y1: 0, z1,
                x2: 0, y2: 0, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, vertSegs)
            });
        }

        /* Ground radials */
        const radialSegs = Math.floor(segments * 0.5 / radialCount);
        for (let r = 0; r < radialCount; r++) {
            const angle = (2 * Math.PI * r) / radialCount;

            for (let i = 0; i < radialSegs; i++) {
                const f1 = i / radialSegs;
                const f2 = (i + 1) / radialSegs;

                segList.push({
                    x1: f1 * radialLength * Math.cos(angle),
                    y1: f1 * radialLength * Math.sin(angle),
                    z1: 0,
                    x2: f2 * radialLength * Math.cos(angle),
                    y2: f2 * radialLength * Math.sin(angle),
                    z2: 0,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, radialSegs)
                });
            }
        }

        const feedSegment = 0;

        let geometry = {
            type: "quarter-wave-vertical",
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
