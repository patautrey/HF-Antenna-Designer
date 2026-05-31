/* ---------------------------------------------------------
   HF Workbench — Doublet Module (Fixed)
   Center-fed doublet with pattern, gain, TOA estimates
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

/* Wavelength (meters) */
function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

/* Doublet model */
function computeDoublet(freqMHz, legLengthM, heightM) {
    const lambda = wavelengthMeters(freqMHz);
    const totalLength = legLengthM * 2;
    const frac = totalLength / lambda;

    // Pattern classification
    let pattern = "Broadside NVIS-ish";
    if (frac > 1.2 && frac <= 2.0) pattern = "Multi-lobe, some broadside gain";
    if (frac > 2.0) pattern = "Complex multi-lobe pattern";

    // Gain classification
    let gain = 1.5;
    if (frac >= 0.9 && frac <= 1.1) gain = 2.1;
    if (frac > 1.1 && frac <= 2.0) gain = 3.0;
    if (frac > 2.0) gain = 4.0;

    // TOA from height
    const hFrac = heightM / lambda;
    const toa = Math.min(80, Math.max(20, 90 - hFrac * 120));

    return { lambda, totalLength, frac, pattern, gain, toa };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initDoublet(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Doublet Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="dbl-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Leg Length (m)
                    <input id="dbl-leg" type="number" step="0.1" value="20">
                </label>

                <label>Height (m)
                    <input id="dbl-height" type="number" step="0.1" value="10">
                </label>
            </div>

            <button id="dbl-compute" style="margin-top:1rem;">Compute Doublet</button>

            <div id="dbl-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("dbl-freq");
    const legInput = document.getElementById("dbl-leg");
    const heightInput = document.getElementById("dbl-height");
    const summaryDiv = document.getElementById("dbl-summary");
    const button = document.getElementById("dbl-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const leg = toNumber(legInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(leg, "Leg length", errors);
        requirePositive(height, "Height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const model = computeDoublet(freq, leg, height);

        log("Doublet", { freq, leg, height, model });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Total length:</strong> ${model.totalLength.toFixed(1)} m  
               (${(model.frac * 100).toFixed(1)}% of λ)</p>

            <p><strong>Height:</strong> ${height.toFixed(1)} m  
               (${(height / model.lambda * 100).toFixed(1)}% of λ)</p>

            <p><strong>Estimated pattern:</strong> ${model.pattern}</p>

            <p><strong>Estimated broadside gain:</strong> ${model.gain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${model.toa.toFixed(0)}°</p>
        `);
    });
}
