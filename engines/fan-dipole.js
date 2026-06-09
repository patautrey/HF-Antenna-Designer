/* ============================================================
   HF Antenna Designer — Fan Dipole Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class FanDipoleEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            leg1Length,
            leg2Length,
            height,
            segments = 80,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        /* Helper to add a dipole leg */
        const addLeg = (length, sign) => {
            for (let i = 0; i < segments / 2; i++) {
                const f1 = i / (segments / 2);
                const f2 = (i + 1) / (segments / 2);

                segList.push({
                    x1: sign * length * f1,
                    y1: 0,
                    z1: height,
                    x2: sign * length * f2,
                    y2: 0,
                    z2: height,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segments / 2)
                });
            }
        };

        /* Two legs per side */
        addLeg(leg1Length, -1);
        addLeg(leg1Length, +1);
        addLeg(leg2Length, -1);
        addLeg(leg2Length, +1);

        const feedSegment = 0;

        let geometry = {
            type: "fan-dipole",
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
