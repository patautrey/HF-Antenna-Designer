/* ---------------------------------------------------------
   HF Workbench — Loop Module (Fixed)
   Simple single-turn loop (perimeter + height)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

/* Wavelength (meters) */
function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

/* Loop model */
function computeLoop(freqMHz, perimeterM, heightM) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = perimeterM / lambda;

    let pattern = "High-angle NVIS-ish";
    if (frac >= 0.8 && frac <= 1.2) pattern = "Near full-wave loop, NVIS + some DX";
    if (frac > 1.2) pattern = "Multi-lobe, multi-band behavior";

    let gain = 1.5;
    if (frac >= 0.8 && frac <= 1.2) gain = 2.5;
    if (frac > 1.2) gain = 3.5;

    const hFrac = heightM / lambda;
    const toa = Math.min(80, Math.max(15, 85 - hFrac * 110));

    return { lambda, frac, pattern, gain, toa };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Loop Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="lp-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Perimeter (m)
                    <input id="lp-perim" type="number" step="0.1" value="40">
                </label>

                <label>Height (m)
                    <input id="lp-height" type="number" step="0.1" value="10">
                </label>
            </div>

            <button id="lp-compute" style="margin-top:1rem;">Compute Loop</button>

            <div id="lp-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("lp-freq");
    const perimInput = document.getElementById("lp-perim");
    const heightInput = document.getElementById("lp-height");
    const summaryDiv = document.getElementById("lp-summary");
    const button = document.getElementById("lp-compute");

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
        const model = computeLoop(freq, perim, height);

        log("Loop", { freq, perim, height, model });

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
