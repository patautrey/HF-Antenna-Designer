/* ============================================================
   HF Antenna Designer — Vertical Loop Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class VerticalLoopEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            width,
            height,
            baseHeight,
            segments = 120,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        const corners = [
            { x: -width/2, y: 0, z: baseHeight },
            { x:  width/2, y: 0, z: baseHeight },
            { x:  width/2, y: 0, z: baseHeight + height },
            { x: -width/2, y: 0, z: baseHeight + height }
        ];

        const segPerSide = Math.floor(segments / 4);

        for (let s = 0; s < 4; s++) {
            const p1 = corners[s];
            const p2 = corners[(s + 1) % 4];

            for (let i = 0; i < segPerSide; i++) {
                const f1 = i / segPerSide;
                const f2 = (i + 1) / segPerSide;

                segList.push({
                    x1: p1.x + (p2.x - p1.x) * f1,
                    y1: 0,
                    z1: p1.z + (p2.z - p1.z) * f1,
                    x2: p1.x + (p2.x - p1.x) * f2,
                    y2: 0,
                    z2: p1.z + (p2.z - p1.z) * f2,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segPerSide)
                });
            }
        }

        const feedSegment = 0;

        let geometry = {
            type: "vertical-loop",
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
