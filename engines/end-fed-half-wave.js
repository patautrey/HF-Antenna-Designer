/* ============================================================
   HF Antenna Designer — End‑Fed Half‑Wave Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class EndFedHalfWaveEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    /* ------------------------------------------------------------
       Build EFHW geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength,
            height,
            segments = 80,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        /* ------------------------------------------------------------
           Horizontal EFHW wire
           ------------------------------------------------------------ */
        for (let i = 0; i < segments; i++) {
            const x1 = (i / segments) * totalLength;
            const x2 = ((i + 1) / segments) * totalLength;

            segList.push({
                x1, y1: 0, z1: height,
                x2, y2: 0, z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments)
            });
        }

        /* ------------------------------------------------------------
           Feedpoint is at the *end* of the wire
        ------------------------------------------------------------ */
        const feedSegment = 0;

        let geometry = {
            type: "end-fed-half-wave",
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
    const end = 0; // highest resolution near feedpoint
    const dist = Math.abs(i - end);
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
