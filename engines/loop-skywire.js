/* ============================================================
   HF Antenna Designer — Loop Skywire Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class LoopSkywireEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            sideLength,
            height,
            segments = 120,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];
        const corners = [
            { x: -sideLength/2, y: -sideLength/2 },
            { x:  sideLength/2, y: -sideLength/2 },
            { x:  sideLength/2, y:  sideLength/2 },
            { x: -sideLength/2, y:  sideLength/2 }
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
                    y1: p1.y + (p2.y - p1.y) * f1,
                    z1: height,
                    x2: p1.x + (p2.x - p1.x) * f2,
                    y2: p1.y + (p2.y - p1.y) * f2,
                    z2: height,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segPerSide)
                });
            }
        }

        const feedSegment = 0;

        let geometry = {
            type: "loop-skywire",
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
