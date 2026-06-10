// HF-Antenna-Designer/engines/EngineTemplate.js
// Base template for all antenna engines (NEC-style output)

export default class EngineTemplate {
    constructor(config) {
        this.config = config;

        // Required metadata fields
        this.metadata = {
            name: "Unnamed Antenna",
            type: config.type || "unknown",
            wavelength: 0,
            configuration: "",
            elementCount: 0,
            dxTurbo: false,
            seaside: false
        };
    }

    // ------------------------------------------------------------
    // Utility: compute wavelength from frequency
    // ------------------------------------------------------------
    wavelengthMeters() {
        return 299792458 / this.config.frequency;
    }

    // ------------------------------------------------------------
    // Main simulation entry point
    // ------------------------------------------------------------
    async calculate() {
        // 1. Compute wavelength
        this.metadata.wavelength = this.wavelengthMeters();

        // 2. Compute geometry
        const geometry = this.computeGeometry();

        // 3. Compute impedance + SWR
        const impedance = this.computeImpedance();
        const swr = this.computeSWR(impedance);

        // 4. Compute gain + boosts
        const gain = this.computeGain();

        // 5. Compute efficiency
        const efficiency = this.computeEfficiency(impedance);

        // 6. Compute patterns
        const pattern = this.computePatterns();

        // 7. Radial system
        const radials = this.computeRadials();

        // --------------------------------------------------------
        // Return NEC-style result object
        // --------------------------------------------------------
        return {
            metadata: this.metadata,
            geometry,
            impedance,
            swr,
            gain,
            efficiency,
            pattern,
            radials
        };
    }

    // ------------------------------------------------------------
    // Geometry (override in each antenna engine)
    // ------------------------------------------------------------
    computeGeometry() {
        return {
            elements: [],
            totalBoom: 0,
            totalWire: 0
        };
    }

    // ------------------------------------------------------------
    // Impedance (override)
    // ------------------------------------------------------------
    computeImpedance() {
        return {
            R: 50,
            X: 0
        };
    }

    // ------------------------------------------------------------
    // SWR (generic)
    // ------------------------------------------------------------
    computeSWR(impedance) {
        const Z0 = 50;
        const { R, X } = impedance;
        const gamma = Math.sqrt(((R - Z0) ** 2 + X ** 2) / ((R + Z0) ** 2 + X ** 2));
        const swr = (1 + gamma) / (1 - gamma);

        return {
            atFreq: swr,
            bandwidth2to1: 0,
            bandwidth3to1: 0
        };
    }

    // ------------------------------------------------------------
    // Gain (override)
    // ------------------------------------------------------------
    computeGain() {
        return {
            maxGain: 0,
            fb: 0,
            environmentBoost: 0
        };
    }

    // ------------------------------------------------------------
    // Efficiency (override)
    // ------------------------------------------------------------
    computeEfficiency(impedance) {
        return {
            radiationResistance: impedance.R,
            groundLoss: 0,
            totalResistance: impedance.R,
            radiationEfficiency: 100,
            erp: this.config.power || 100
        };
    }

    // ------------------------------------------------------------
    // Patterns (override)
    // ------------------------------------------------------------
    computePatterns() {
        return {
            azimuth: [],
            elevation: [],
            maxTOA: 0,
            pattern3D: null
        };
    }

    // ------------------------------------------------------------
    // Radials (override)
    // ------------------------------------------------------------
    computeRadials() {
        return {
            count: this.config.radials || 0,
            length: 0,
            elevated: false
        };
    }
}
