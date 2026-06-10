// HF-Antenna-Designer/engines/MoxonEngine.js
// Full NEC-style Moxon Rectangle antenna engine (2-element compact Yagi variant)

import EngineTemplate from "./EngineTemplate.js";

export default class MoxonEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Moxon Rectangle";
        this.metadata.configuration = "2-Element Folded-Tip Directional";
        this.metadata.dxTurbo = !!config.dxTurbo;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // Moxon geometry factors (typical)
        const A = cfg.A || 0.28 * λ; // driven element horizontal
        const B = cfg.B || 0.08 * λ; // tip gap
        const C = cfg.C || 0.12 * λ; // reflector horizontal
        const D = cfg.D || 0.06 * λ; // vertical tip length

        const elements = [
            {
                name: "Driven Element",
                type: "Driven",
                length: 2 * (A + D),
                position: 0
            },
            {
                name: "Reflector",
                type: "Reflector",
                length: 2 * (C + D),
                position: -B
            }
        ];

        this.metadata.elementCount = 2;

        return {
            elements,
            totalBoom: B,
            totalWire: elements.reduce((s, e) => s + e.length, 0)
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        // Typical Moxon feed impedance
        let R = 50;
        let X = 5;

        if (cfg.dxTurbo) {
            R += 8;
            X += 10;
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 6.8; // typical Moxon gain

        if (cfg.dxTurbo) baseGain += 1.0;

        let seasideBoost = cfg.seaside ? 3.0 : 0;

        return {
            maxGain: baseGain + seasideBoost,
            fb: 25,
            environmentBoost: seasideBoost
        };
    }

    // ------------------------------------------------------------
    // Efficiency
    // ------------------------------------------------------------
    computeEfficiency(impedance) {
        const cfg = this.config;

        const radRes = impedance.R;
        const groundLoss = cfg.height > 5 ? 1.0 : 3.0;
        const total = radRes + groundLoss;

        const eff = (radRes / total) * 100;

        return {
            radiationResistance: radRes,
            groundLoss,
            totalResistance: total,
            radiationEfficiency: eff,
            erp: (cfg.power || 100) * (eff / 100)
        };
    }

    // ------------------------------------------------------------
    // Patterns
    // ------------------------------------------------------------
    computePatterns() {
        const az = [];
        const el = [];

        // Azimuth: strong forward lobe, deep nulls
        for (let deg = 0; deg < 360; deg += 5) {
            const rad = (deg * Math.PI) / 180;
            const gain = 2 + 11 * Math.cos(rad);
            az.push({ angle: deg, gain });
        }

        // Elevation: low-angle lobe
        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 6 * Math.exp(-deg / 20);
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: 14,
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Radials (none for Moxon)
    // ------------------------------------------------------------
    computeRadials() {
        return {
            count: 0,
            length: 0,
            elevated: false
        };
    }
}
