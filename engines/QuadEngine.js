// HF-Antenna-Designer/engines/QuadEngine.js
// Full NEC-style Quad antenna engine (reflector + driven + directors)

import EngineTemplate from "./EngineTemplate.js";

export default class QuadEngine extends EngineTemplate {
    constructor(config) {
        super(config);

        this.metadata.name = "Quad Antenna";
        this.metadata.configuration = "Reflector + Driven + Director Loops";
        this.metadata.dxTurbo = !!config.dxTurbo;
        this.metadata.seaside = !!config.seaside;
    }

    // ------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------
    computeGeometry() {
        const λ = this.wavelengthMeters();
        const cfg = this.config;

        // Loop perimeters
        const drivenPerimeter = cfg.drivenPerimeterFactor * λ;
        const reflectorPerimeter = cfg.reflectorPerimeterFactor * λ;
        const directorPerimeter = cfg.directorPerimeterFactor * λ;

        // Boom spacing
        const spacing = cfg.spacingFactor * λ;

        const elements = [];

        // Reflector
        elements.push({
            name: "Reflector Loop",
            type: "Reflector",
            length: reflectorPerimeter,
            position: -spacing
        });

        // Driven
        elements.push({
            name: "Driven Loop",
            type: "Driven",
            length: drivenPerimeter,
            position: 0
        });

        // Directors
        for (let i = 0; i < cfg.directors; i++) {
            elements.push({
                name: `Director Loop ${i + 1}`,
                type: "Director",
                length: directorPerimeter,
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

        // Typical quad driven impedance
        let R = 120;
        let X = -10;

        // Directors tighten impedance
        R -= cfg.directors * 5;
        X += cfg.directors * 3;

        // DX Turbo shifts resonance
        if (cfg.dxTurbo) {
            R += 10;
            X += 12;
        }

        return { R, X };
    }

    // ------------------------------------------------------------
    // Gain
    // ------------------------------------------------------------
    computeGain() {
        const cfg = this.config;

        let baseGain = 6.0; // driven + reflector

        // Directors add gain
        baseGain += cfg.directors * 1.4;

        // DX Turbo
        if (cfg.dxTurbo) baseGain += 1.2;

        // Seaside
        let seasideBoost = cfg.seaside ? 3.0 : 0;

        return {
            maxGain: baseGain + seasideBoost,
            fb: 18 + cfg.directors * 4,
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

        // Azimuth: strong forward lobe
        for (let deg = 0; deg < 360; deg += 5) {
            const rad = (deg * Math.PI) / 180;
            const gain = 2 + 10 * Math.cos(rad);
            az.push({ angle: deg, gain });
        }

        // Elevation: low-angle lobe
        for (let deg = 0; deg <= 90; deg += 2) {
            const gain = 1 + 6 * Math.exp(-deg / 18);
            el.push({ angle: deg, gain });
        }

        return {
            azimuth: az,
            elevation: el,
            maxTOA: 16,
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Radials (quads do not use radials)
    // ------------------------------------------------------------
    computeRadials() {
        return {
            count: 0,
            length: 0,
            elevated: false
        };
    }
}
