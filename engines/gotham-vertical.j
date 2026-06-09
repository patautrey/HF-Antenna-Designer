/* ============================================================
   HF Antenna Designer — Gotham Vertical Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class GothamVerticalEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    /* ------------------------------------------------------------
       Build Gotham Vertical geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            frequency,
            height = 6.7,              // ~22 ft
            wireDiameter,
            radialCount = 16,
            radialLength = 3.0,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        /* ------------------------------------------------------------
           Vertical radiator
           ------------------------------------------------------------ */
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

        /* ------------------------------------------------------------
           Ground radials (horizontal)
           ------------------------------------------------------------ */
        const radialSegs = Math.floor(segments * 0.5 / radialCount);

        for (let r = 0; r < radialCount; r++) {
            const angle = (2 * Math.PI * r) / radialCount;

            for (let i = 0; i < radialSegs; i++) {
                const frac1 = i / radialSegs;
                const frac2 = (i + 1) / radialSegs;

                const x1 = frac1 * radialLength * Math.cos(angle);
                const y1 = frac1 * radialLength * Math.sin(angle);
                const z1 = 0;

                const x2 = frac2 * radialLength * Math.cos(angle);
                const y2 = frac2 * radialLength * Math.sin(angle);
                const z2 = 0;

                segList.push({
                    x1, y1, z1,
                    x2, y2, z2,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, radialSegs)
                });
            }
        }

        /* ------------------------------------------------------------
           Feedpoint is at the bottom of the vertical
        ------------------------------------------------------------ */
        const feedSegment = 0;

        let geometry = {
            type: "gotham-vertical",
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
