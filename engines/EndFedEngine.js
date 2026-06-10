// HF-Antenna-Designer/engines/EndFedEngine.js
// Full NEC-style End-Fed Half-Wave antenna engine

import EngineTemplate from "./EngineTemplate.js";

export default class EndFedEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "End‑Fed Half‑Wave";
        this.metadata.configuration = "High‑Z End‑Fed Vertical";
        this.metadata.dxTurbo = false;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // End-fed half-wave length correction
        const endLoadingFactor = cfg.endLoadingFactor || 0.96;
        const radiator = (λ / 2) * endLoadingFactor;

        // Optional counterpoise
        const counterpoise = cfg.counterpoiseLengthFactor
            ? cfg.counterpoiseLengthFactor * λ
            : 0;

        const elements = [
            {
                name: "Radiator",
                type: "Driven",
                length: radiator,
                position: 0
            }
        ];

        if (counterpoise > 0) {
            elements.push({
                name: "Counterpoise",
                type: "Counterpoise",
                length: counterpoise,
                position: -counterpoise
            });
        }

        this.metadata.elementCount = elements.length;

        return {
            elements,
            totalBoom: radiator,
            totalWire: radiator + counterpoise
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        // High-Z feed typical for EFHW
        let R = 2500;
        let X = 150;

        // Transformer ratio
        if (cfg.transformerRatio) {
            const ratio = cfg.transformerRatio;
            R = R / (ratio * ratio);
            X = X / (ratio * ratio);
        }

        // End-loading shifts reactance
        if (cfg.endLoadingFactor < 1) {
            X -= 20 * (1 - cfg.endLoadingFactor);
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 2.8; // dBi typical for EFHW

        // Seaside boost
        let seasideBoost = cfg.seaside ? 3.0 : 0;

        return {
            maxGain: baseGain + seasideBoost,
            fb: 0,
            environmentBoost: seasideBoost
        };
    }

    // ------------------------------------------------------------
    // Efficiency
    // ------------------------------------------------------------
    computeEfficiency(impedance) {
        const cfg = this.config;

        const radRes = impedance.R;
        const groundLoss = cfg.counterpoiseLengthFactor ? 2.0 : 5.0;
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

        // Azimuth: nearly omnidirectional
        for (let deg = 0; deg < 360; deg += 5) {
            az.push({ angle: deg, gain: 2.8 });
        }

        // Elevation: EFHW has a slightly lower TOA than 1/4 wave
        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 5 * Math.exp(-deg / 22);
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: 18,
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Counterpoise
    // ------------------------------------------------------------
    computeRadials() {
        const cfg = this.config;

        return {
            count: cfg.counterpoiseLengthFactor ? 1 : 0,
            length: cfg.counterpoiseLengthFactor
                ? cfg.counterpoiseLengthFactor * this.wavelengthMeters()
                : 0,
            elevated: false
        };
    }
}
