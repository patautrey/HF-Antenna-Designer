/* ---------------------------------------------------------
   HF Workbench — Dominator Array
   Multi-element vertical array with DX Turbo support
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";

function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

function computeDominator(freqMHz, heightM, spacingM) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = heightM / lambda;

    const arrayGain = 2.6 + (spacingM / lambda) * 1.2;

    const toa = Math.min(80, Math.max(12, 75 - frac * 150));

    return { lambda, frac, arrayGain, toa };
}

export default function initDominator(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Dominator Vertical Array</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="dm-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Height (m)
                    <input id="dm-height" type="number" step="0.01" value="5">
                </label>

                <label>Spacing (m)
                    <input id="dm-spacing" type="number" step="0.01" value="6">
                </label>
            </div>

            <h3>Boost Options</h3>
            <div class="field-grid">
                <label><input id="dm-boost-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="dm-boost-elevated" type="checkbox"> Elevated Radials</label>
                <label><input id="dm-boost-saltwater" type="checkbox"> Seaside Enhancement</label>
                <label><input id="dm-boost-dxturbo" type="checkbox"> DX Turbo (0.70λ)</label>
            </div>

            <button id="dm-compute" style="margin-top:1rem;">Compute Dominator</button>

            <div id="dm-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("dm-freq");
    const heightInput = document.getElementById("dm-height");
    const spacingInput = document.getElementById("dm-spacing");

    const boostGroundScreen = document.getElementById("dm-boost-groundscreen");
    const boostElevated = document.getElementById("dm-boost-elevated");
    const boostSaltwater = document.getElementById("dm-boost-saltwater");
    const boostDXTurbo = document.getElementById("dm-boost-dxturbo");

    const summaryDiv = document.getElementById("dm-summary");
    const button = document.getElementById("dm-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const spacing = toNumber(spacingInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);
        requirePositive(spacing, "Spacing", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const base = computeDominator(freq, height, spacing);

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: boostDXTurbo.checked
        });

        const totalGain = base.arrayGain + boost.totalBoost;

        log("Dominator", {
            freq,
            height,
            spacing,
            base,
            boost,
            totalGain
        });

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Height:</strong> ${height.toFixed(2)} m  
               (${(base.frac * 100).toFixed(1)}% of λ)</p>

            <p><strong>Element Spacing:</strong> ${spacing.toFixed(2)} m</p>

            <p><strong>Array Gain:</strong> ${base.arrayGain.toFixed(1)} dBi</p>
            <p><strong>TOA:</strong> ${base.toa.toFixed(0)}°</p>

            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>

            <p><strong>Note:</strong> The telescopic whip can be replaced with antenna wire with identical response.</p>
        `);
    });
}
