// HF-Antenna-Designer/engines/Yagi3Engine.js

import EngineTemplate from "./EngineTemplate.js";

export default class Yagi3Engine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "3‑Element Yagi";
        this.metadata.configuration = "Reflector + Driven + Director";
        this.metadata.dxTurbo = !!config.dxTurbo;
        this.metadata.seaside = !!config.seaside;
    }

    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        const driven = 0.48 * λ;
        const reflector = 0.52 * λ;
        const director = 0.45 * λ;

        const spacing = (cfg.spacingFactor || 0.15) * λ;

        const elements = [
            { name: "Reflector", type: "Reflector", length: reflector, position: -spacing },
            { name: "Driven", type: "Driven", length: driven, position: 0 },
            { name: "Director", type: "Director", length: director, position: spacing }
        ];

        this.metadata.elementCount = 3;

        return {
            elements,
            totalBoom: spacing * 2,
            totalWire: reflector + driven + director
        };
    }

    computeImpedance() {
        const cfg = this.config;

        let R = 28;
        let X = -12;

        if (cfg.dxTurbo) {
            R += 6;
            X += 10;
        }

        return { R, X };
    }

    computeGain() {
        const cfg = this.config;

        let baseGain = 7.2;

        if (cfg.dxTurbo) baseGain += 1.0;

        let seasideBoost = cfg.seaside ? 3.0 : 0;

        return {
            maxGain: baseGain + seasideBoost,
            fb: 12,
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
            const rad = (deg * Math.PI) / 180;
            const gain = 2 + 12 * Math.cos(rad);
            az.push({ angle: deg, gain });
        }

        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 6 * Math.exp(-deg / 20);
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: 18,
            pattern3D: null
        };
    }

    computeRadials() {
        return { count: 0, length: 0, elevated: false };
    }
}
