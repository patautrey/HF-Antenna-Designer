// HF-Antenna-Designer/engines/LoopEngine.js
// Full NEC-style Loop antenna engine (small/medium single-turn loop)

import EngineTemplate from "./EngineTemplate.js";

export default class LoopEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Single‑Turn Loop";
        this.metadata.configuration = "Perimeter Loop (Vertical or Horizontal)";
        this.metadata.dxTurbo = false;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // Loop perimeter factor (e.g., 1λ, 0.5λ, 0.25λ)
        const perimeter = (cfg.perimeterFactor || 1.0) * λ;

        // Approximate loop diameter
        const diameter = perimeter / Math.PI;

        const elements = [
            {
                name: "Loop",
                type: "Loop",
                length: perimeter,
                position: 0
            }
        ];

        this.metadata.elementCount = 1;

        return {
            elements,
            totalBoom: diameter,
            totalWire: perimeter
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;
        const λ = this.wavelengthMeters();

        const perimeter = (cfg.perimeterFactor || 1.0) * λ;

        // Radiation resistance approximation for loop
        const radRes = 31200 * (perimeter / λ) ** 4;

        // Loss resistance (wire + joints)
        const loss = cfg.lossOhms || 2.0;

        // Reactive component (loops are inductive)
        const X = 150 * (perimeter / λ);

        return {
            R: radRes + loss,
            X
        };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        // Base gain for a full-wave loop
        let baseGain = 3.1;

        // Perimeter scaling
        if (cfg.perimeterFactor < 1.0) {
            baseGain -= (1.0 - cfg.perimeterFactor) * 3;
        }

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

        const radRes = impedance.R - (cfg.lossOhms || 2.0);
        const loss = cfg.lossOhms || 2.0;
        const total = radRes + loss;

        const eff = (radRes / total) * 100;

        return {
            radiationResistance: radRes,
            groundLoss: loss,
            totalResistance: total,
            radiationEfficiency: eff,
            erp: (cfg.power || 100) * (eff / 100)
        };
    }

    // ------------------------------------------------------------
    // Patterns
    // ------------------------------------------------------------
    computePatterns() {
        const cfg = this.config;

        const az = [];
        const el = [];

        // Orientation: vertical loop = horizontal polarization
        const vertical = cfg.orientation === "vertical";

        // Azimuth pattern
        for (let deg = 0; deg < 360; deg += 5) {
            const rad = (deg * Math.PI) / 180;
            const gain = vertical
                ? 2.5 * Math.sin(rad) ** 2
                : 2.5; // horizontal loop is nearly omnidirectional
            az.push({ angle: deg, gain });
        }

        // Elevation pattern
        for (let deg = 0; deg <= 90; deg += 2) {
            const rad = (deg * Math.PI) / 180;
            const gain = vertical
                ? 1 + 4 * Math.cos(rad) ** 2
                : 1 + 3 * Math.sin(rad) ** 2;
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: vertical ? 40 : 25,
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Radials (loops typically do not use radials)
    // ------------------------------------------------------------
    computeRadials() {
        return {
            count: 0,
            length: 0,
            elevated: false
        };
    }
}
