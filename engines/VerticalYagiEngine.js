// HF-Antenna-Designer/engines/VerticalYagiEngine.js
// Full NEC-style Vertical Yagi engine (reflector + driven + directors)

import EngineTemplate from "./EngineTemplate.js";

export default class VerticalYagiEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Vertical Yagi";
        this.metadata.configuration = "Reflector + Driven + Directors";
        this.metadata.dxTurbo = !!config.dxTurbo;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        const drivenLength = cfg.dxTurbo ? 0.70 * λ : 0.48 * λ;
        const directorLength = cfg.directorLengthFactor * λ;
        const reflectorLength = cfg.reflectorLengthFactor * λ;

        const spacing = cfg.directorSpacing * λ;

        const elements = [];

        // Reflector
        elements.push({
            name: "Reflector",
            type: "Reflector",
            length: reflectorLength,
            position: -spacing
        });

        // Driven
        elements.push({
            name: "Driven",
            type: "Driven",
            length: drivenLength,
            position: 0
        });

        // Directors
        for (let i = 0; i < cfg.directors; i++) {
            elements.push({
                name: `Director ${i + 1}`,
                type: "Director",
                length: directorLength,
                position: spacing * (i + 1)
            });
        }

        this.metadata.elementCount = elements.length;

        return {
            elements,
            totalBoom: spacing * (cfg.directors + 1),
            totalWire: elements.reduce((sum, e) => sum + e.length, 0)
        };
    }

    // ------------------------------------------------------------
    // Impedance
    // ------------------------------------------------------------
    computeImpedance() {
        const cfg = this.config;

        let R = 55;
        let X = 12;

        if (cfg.dxTurbo) {
            R += 10;
            X += 10;
        }

        if (cfg.directors > 1) {
            R += cfg.directors * 2;
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 5.5; // dBi for a simple vertical

        // Reflector boost
        baseGain += 2.0;

        // Directors
        baseGain += cfg.directors * 1.2;

        // DX Turbo
        if (cfg.dxTurbo) baseGain += 1.5;

        // Seaside
        let seasideBoost = cfg.seaside ? 3.0 : 0;

        return {
            maxGain: baseGain + seasideBoost,
            fb: 20 + cfg.directors * 3,
            environmentBoost: seasideBoost
        };
    }

    // ------------------------------------------------------------
    // Efficiency
    // ------------------------------------------------------------
    computeEfficiency(impedance) {
        const cfg = this.config;

        const radRes = impedance.R;
        const groundLoss = cfg.radials >= 8 ? 2.0 : 5.0;
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

        // Azimuth: cardioid-ish
        for (let deg = 0; deg < 360; deg += 5) {
            const gain = 2 + 8 * Math.cos((deg * Math.PI) / 180);
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
    // Radials
    // ------------------------------------------------------------
    computeRadials() {
        const cfg = this.config;

        return {
            count: cfg.radials || 4,
            length: cfg.radialLengthFactor * this.wavelengthMeters(),
            elevated: !!cfg.elevatedRadials
        };
    }
}
