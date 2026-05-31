/* ---------------------------------------------------------
   Antenna Workbench — Dominator Array
   Multi-element phased vertical array + boost controls
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";

function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

function computeArrayGain(freqMHz, elements, spacingM, phaseDeg, heightM, radialCount, groundType) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = heightM / lambda;

    let baseSingle = 1.5;
    if (groundType === "good") baseSingle += 0.8;
    if (groundType === "poor") baseSingle -= 0.8;
    if (groundType === "saltwater") baseSingle += 2.0;

    const radialFactor = Math.log10(Math.max(1, radialCount)) * 1.2;
    baseSingle += radialFactor;

    const nGain = 10 * Math.log10(Math.max(1, elements));
    const spacingLambda = spacingM / lambda;
    const phaseNorm = Math.abs(phaseDeg) / 90;
    const directivityBonus = Math.min(3, spacingLambda * 3 * phaseNorm);

    const arrayGain = baseSingle + nGain + directivityBonus;
    const toa = Math.max(5, 20 - (frac - 0.25) * 40);

    return {
        lambda,
        frac,
        baseSingle,
        arrayGain,
        spacingLambda,
        toa
    };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initDominator(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Dominator Array</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="dom-freq" type="number" step="0.01" value="14.1">
                </label>

                <label>Elements
                    <input id="dom-elements" type="number" value="2" min="2" max="8">
                </label>

                <label>Spacing (m)
                    <input id="dom-spacing" type="number" step="0.1" value="10">
                </label>

                <label>Phase Shift (°)
                    <input id="dom-phase" type="number" step="5" value="90">
                </label>

                <label>Height (m)
                    <input id="dom-height" type="number" step="0.1" value="10">
                </label>

                <label>Radial Count (per element)
                    <input id="dom-radials" type="number" value="8">
                </label>
            </div>

            <label>Ground Type
                <select id="dom-ground">
                    <option value="good">Good soil</option>
                    <option value="average" selected>Average soil</option>
                    <option value="poor">Poor soil</option>
                    <option value="saltwater">Saltwater</option>
                </select>
            </label>

            <h3 style="margin-top:1rem;">Boost Controls</h3>
            <div class="field-grid">
                <label><input id="dom-boost-groundscreen" type="checkbox"> Ground screen</label>
                <label><input id="dom-boost-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="dom-boost-saltwater" type="checkbox"> Saltwater enhancement</label>
                <label><input id="dom-boost-dxturbo" type="checkbox"> 0.70λ DX Turbo</label>
            </div>

            <button id="dom-compute" style="margin-top:1rem;">Compute Dominator Array</button>

            <div id="dom-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("dom-freq");
    const elementsInput = document.getElementById("dom-elements");
    const spacingInput = document.getElementById("dom-spacing");
    const phaseInput = document.getElementById("dom-phase");
    const heightInput = document.getElementById("dom-height");
    const radialsInput = document.getElementById("dom-radials");
    const groundSelect = document.getElementById("dom-ground");

    const boostGroundScreen = document.getElementById("dom-boost-groundscreen");
    const boostElevated = document.getElementById("dom-boost-elevated");
    const boostSaltwater = document.getElementById("dom-boost-saltwater");
    const boostDxTurbo = document.getElementById("dom-boost-dxturbo");

    const summaryDiv = document.getElementById("dom-summary");
    const button = document.getElementById("dom-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const elements = toNumber(elementsInput.value);
        const spacing = toNumber(spacingInput.value);
        const phase = toNumber(phaseInput.value);
        const height = toNumber(heightInput.value);
        const radials = toNumber(radialsInput.value);
        const ground = groundSelect.value;

        requireFrequency(freq, errors);
        requirePositive(elements, "Elements", errors);
        requirePositive(spacing, "Spacing", errors);
        requirePositive(height, "Height", errors);
        requirePositive(radials, "Radial count", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const base = computeArrayGain(freq, elements, spacing, phase, height, radials, ground);

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: boostDxTurbo.checked
        });

        const totalGain = base.arrayGain + boost.totalBoost;

        log("Dominator Array", {
            freq,
            elements,
            spacing,
            phase,
            height,
            radials,
            ground,
            base,
            boost
        });

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Elements:</strong> ${elements}</p>
            <p><strong>Spacing:</strong> ${spacing.toFixed(1)} m (${base.spacingLambda.toFixed(2)} λ)</p>
            <p><strong>Phase shift:</strong> ${phase.toFixed(0)}°</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m (${(base.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Radials per element:</strong> ${radials}</p>
            <p><strong>Ground type:</strong> ${ground}</p>
            <p><strong>Single-element base gain:</strong> ${base.baseSingle.toFixed(1)} dBi</p>
            <p><strong>Array gain (before boost):</strong> ${base.arrayGain.toFixed(1)} dBi</p>
            <p><strong>Total boost:</strong> +${boost.totalBoost.toFixed(1)} dB</p>
            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>
            <p><strong>Estimated array DX gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${base.toa.toFixed(0)}°</p>
        `);
    });
}
