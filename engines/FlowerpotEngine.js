// HF-Antenna-Designer/engines/FlowerpotEngine.js
// Full NEC-style Flowerpot antenna engine (coaxial sleeve vertical)

import EngineTemplate from "./EngineTemplate.js";

export default class FlowerpotEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Flowerpot Antenna";
        this.metadata.configuration = "Coaxial Sleeve Vertical";
        this.metadata.dxTurbo = false;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // Coax velocity factor (typical)
        const vf = cfg.vf || 0.66;

        // PVC dielectric loading factor
        const pvcFactor = cfg.pvcOD ? (1 - Math.min(cfg.pvcOD / 100, 0.25)) : 1.0;

        // Radiator length (1/4 wave adjusted)
        const radiator = (λ / 4) * vf * pvcFactor;

        // Sleeve length (counterpoise)
        const sleeve = (λ / 4) * 0.95;

        const elements = [
            {
                name: "Radiator",
                type: "Driven",
                length: radiator,
                position: 0
            },
            {
                name: "Sleeve",
                type: "Counterpoise",
                length: sleeve,
                position: -sleeve
            }
        ];

        this.metadata.elementCount = elements.length;

        return {
            elements,
            totalBoom: sleeve,
            totalWire: radiator + sleeve
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        // Base impedance for a 1/4 wave vertical
        let R = 36;
        let X = -5;

        // PVC loading shifts reactance
        if (cfg.pvcOD > 20) X -= 8;

        // Choke reactance target
        if (cfg.targetReactance) {
            X += (cfg.targetReactance / 50);
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 2.1; // dBi typical for 1/4 wave

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
        const groundLoss = cfg.radials >= 4 ? 3.0 : 6.0;
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

        // Azimuth: omnidirectional
        for (let deg = 0; deg < 360; deg += 5) {
            az.push({ angle: deg, gain: 2.1 });
        }

        // Elevation: typical 1/4 wave vertical
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
    // Radials (optional)
    // ------------------------------------------------------------
    computeRadials() {
        const cfg = this.config;

        return {
            count: cfg.radials || 0,
            length: (this.wavelengthMeters() / 4) * 0.95,
            elevated: !!cfg.elevatedRadials
        };
    }
}
