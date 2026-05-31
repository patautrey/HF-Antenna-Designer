/* ---------------------------------------------------------
   Antenna Workbench — Vertical NVIS Designer
   Short vertical with NVIS focus + boost controls
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";
import { computeNVISReflector, logNVISReflector } from "../engines/nvis-reflector.js";

/* LOCAL WAVELENGTH (meters) */
function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

/* BASE MODEL */
function computeVerticalNVIS(freqMHz, heightM) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = heightM / lambda;

    let baseGain = 0.5; // dBi baseline
    const toa = Math.min(80, Math.max(30, 60 + (0.25 - frac) * 80));

    return { lambda, frac, baseGain, toa };
}

function estimateFeedZ(freqMHz, groundLossOhms) {
    const base = 25;
    return base + groundLossOhms;
}

function estimateGain(base, groundLossOhms) {
    const lossDb = Math.log10(Math.max(1, groundLossOhms)) * 1.5;
    return base.baseGain - lossDb;
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initVerticalNVIS(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical NVIS Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vn-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Height (m)
                    <input id="vn-height" type="number" step="0.01" value="5">
                </label>

                <label>Top Hat Length (m)
                    <input id="vn-tophat" type="number" step="0.01" value="0">
                </label>

                <label>Ground Loss (Ω)
                    <input id="vn-groundloss" type="number" step="0.1" value="10">
                </label>

                <label>Radial Count
                    <input id="vn-radials" type="number" value="8">
                </label>

                <label>Radial Length (m)
                    <input id="vn-radial-length" type="number" step="0.1" value="5">
                </label>
            </div>

            <h3 style="margin-top:1rem;">Boost Controls</h3>
            <div class="field-grid">
                <label><input id="vn-boost-groundscreen" type="checkbox"> Ground screen</label>
                <label><input id="vn-boost-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="vn-boost-saltwater" type="checkbox"> Saltwater enhancement</label>
                <label><input id="vn-boost-nvis" type="checkbox"> NVIS reflector grid</label>
            </div>

            <button id="vn-compute" style="margin-top:1rem;">Compute Vertical NVIS</button>

            <div id="vn-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("vn-freq");
    const heightInput = document.getElementById("vn-height");
    const topHatInput = document.getElementById("vn-tophat");
    const groundLossInput = document.getElementById("vn-groundloss");
    const radialsInput = document.getElementById("vn-radials");
    const radialLenInput = document.getElementById("vn-radial-length");

    const boostGroundScreen = document.getElementById("vn-boost-groundscreen");
    const boostElevated = document.getElementById("vn-boost-elevated");
    const boostSaltwater = document.getElementById("vn-boost-saltwater");
    const boostNvis = document.getElementById("vn-boost-nvis");

    const summaryDiv = document.getElementById("vn-summary");
    const button = document.getElementById("vn-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const topHat = toNumber(topHatInput.value);
        const groundLoss = toNumber(groundLossInput.value);
        const radials = toNumber(radialsInput.value);
        const radialLen = toNumber(radialLenInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);
        requirePositive(radials, "Radial count", errors);
        requirePositive(radialLen, "Radial length", errors);
        if (groundLoss < 0) errors.push("Ground loss must be ≥ 0 Ω.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const base = computeVerticalNVIS(freq, height);
        const feedZ = estimateFeedZ(freq, groundLoss);
        const baseGain = estimateGain(base, groundLoss);

        let nvisInfo = null;
        if (boostNvis.checked) {
            nvisInfo = computeNVISReflector(freq, height, radials, radialLen);
            logNVISReflector("Vertical NVIS", nvisInfo);
        }

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: false
        });

        const totalGain = baseGain + boost.totalBoost;

        log("Vertical NVIS", {
            freq,
            height,
            topHat,
            groundLoss,
            radials,
            radialLen,
            base,
            feedZ,
            baseGain,
            boost,
            nvisInfo
        });

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        const nvisLines = nvisInfo
            ? `<p><strong>NVIS reflector:</strong> enabled<br>${nvisInfo.summary}</p>`
            : `<p><strong>NVIS reflector:</strong> disabled</p>`;

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m (${(base.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Top hat length:</strong> ${topHat.toFixed(1)} m</p>
            <p><strong>Radials:</strong> ${radials} × ${radialLen.toFixed(1)} m</p>
            <p><strong>Estimated feedpoint Z:</strong> ${feedZ.toFixed(0)} Ω</p>
            <p><strong>Base estimated NVIS gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Total boost:</strong> +${boost.totalBoost.toFixed(1)} dB</p>
            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>
            <p><strong>Estimated NVIS gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${base.toa.toFixed(0)}°</p>
            ${nvisLines}
        `);
    });
}
