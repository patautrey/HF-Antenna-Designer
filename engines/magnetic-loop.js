/* ============================================================
   HF Antenna Designer — Magnetic Loop Engine
   NEC-Style Geometry + Adaptive Segmentation
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class MagneticLoopEngine extends BaseEngine {

    constructor(config) {
        super(config);
    }

    /* ------------------------------------------------------------
       Build loop geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            loopDiameter,
            wireDiameter,
            frequency,
            segments = 60,          // medium resolution default
            feedImpedance,
            groundType
        } = this.config;

        const radius = loopDiameter / 2;
        const omega = 2 * Math.PI * frequency * 1e6;

        /* ------------------------------------------------------------
           Adaptive segmentation:
           - More segments near feedpoint
           - Fewer segments on opposite side
        ------------------------------------------------------------ */
        const segList = [];
        const totalSeg = segments;

        for (let i = 0; i < totalSeg; i++) {
            const angle1 = (i / totalSeg) * 2 * Math.PI;
            const angle2 = ((i + 1) / totalSeg) * 2 * Math.PI;

            const x1 = radius * Math.cos(angle1);
            const y1 = radius * Math.sin(angle1);
            const z1 = 0;

            const x2 = radius * Math.cos(angle2);
            const y2 = radius * Math.sin(angle2);
            const z2 = 0;

            // Adaptive weighting: denser near feedpoint (angle = 0)
            const weight = 1 + 2 * Math.exp(-Math.pow(angle1, 2) / 0.2);

            segList.push({
                x1, y1, z1,
                x2, y2, z2,
                radius: wireDiameter / 2,
                weight
            });
        }

        /* ------------------------------------------------------------
           Feedpoint is at segment 0
        ------------------------------------------------------------ */
        const feedSegment = 0;

        /* ------------------------------------------------------------
           Build geometry object
        ------------------------------------------------------------ */
        let geometry = {
            type: "magnetic-loop",
            frequency,
            feedImpedance,
            groundType,
            segments: segList,
            feedSegment,
            feedVector: buildFeedVector(segList.length, feedSegment)
        };

        /* ------------------------------------------------------------
           Apply boost modes
        ------------------------------------------------------------ */
        geometry = BoostEngine.applyBoosts(this.config, geometry);

        return geometry;
    }

    /* ------------------------------------------------------------
       Solve loop currents + impedance
       ------------------------------------------------------------ */
    async calculate() {
        const geometry = this.buildGeometry();
        const result = await this.solve(geometry);

        const { currents, impedance } = result;

        /* ------------------------------------------------------------
           Compute capacitor voltage (loop-specific)
        ------------------------------------------------------------ */
        const I = Math.abs(currents[geometry.feedSegment]);
        const X = Math.abs(impedance.imag || 0);
        const Vcap = I * X;

        /* ------------------------------------------------------------
           Compute far-field pattern
        ------------------------------------------------------------ */
        const pattern = await this.computePattern(currents, geometry);

        /* ------------------------------------------------------------
           Compute SWR
        ------------------------------------------------------------ */
        const swr = await this.computeSWR(impedance);

        return {
            impedance,
            currents,
            pattern,
            swr,
            capacitorVoltage: Vcap
        };
    }
}

/* ------------------------------------------------------------
   Build feed excitation vector
------------------------------------------------------------ */
function buildFeedVector(N, feedIndex) {
    const V = new Array(N).fill(0);
    V[feedIndex] = 1.0; // 1V excitation
    return V;
}
