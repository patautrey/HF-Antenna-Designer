// HF-Antenna-Designer/engines/DipoleEngine.js
// Full NEC-style Half-Wave Dipole antenna engine

import EngineTemplate from "./EngineTemplate.js";

export default class DipoleEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Half‑Wave Dipole";
        this.metadata.configuration = "Center‑Fed λ/2 Dipole";
        this.metadata.dxTurbo = false;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // End‑effect correction
        const endEffect = cfg.endEffectFactor || 0.96;
        const totalLength = (λ / 2) * endEffect;

        const arm = totalLength / 2;

        const elements = [
            {
                name: "Left Arm",
                type: "Driven",
                length: arm,
                position: -arm
            },
            {
                name: "Right Arm",
                type: "Driven",
                length: arm,
                position: arm
            }
        ];

        this.metadata.elementCount = 2;

        return {
            elements,
            totalBoom: totalLength,
            totalWire: totalLength
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        // Free‑space dipole impedance
        let R = 72;
        let X = 0;

        // Height above ground affects impedance
        if (cfg.height) {
            const hλ = cfg.height / this.wavelengthMeters();
            if (hλ < 0.25) {
                R -= 20 * (0.25 - hλ);
                X += 15 * (0.25 - hλ);
            }
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 2.15; // dBi free‑space dipole

        // Height above ground increases gain
        if (cfg.height) {
            const hλ = cfg.height / this.wavelengthMeters();
            baseGain += Math.min(hλ * 3, 3); // up to +3 dB
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

        // Azimuth: figure‑8 pattern
        for (let deg = 0; deg < 360; deg += 5) {
            const rad = (deg * Math.PI) / 180;
            const gain = 2.15 * Math.sin(rad) ** 2;
            az.push({ angle: deg, gain });
        }

        // Elevation: depends on height
        const hλ = (this.config.height || 5) / this.wavelengthMeters();

        for (let deg = 0; deg <= 90; deg += 2) {
            const rad = (deg * Math.PI) / 180;
            const gain = 1 + 4 * Math.sin(rad) ** 2 * Math.exp(-deg / (10 + hλ * 20));
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: Math.max(10, 30 - hλ * 20),
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Radials (none for dipole)
    // ------------------------------------------------------------
    computeRadials() {
        return {
            count: 0,
            length: 0,
            elevated: false
        };
    }
}
