/* ---------------------------------------------------------
   HF Workbench — Performer Vertical
   Compact loaded vertical with DX Turbo support
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";

function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

function computePerformer(freqMHz, heightM) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = heightM / lambda;

    let baseGain = 0.8;
    if (frac > 0.20) baseGain = 1.2;
    if (frac > 0.25) baseGain = 1.5;

    const toa = Math.min(80, Math.max(18, 85 - frac * 140));

    return { lambda, frac, baseGain, toa };
}

export default function initPerformer(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Performer Vertical</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="pf-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Height (m)
                    <input id="pf-height" type="number" step="0.01" value="5">
                </label>

                <label>Ground Loss (Ω)
                    <input id="pf-groundloss" type="number" step="0.1" value="8">
                </label>
            </div>

            <h3>Boost Options</h3>
            <div class="field-grid">
                <label><input id="pf-boost-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="pf-boost-elevated" type="checkbox"> Elevated Radials</label>
                <label><input id="pf-boost-saltwater" type="checkbox"> Seaside Enhancement</label>
                <label><input id="pf-boost-dxturbo" type="checkbox"> DX Turbo (0.70λ)</label>
            </div>

            <button id="pf-compute" style="margin-top:1rem;">Compute Performer</button>

            <div id="pf-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("pf-freq");
    const heightInput = document.getElementById("pf-height");
    const groundLossInput = document.getElementById("pf-groundloss");

    const boostGroundScreen = document.getElementById("pf-boost-groundscreen");
    const boostElevated = document.getElementById("pf-boost-elevated");
    const boostSaltwater = document.getElementById("pf-boost-saltwater");
    const boostDXTurbo = document.getElementById("pf-boost-dxturbo");

    const summaryDiv = document.getElementById("pf-summary");
    const button = document.getElementById("pf-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const groundLoss = toNumber(groundLossInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);
        if (groundLoss < 0) errors.push("Ground loss must be ≥ 0 Ω.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const base = computePerformer(freq, height);

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: boostDXTurbo.checked
        });

        const totalGain = base.baseGain + boost.totalBoost;

        log("Performer", {
            freq,
            height,
            groundLoss,
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

            <p><strong>Base Gain:</strong> ${base.baseGain.toFixed(1)} dBi</p>
            <p><strong>TOA:</strong> ${base.toa.toFixed(0)}°</p>

            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>

            <p><strong>Note:</strong> The telescopic whip can be replaced with antenna wire with identical response.</p>
        `);
    });
}
