// HF-Antenna-Designer/engines/DisconeEngine.js
// Full NEC-style Discone antenna engine (wideband cone + disc radiator)

import EngineTemplate from "./EngineTemplate.js";

export default class DisconeEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Discone Antenna";
        this.metadata.configuration = "Wideband Cone + Disc";
        this.metadata.dxTurbo = false;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // Disc radius (typical: 0.17λ)
        const discRadius = (cfg.discFactor || 0.17) * λ;

        // Cone slant height (typical: 0.25λ)
        const coneLength = (cfg.coneFactor || 0.25) * λ;

        // Cone angle (degrees)
        const coneAngle = cfg.coneAngle || 60;

        const elements = [
            {
                name: "Disc",
                type: "Disc",
                length: discRadius,
                position: 0
            },
            {
                name: "Cone",
                type: "Cone",
                length: coneLength,
                position: -coneLength
            }
        ];

        this.metadata.elementCount = 2;

        return {
            elements,
            totalBoom: coneLength,
            totalWire: discRadius + coneLength,
            coneAngle
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        // Discone impedance is fairly stable across band
        let R = 50;
        let X = 0;

        // Cone angle affects impedance
        const angle = cfg.coneAngle || 60;
        R += (angle - 60) * 0.4;
        X += (angle - 60) * 0.2;

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 2.0; // typical discone gain

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
        const groundLoss = cfg.height > 5 ? 1.0 : 3.0;
        const total = radRes + groundLoss;

        const eff = (radRes / total) * 100;

        return {
            radiationResistance: radRes,
            groundLoss,
            totalResistance: total,
            radiationEfficiency: eff,
            erp: (cfg.power || 50) * (eff / 100)
        };
    }

    // ------------------------------------------------------------
    // Patterns
    // ------------------------------------------------------------
    computePatterns() {
        const az = [];
        const el = [];

        // Azimuth: nearly perfect omni
        for (let deg = 0; deg < 360; deg += 5) {
            az.push({ angle: deg, gain: 2.0 });
        }

        // Elevation: classic discone low-angle donut
        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 4 * Math.exp(-deg / 18);
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: 22,
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Radials (optional ground radials)
    // ------------------------------------------------------------
    computeRadials() {
        const cfg = this.config;

        if (!cfg.radials) {
            return { count: 0, length: 0, elevated: false };
        }

        return {
            count: cfg.radials,
            length: this.wavelengthMeters() * 0.25,
            elevated: false
        };
    }
}
