/* ---------------------------------------------------------
   HF Workbench — Skyloop Module (Fixed)
   Horizontal full-wave loop with NVIS / DX behavior
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

/* Wavelength (meters) */
function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

/* Skyloop model */
function computeSkyloop(freqMHz, perimeterM, heightM) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = perimeterM / lambda;

    let pattern = "High-angle NVIS dominant";
    if (frac > 1.2 && frac <= 2.0) pattern = "Mixed NVIS + low-angle lobes";
    if (frac > 2.0) pattern = "Multi-band, complex pattern";

    let gain = 2.0;
    if (frac >= 0.9 && frac <= 1.1) gain = 3.0;
    if (frac > 1.1 && frac <= 2.0) gain = 4.0;
    if (frac > 2.0) gain = 5.0;

    const hFrac = heightM / lambda;
    const toa = Math.min(80, Math.max(10, 80 - hFrac * 100));

    return { lambda, frac, pattern, gain, toa };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initSkyloop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Skyloop Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="sl-freq" type="number" step="0.01" value="3.8">
                </label>

                <label>Perimeter (m)
                    <input id="sl-perim" type="number" step="0.1" value="80">
                </label>

                <label>Height (m)
                    <input id="sl-height" type="number" step="0.1" value="12">
                </label>
            </div>

            <button id="sl-compute" style="margin-top:1rem;">Compute Skyloop</button>

            <div id="sl-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("sl-freq");
    const perimInput = document.getElementById("sl-perim");
    const heightInput = document.getElementById("sl-height");
    const summaryDiv = document.getElementById("sl-summary");
    const button = document.getElementById("sl-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const perim = toNumber(perimInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(perim, "Perimeter", errors);
        requirePositive(height, "Height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const model = computeSkyloop(freq, perim, height);

        log("Skyloop", { freq, perim, height, model });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Perimeter:</strong> ${perim.toFixed(1)} m  
               (${(model.frac * 100).toFixed(1)}% of λ)</p>

            <p><strong>Height:</strong> ${height.toFixed(1)} m  
               (${(height / model.lambda * 100).toFixed(1)}% of λ)</p>

            <p><strong>Estimated pattern:</strong> ${model.pattern}</p>

            <p><strong>Estimated gain:</strong> ${model.gain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${model.toa.toFixed(0)}°</p>
        `);
    });
}
