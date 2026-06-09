/* ============================================================
   HF Antenna Designer — Umbrella Vertical Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class UmbrellaVerticalEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            height,
            topHatCount,
            topHatLength,
            segments = 80,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        /* Vertical radiator */
        for (let i = 0; i < segments / 2; i++) {
            const f1 = i / (segments / 2);
            const f2 = (i + 1) / (segments / 2);

            segList.push({
                x1: 0, y1: 0, z1: f1 * height,
                x2: 0, y2: 0, z2: f2 * height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2)
            });
        }

        /* Top-hat wires */
        const hatSegs = segments / 2 / topHatCount;

        for (let h = 0; h < topHatCount; h++) {
            const angle = (2 * Math.PI * h) / topHatCount;

            for (let i = 0; i < hatSegs; i++) {
                const f1 = i / hatSegs;
                const f2 = (i + 1) / hatSegs;

                segList.push({
                    x1: Math.cos(angle) * f1 * topHatLength,
                    y1: Math.sin(angle) * f1 * topHatLength,
                    z1: height,
                    x2: Math.cos(angle) * f2 * topHatLength,
                    y2: Math.sin(angle) * f2 * topHatLength,
                    z2: height,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, hatSegs)
                });
            }
        }

        const feedSegment = 0;

        let geometry = {
            type: "umbrella-vertical",
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
