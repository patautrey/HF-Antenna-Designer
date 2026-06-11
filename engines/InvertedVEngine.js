// HF-Antenna-Designer/engines/InvertedVEngine.js
// NEC-style Inverted-V dipole engine

import EngineTemplate from "./EngineTemplate.js";

export default class InvertedVEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Inverted‑V Dipole";
        this.metadata.configuration = "Sloped Dipole";
        this.metadata.seaside = !!config.seaside;
    }

    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        const total = (λ / 2) * (cfg.endEffectFactor || 0.96);
        const leg = total / 2;

        const angle = cfg.angleDeg || 120; // apex angle
        const rad = (angle * Math.PI) / 180;

        const height = cfg.height || 6;

        const elements = [
            {
                name: "Leg 1",
                type: "Wire",
                length: leg,
                position: 0
            },
            {
                name: "Leg 2",
                type: "Wire",
                length: leg,
                position: 0
            }
        ];

        this.metadata.elementCount = 2;

        return {
            elements,
            totalBoom: leg,
            totalWire: total,
            apexAngle: angle,
            height
        };
    }

    computeImpedance() {
        const cfg = this.config;

        let R = 72;
        let X = 0;

        // Inverted-V lowers impedance
        R -= (120 - cfg.angleDeg) * 0.3;

        return { R, X };
    }

    computeGain() {
        const cfg = this.config;

        let baseGain = 1.8;

        let seasideBoost = cfg.seaside ? 3.0 : 0;

        return {
            maxGain: baseGain + seasideBoost,
            fb: 0,
            environmentBoost: seasideBoost
        };
    }

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

    computePatterns() {
        const az = [];
        const el = [];

        for (let deg = 0; deg < 360; deg += 5) {
            az.push({ angle: deg, gain: 1.8 });
        }

        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 4 * Math.exp(-deg / 22);
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: 28,
            pattern3D: null
        };
    }

    computeRadials() {
        return { count: 0, length: 0, elevated: false };
    }
}
