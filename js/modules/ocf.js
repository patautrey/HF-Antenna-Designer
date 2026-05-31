/* ---------------------------------------------------------
   HF Workbench — OCF Dipole
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function ocfBaseGain(freqMHz, totalLengthM) {
    const lambda = 300 / freqMHz;
    const frac = totalLengthM / lambda;
    if (frac < 0.4) return 1.5;
    if (frac < 0.6) return 2.0;
    return 2.5;
}

export default function initOCF(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>OCF Dipole</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="ocf-freq" type="number" step="0.01" value="7.1">
                </label>
                <label>Total length (m)
                    <input id="ocf-length" type="number" step="0.5" value="40">
                </label>
                <label>Offset (% from center)
                    <input id="ocf-offset" type="number" step="1" value="33">
                </label>
                <label>Height (m)
                    <input id="ocf-height" type="number" step="0.5" value="10">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Time of day
                    <select id="ocf-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label>Feedline type
                    <select id="ocf-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="ocf-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="ocf-compute" style="margin-top:1rem;">Compute OCF Dipole</button>

            <div id="ocf-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("ocf-freq");
    const lengthInput = document.getElementById("ocf-length");
    const offsetInput = document.getElementById("ocf-offset");
    const heightInput = document.getElementById("ocf-height");
    const todInput = document.getElementById("ocf-tod");
    const feedTypeInput = document.getElementById("ocf-feed-type");
    const feedLenInput = document.getElementById("ocf-feed-length");

    const summaryDiv = document.getElementById("ocf-summary");
    const button = document.getElementById("ocf-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const offset = toNumber(offsetInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Total length", errors);
        requirePositive(height, "Height", errors);
        if (offset <= 0 || offset >= 50) errors.push("Offset should typically be between 20% and 40% from center.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const baseGain = ocfBaseGain(freq, length);

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: false,
            groundScreen: false,
            elevatedRadials: false,
            nvisReflector: false,
            feedlineFamily: "coax",
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + boost.totalBoost;
        const finalToa = Math.max(20, Math.min(80, 90 - (height / (300 / freq)) * 120));

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("ocf", "coax");

        log("OCF", {
            freq,
            length,
            offset,
            height,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Total length:</strong> ${length.toFixed(1)} m</p>
            <p><strong>Offset:</strong> ${offset.toFixed(1)}% from center</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m</p>
            <p><strong>Base Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>
            ${transformerHtml}
        `);
    });
}
