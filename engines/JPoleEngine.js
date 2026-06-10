// HF-Antenna-Designer/engines/JPoleEngine.js
// Full NEC-style J-Pole antenna engine (λ/2 radiator + λ/4 matching stub)

import EngineTemplate from "./EngineTemplate.js";

export default class JPoleEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "J‑Pole Antenna";
        this.metadata.configuration = "λ/2 Radiator + λ/4 Matching Stub";
        this.metadata.dxTurbo = !!config.dxTurbo;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // Radiator length (half-wave)
        const radiator = (λ / 2) * (cfg.radiatorFactor || 1.0);

        // Matching stub (quarter-wave)
        const stub = (λ / 4) * (cfg.stubFactor || 1.0);

        // Feedpoint offset from bottom of stub
        const feedOffset = stub * (cfg.feedOffsetFactor || 0.2);

        const elements = [
            {
                name: "Radiator",
                type: "Driven",
                length: radiator,
                position: 0
            },
            {
                name: "Matching Stub",
                type: "Stub",
                length: stub,
                position: -stub
            }
        ];

        this.metadata.elementCount = 2;

        return {
            elements,
            totalBoom: radiator,
            totalWire: radiator + stub,
            feedOffset
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        // Base J-pole impedance near feedpoint
        let R = 45;
        let X = 10;

        // Feedpoint offset changes impedance
        if (cfg.feedOffsetFactor) {
            const delta = (cfg.feedOffsetFactor - 0.2) * 50;
            R += delta;
            X += delta * 0.3;
        }

        // DX Turbo shifts resonance
        if (cfg.dxTurbo) {
            R += 8;
            X += 12;
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 2.6; // typical J-pole gain

        // DX Turbo
        if (cfg.dxTurbo) baseGain += 1.0;

        // Seaside
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
        const groundLoss = cfg.height > 5 ? 1.5 : 3.5;
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

        // Azimuth: nearly omnidirectional
        for (let deg = 0; deg < 360; deg += 5) {
            az.push({ angle: deg, gain: 2.6 });
        }

        // Elevation: slightly lower TOA than 1/4 wave
        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 5 * Math.exp(-deg / 20);
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
    // Radials (optional choke radials)
    // ------------------------------------------------------------
    computeRadials() {
        const cfg = this.config;

        if (!cfg.chokeRadials) {
            return { count: 0, length: 0, elevated: false };
        }

        return {
            count: cfg.chokeRadials,
            length: (this.wavelengthMeters() / 4) * 0.95,
            elevated: true
        };
    }
}
