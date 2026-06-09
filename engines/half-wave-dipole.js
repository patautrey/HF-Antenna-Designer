/* ============================================================
   HF Antenna Designer — Half‑Wave Dipole Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class HalfWaveDipoleEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    /* ------------------------------------------------------------
       Build dipole geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength,
            height,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const half = totalLength / 2;
        const segList = [];

        /* ------------------------------------------------------------
           Horizontal dipole wire
           ------------------------------------------------------------ */
        for (let i = 0; i < segments; i++) {
            const x1 = -half + (i / segments) * totalLength;
            const x2 = -half + ((i + 1) / segments) * totalLength;

            segList.push({
                x1, y1: 0, z1: height,
                x2, y2: 0, z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments)
            });
        }

        /* ------------------------------------------------------------
           Feedpoint is at the center segment
        ------------------------------------------------------------ */
        const feedSegment = Math.floor(segments / 2);

        let geometry = {
            type: "half-wave-dipole",
            frequency,
            feedImpedance,
            groundType,
            segments: segList,
            feedSegment,
            feedVector: buildFeedVector(segList.length, feedSegment)
        };

        geometry = BoostEngine.applyBoosts(this.config, geometry);

        return geometry;
    }

    /* ------------------------------------------------------------
       Solve currents + impedance + pattern + SWR
       ------------------------------------------------------------ */
    async calculate() {
        const geometry = this.buildGeometry();
        const result = await this.solve(geometry);

        const { currents, impedance } = result;
        const pattern = await this.computePattern(currents, geometry);
        const swr = await this.computeSWR(impedance);

        return {
            impedance,
            currents,
            pattern,
            swr
        };
    }
}

/* ------------------------------------------------------------
   Adaptive weighting
------------------------------------------------------------ */
function adaptiveWeight(i, N) {
    const center = N / 2;
    const dist = Math.abs(i - center);
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
