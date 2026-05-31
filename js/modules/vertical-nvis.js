/* ---------------------------------------------------------
   HF Workbench — Vertical NVIS (non-designer)
   Short vertical with NVIS focus + optional reflector
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
            <h2>Vertical NVIS</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vn2-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Height (m)
                    <input id="vn2-height" type="number" step="0.01" value="5">
                </label>

                <label>Ground Loss (Ω)
                    <input id="vn2-groundloss" type="number" step="0.1" value="10">
                </label>

                <label>Radial Count
                    <input id="vn2-radials" type="number" value="8">
                </label>

                <label>Radial Length (m)
                    <input id="vn2-radial-length" type="number" step="0.1" value="5">
                </label>
            </div>

            <h3 style="margin-top:1rem;">Boost Controls</h3>
            <div class="field-grid">
                <label><input id="vn2-boost-groundscreen" type="checkbox"> Ground screen</label>
                <label><input id="vn2-boost-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="vn2-boost-saltwater" type="checkbox"> Saltwater enhancement</label>
                <label><input id="vn2-boost-nvis" type="checkbox"> NVIS reflector grid</label>
            </div>

            <button id="vn2-compute" style="margin-top:1rem;">Compute Vertical NVIS</button>

            <div id="vn2-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    ";

    const freqInput = document.getElementById("vn2-freq");
    const heightInput = document.getElementById("vn2-height");
    const groundLossInput = document.getElementById("vn2-groundloss");
    const radialsInput = document.getElementById("vn2-radials");
    const radialLenInput = document.getElementById("vn2-radial-length");

    const boostGroundScreen = document.getElementById("vn2-boost-groundscreen");
    const boostElevated = document.getElementById("vn2-boost-elevated");
    const boostSaltwater = document.getElementById("vn2-boost-saltwater");
    const boostNvis = document.getElementById("vn2-boost-nvis");

    const summaryDiv = document.getElementById("vn2-summary");
    const button = document.getElementById("vn2-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const groundLoss = toNumber(groundLossInput.value);
        const radials = toNumber(radialsInput.value);
        const radialLen = toNumber(radialLenInput.value);

        requireFrequency(freq, errors);
        if (freq <= 0) errors.push("Frequency must be > 0 MHz.");
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

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: false
        });

        let reflectorInfo = null;
        let reflectorGain = 0;
        let toaWithReflector = null;

        if (boostNvis.checked) {
            reflectorInfo = computeNVISReflector(freq, height, radials, radialLen, base.toa);
            logNVISReflector("Vertical NVIS (simple)", reflectorInfo);
            reflectorGain = reflectorInfo.gainDb;
            toaWithReflector = reflectorInfo.toaDeg;
        }

        const totalGain = baseGain + boost.totalBoost + reflectorGain;

        log("Vertical NVIS (simple)", {
            freq,
            height,
            groundLoss,
            radials,
            radialLen,
            base,
            feedZ,
            baseGain,
            boost,
            reflectorInfo,
            totalGain
        });

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        const reflectorLines = reflectorInfo
            ? `
                <p><strong>NVIS reflector:</strong> enabled</p>
                <p><strong>Reflector spacing:</strong><br>
                    ${reflectorInfo.spacingLambda.toFixed(2)} λ<br>
                    ${reflectorInfo.spacingM.toFixed(2)} m<br>
                    ${reflectorInfo.spacingFt.toFixed(1)} ft (${reflectorInfo.spacingFeetInches})</p>
                <p><strong>Reflector height:</strong><br>
                    ${reflectorInfo.heightM.toFixed(2)} m<br>
                    ${reflectorInfo.heightFt.toFixed(1)} ft (${reflectorInfo.heightFeetInches})</p>
                <p><strong>Reflector gain:</strong> +${reflectorGain.toFixed(1)} dB</p>
                <p><strong>TOA (no reflector):</strong> ${base.toa.toFixed(0)}°<br>
                   <strong>TOA (reflector enabled):</strong> ${toaWithReflector.toFixed(0)}°</p>
            `
            : `
                <p><strong>NVIS reflector:</strong> disabled</p>
                <p><strong>TOA (no reflector):</strong> ${base.toa.toFixed(0)}°</p>
            `;

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m (${(base.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Radials:</strong> ${radials} × ${radialLen.toFixed(1)} m</p>
            <p><strong>Estimated feedpoint Z:</strong> ${feedZ.toFixed(0)} Ω</p>
            <p><strong>Base estimated NVIS gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Boost gain:</strong> +${boost.totalBoost.toFixed(1)} dB</p>
            ${reflectorLines}
            <p><strong>Total NVIS gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>
        `);
    });
}
