// engines/EngineTemplate.js
export default class EngineTemplate {
    constructor(config) {
        this.config = config;
        this.freq = config.freq;
        this.lambda = 300 / this.freq;
    }

    computeGeometry() {
        return {
            wavelength: this.lambda,
            radiatorLength: this.lambda * this.config.vf,
            pvcDiameter: this.config.pvc
        };
    }

    computeImpedance() {
        return {
            R: 50 + (this.config.radials < 8 ? 10 : 0),
            X: this.config.react * 0.05
        };
    }

    computeGain() {
        let gain = 2.1;

        if (this.config.turbo === "on") gain += 3.0;
        if (this.config.seaside === "seaside") gain += 5.0;

        return { gain };
    }

    computeEfficiency() {
        const radLoss = 5 / this.config.radials;
        const eff = 100 - radLoss;
        return { efficiency: eff };
    }

    computeTOA() {
        return { toa: 14 };
    }

    computeERP() {
        const gainLinear = Math.pow(10, this.computeGain().gain / 10);
        const erp = this.config.power * gainLinear * Math.pow(10, -this.config.loss / 10);
        return { erp };
    }

    run() {
        return {
            geometry: this.computeGeometry(),
            impedance: this.computeImpedance(),
            gain: this.computeGain(),
            efficiency: this.computeEfficiency(),
            toa: this.computeTOA(),
            erp: this.computeERP()
        };
    }
}
