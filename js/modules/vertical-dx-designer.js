/* ---------------------------------------------------------
   Antenna Workbench — Vertical DX Designer
   1/4-wave vertical with radials + boost controls
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../boost-engine.js";

/* LOCAL WAVELENGTH (meters) */
function wavelengthMeters(freqMHz) {
    return 300 / freqMHz;
}

/* BASE MODEL */
function computeVerticalDX(freqMHz, heightM, radialCount, radialLengthM, groundType) {
    const lambda = wavelengthMeters(freqMHz);
    const frac = heightM / lambda;

    let baseGain = 1.5; // baseline 1/4λ vertical

    if (groundType === "good") baseGain += 0.8;
    if (groundType === "poor") baseGain -= 0.8;
    if (groundType === "saltwater") baseGain += 2.0;

    const radialFactor = Math.log10(Math.max(1, radialCount)) * 1.2;
    const lengthFactor = Math.min(1, radialLengthM / (lambda / 4));
    baseGain += radialFactor * lengthFactor;

    const toa = Math.max(5, 25 - (frac - 0.25) * 40);

    return { lambda, frac, baseGain, toa };
}

/* ---------------------------------------------------------
   EXPORT DEFAULT
--------------------------------------------------------- */
export default function initVerticalDX(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical DX Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vdx-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Height (m)
                    <input id="vdx-height" type="number" step="0.01" value="10">
                </label>

                <label>Radial Count
                    <input id="vdx-radials" type="number" value="8">
                </label>

                <label>Radial Length (m)
                    <input id="vdx-radial-length" type="number" step="0.01" value="5">
                </label>
            </div>

            <label>Ground Type
                <select id="vdx-ground">
                    <option value="good">Good soil</option>
                    <option value="average" selected>Average soil</option>
                    <option value="poor">Poor soil</option>
                    <option value="saltwater">Saltwater</option>
                </select>
            </label>

            <h3 style="margin-top:1rem;">Boost Controls</h3>
            <div class="field-grid">
                <label><input id="vdx-boost-groundscreen" type="checkbox"> Ground screen</label>
                <label><input id="vdx-boost-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="vdx-boost-saltwater" type="checkbox"> Saltwater enhancement</label>
                <label><input id="vdx-boost-dxturbo" type="checkbox"> 0.70λ DX Turbo</label>
            </div>

            <button id="vdx-compute" style="margin-top:1rem;">Compute Vertical DX</button>

            <div id="vdx-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("vdx-freq");
    const heightInput = document.getElementById("vdx-height");
    const radialsInput = document.getElementById("vdx-radials");
    const radialLenInput = document.getElementById("vdx-radial-length");
    const groundSelect = document.getElementById("vdx-ground");

    const boostGroundScreen = document.getElementById("vdx-boost-groundscreen");
    const boostElevated = document.getElementById("vdx-boost-elevated");
    const boostSaltwater = document.getElementById("vdx-boost-saltwater");
    const boostDxTurbo = document.getElementById("vdx-boost-dxturbo");

    const summaryDiv = document.getElementById("vdx-summary");
    const button = document.getElementById("vdx-compute");

    if (!button || !summaryDiv) return;

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        let height = toNumber(heightInput.value);
        const radials = toNumber(radialsInput.value);
        const radialLen = toNumber(radialLenInput.value);
        const ground = groundSelect.value;

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);
        requirePositive(radials, "Radial count", errors);
        requirePositive(radialLen, "Radial length", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const lambda = wavelengthMeters(freq);

        // DX Turbo: force height to 0.70 λ and lock field
        let turboNote = "";
        if (boostDxTurbo.checked) {
            const turboHeight = 0.70 * lambda;
            height = turboHeight;
            heightInput.value = turboHeight.toFixed(2);
            heightInput.readOnly = true;
            turboNote = `<p><strong>DX Turbo:</strong> radiator height forced to 0.70 λ (${turboHeight.toFixed(2)} m)</p>`;
        } else {
            heightInput.readOnly = false;
        }

        const band = findBand(freq);
        const base = computeVerticalDX(freq, height, radials, radialLen, ground);

        const boost = BoostEngine.computeBoost({
            groundScreen: boostGroundScreen.checked,
            elevatedRadials: boostElevated.checked,
            saltwater: boostSaltwater.checked,
            dxTurbo: boostDxTurbo.checked
        });

        const totalGain = base.baseGain + boost.totalBoost;

        log("Vertical DX", {
            freq,
            height,
            radials,
            radialLen,
            ground,
            base,
            boost
        });

        const boostLines = boost.details.length
            ? boost.details.map(d => `+${d.boost.toFixed(1)} dB from ${d.label}`).join("<br>")
            : "No boost options enabled.";

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m (${(base.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Radials:</strong> ${radials} × ${radialLen.toFixed(1)} m</p>
            <p><strong>Ground type:</strong> ${ground}</p>
            <p><strong>Base estimated gain:</strong> ${base.baseGain.toFixed(1)} dBi</p>
            <p><strong>Total boost:</strong> +${boost.totalBoost.toFixed(1)} dB</p>
            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>
            <p><strong>Estimated DX gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${base.toa.toFixed(0)}°</p>
            ${turboNote}
        `);
    });
}
