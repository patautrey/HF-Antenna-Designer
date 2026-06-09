/* ============================================================
   HF/VHF/UHF Antenna Designer — Flowerpot (T2LT) Engine
   Fully Parametric, Coax-Aware, PVC-Aware, NEC-Style Geometry
   ============================================================ */

import BaseEngine from "/engines/engine-base.js";
import BoostEngine from "/engines/boost-engine.js";

export default class FlowerpotEngine extends BaseEngine {

    constructor(config) {
        super(config);

        // Built-in coax library
        this.coaxDB = {
            "RG58":  { od: 4.95, vf: 0.66 },
            "RG8X":  { od: 6.10, vf: 0.78 },
            "RG174": { od: 2.80, vf: 0.66 },
            "LMR240":{ od: 6.10, vf: 0.84 },
            "LMR400":{ od: 10.30, vf: 0.85 },
            "RG6":   { od: 6.90, vf: 0.82 }
        };
    }

    /* ------------------------------------------------------------
       Compute element lengths based on frequency, VF, PVC mode
       ------------------------------------------------------------ */
    computeElementLengths(freq, coaxType, pvcMode) {
        const c = 299792458;
        const coax = this.coaxDB[coaxType] || this.coaxDB["RG58"];

        // Base half-wave length
        let L = (c / (2 * freq)) * coax.vf;

        // PVC dielectric shortening
        const pvcFactor = pvcMode === "inside" ? 0.95 : 0.98;
        L *= pvcFactor;

        // Split into top/bottom elements (Flowerpot ratio ~50/50)
        return {
            top: L * 0.50,
            bottom: L * 0.50
        };
    }

    /* ------------------------------------------------------------
       Compute required choke turns using Wheeler's formula
       ------------------------------------------------------------ */
    computeChokeTurns(freq, pvcOD, coaxType, targetXL = 500) {
        const coax = this.coaxDB[coaxType] || this.coaxDB["RG58"];

        // Required inductance
        const Lreq = targetXL / (2 * Math.PI * freq); // Henries

        // Wheeler's formula for single-layer solenoid
        // L(µH) = (r^2 * N^2) / (9r + 10l)
        // Convert to meters
        const r = (pvcOD / 1000) / 2;

        // Assume coil length = N * coax diameter
        const d = coax.od / 1000;

        // Solve iteratively for N
        let N = 1;
        while (N < 40) {
            const l = N * d;
            const Lmicro = (r * r * N * N) / (9 * r + 10 * l);
            const Lhenry = Lmicro * 1e-6;
            if (Lhenry >= Lreq) break;
            N++;
        }

        return N;
    }

    /* ------------------------------------------------------------
       Build NEC-style geometry
       ------------------------------------------------------------ */
    buildGeometry() {
        const {
            frequency,
            coaxType = "RG58",
            pvcOD = 25,
            pvcMode = "outside",
            targetReactance = 500,
            wireDiameter = 2,
            segments = 60,
            feedImpedance,
            groundType
        } = this.config;

        const freqHz = frequency;
        const lengths = this.computeElementLengths(freqHz, coaxType, pvcMode);
        const turns = this.computeChokeTurns(freqHz, pvcOD, coaxType, targetReactance);

        const segList = [];

        /* ------------------------------
           Top radiator (center conductor)
        ------------------------------ */
        const topSegs = Math.floor(segments * 0.4);
        for (let i = 0; i < topSegs; i++) {
            const f1 = i / topSegs;
            const f2 = (i + 1) / topSegs;

            segList.push({
                x1: 0, y1: 0, z1: lengths.top * f1,
                x2: 0, y2: 0, z2: lengths.top * f2,
                radius: wireDiameter / 2000,
                weight: adaptiveWeight(i, topSegs)
            });
        }

        /* ------------------------------
           Bottom sleeve (coax shield)
        ------------------------------ */
        const bottomSegs = Math.floor(segments * 0.4);
        for (let i = 0; i < bottomSegs; i++) {
            const f1 = i / bottomSegs;
            const f2 = (i + 1) / bottomSegs;

            segList.push({
                x1: 0, y1: 0, z1: -lengths.bottom * f1,
                x2: 0, y2: 0, z2: -lengths.bottom * f2,
                radius: wireDiameter / 2000,
                weight: adaptiveWeight(i, bottomSegs)
            });
        }

        /* ------------------------------
           Choke coil (helix approximation)
        ------------------------------ */
        const coilSegs = turns * 4; // 4 segments per turn
        const radius = pvcOD / 2000;
        const pitch = (this.coaxDB[coaxType].od / 1000);

        for (let i = 0; i < coilSegs; i++) {
            const angle1 = (i / coilSegs) * turns * 2 * Math.PI;
            const angle2 = ((i + 1) / coilSegs) * turns * 2 * Math.PI;

            const z1 = -lengths.bottom - (i * pitch / 4);
            const z2 = -lengths.bottom - ((i + 1) * pitch / 4);

            segList.push({
                x1: radius * Math.cos(angle1),
                y1: radius * Math.sin(angle1),
                z1,
                x2: radius * Math.cos(angle2),
                y2: radius * Math.sin(angle2),
                z2,
                radius: wireDiameter / 2000,
                weight: 1.0,
                load: { type: "coil", reactance: targetReactance }
            });
        }

        const feedSegment = Math.floor(topSegs / 2);

        let geometry = {
            type: "flowerpot",
            frequency,
            feedImpedance,
            groundType,
            segments: segList,
            feedSegment,
            feedVector: buildFeedVector(segList.length, feedSegment),
            metadata: {
                coaxType,
                pvcOD,
                pvcMode,
                topLength: lengths.top,
                bottomLength: lengths.bottom,
                chokeTurns: turns
            }
        };

        return BoostEngine.applyBoosts(this.config, geometry);
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
            swr,
            metadata: geometry.metadata
        };
    }
}

/* ------------------------------------------------------------
   Adaptive weighting
------------------------------------------------------------ */
function adaptiveWeight(i, N) {
    const center = 0;
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
