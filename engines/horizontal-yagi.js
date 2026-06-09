/* ============================================================
   HF Antenna Designer — Horizontal Yagi Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class HorizontalYagiEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    buildGeometry() {
        const {
            frequency,
            wireDiameter,
            drivenLength,
            reflectorLength,
            directorLengths,
            spacing,
            height,
            segments = 100,
            feedImpedance,
            groundType
        } = this.config;

        const segList = [];

        const addElement = (xOffset, length, isDriven) => {
            for (let i = 0; i < segments; i++) {
                const f1 = i / segments;
                const f2 = (i + 1) / segments;

                segList.push({
                    x1: xOffset,
                    y1: -length/2 + f1 * length,
                    z1: height,
                    x2: xOffset,
                    y2: -length/2 + f2 * length,
                    z2: height,
                    radius: wireDiameter / 2,
                    weight: adaptiveWeight(i, segments),
                    driven: isDriven
                });
            }
        };

        addElement(0, drivenLength, true);
        addElement(-spacing, reflectorLength, false);

        directorLengths.forEach((len, idx) => {
            addElement((idx + 1) * spacing, len, false);
        });

        const feedSegment = Math.floor(segments / 2);

        let geometry = {
            type: "horizontal-yagi",
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
    const center = N / 2;
    const dist = Math.abs(i - center);
    return 1 + 2 * Math.exp(-(dist * dist) / (N * 0.1));
}

function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0;
    return V;
}
