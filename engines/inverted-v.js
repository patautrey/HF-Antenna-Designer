/* ============================================================
   HF Antenna Designer — Inverted‑V Dipole Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class InvertedVEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    /* ------------------------------------------------------------
       Build inverted‑V geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            totalLength,
            apexHeight,
            legAngleDeg = 120,      // typical inverted‑V angle
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const half = totalLength / 2;
        const legAngleRad = (legAngleDeg * Math.PI) / 180;

        const drop = Math.cos(legAngleRad / 2) * half;
        const horizontal = Math.sin(legAngleRad / 2) * half;

        const segList = [];

        /* ------------------------------------------------------------
           Left leg
           ------------------------------------------------------------ */
        for (let i = 0; i < segments / 2; i++) {
            const frac1 = i / (segments / 2);
            const frac2 = (i + 1) / (segments / 2);

            const x1 = -horizontal * frac1;
            const y1 = 0;
            const z1 = apexHeight - drop * frac1;

            const x2 = -horizontal * frac2;
            const y2 = 0;
            const z2 = apexHeight - drop * frac2;

            segList.push({
                x1, y1, z1,
                x2, y2, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2)
            });
        }

        /* ------------------------------------------------------------
           Right leg
           ------------------------------------------------------------ */
        for (let i = 0; i < segments / 2; i++) {
            const frac1 = i / (segments / 2);
            const frac2 = (i + 1) / (segments / 2);

            const x1 = horizontal * frac1;
            const y1 = 0;
            const z1 = apexHeight - drop * frac1;

            const x2 = horizontal * frac2;
            const y2 = 0;
            const z2 = apexHeight - drop * frac2;

            segList.push({
                x1, y1, z1,
                x2, y2, z2,
                radius: wireDiameter / 2,
                weight: adaptiveWeight(i, segments / 2)
            });
        }

        /* ------------------------------------------------------------
           Feedpoint is at the apex (center)
        ------------------------------------------------------------ */
        const feedSegment = Math.floor(segments / 2);

        let geometry = {
            type: "inverted-v",
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
    const center = 0; // highest resolution near feedpoint
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
