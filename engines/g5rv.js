/* ============================================================
   HF Antenna Designer — G5RV Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class G5RVEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    /* ------------------------------------------------------------
       Build G5RV geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength = 31.1,          // 102 ft in meters
            ladderLength = 10.36,        // 34 ft in meters
            height = 10,                 // apex height
            segments = 80,               // medium resolution
            feedImpedance,
            groundType
        } = this.config;

        const half = totalLength / 2;
        const segList = [];

        /* ------------------------------------------------------------
           Dipole legs (horizontal)
           ------------------------------------------------------------ */
        const dipoleSegs = Math.floor(segments * 0.6);
        for (let i = 0; i < dipoleSegs; i++) {
            const x1 = -half + (i / dipoleSegs) * half;
            const x2 = -half + ((i + 1) / dipoleSegs) * half;

            segList.push({
                x1, y1: 0, z1: height,
                x2, y2: 0, z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, dipoleSegs)
            });
        }

        for (let i = 0; i < dipoleSegs; i++) {
            const x1 = (i / dipoleSegs) * half;
            const x2 = ((i + 1) / dipoleSegs) * half;

            segList.push({
                x1, y1: 0, z1: height,
                x2, y2: 0, z2: height,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, dipoleSegs)
            });
        }

        /* ------------------------------------------------------------
           Ladder-line (vertical)
           ------------------------------------------------------------ */
        const ladderSegs = segments - dipoleSegs * 2;
        for (let i = 0; i < ladderSegs; i++) {
            const z1 = height - (i / ladderSegs) * ladderLength;
            const z2 = height - ((i + 1) / ladderSegs) * ladderLength;

            segList.push({
                x1: 0, y1: 0, z1,
                x2: 0, y2: 0, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, ladderSegs)
            });
        }

        /* ------------------------------------------------------------
           Feedpoint is at the top of the ladder-line
        ------------------------------------------------------------ */
        const feedSegment = dipoleSegs * 2;

        let geometry = {
            type: "g5rv",
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
   Adaptive weighting function
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
