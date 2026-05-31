/* ---------------------------------------------------------
   HF Workbench — Doublet
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function doubletBaseGain(freqMHz, lengthM) {
    const lambda = 300 / freqMHz;
    const frac = lengthM / lambda;
    if (frac < 0.4) return 1.8;
    if (frac < 0.6) return 2.2;
    return 2.6;
}

export default function initDoublet(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Doublet</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="db-freq" type="number" step="0.01" value="7.1">
                </label>
                <label>Total length (m)
                    <input id="db-length" type="number" step="0.5" value="40">
                </label>
                <label>Height (m)
                    <input id="db-height" type="number" step="0.5" value="10">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Time of day
                    <select id="db-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label>Feedline type (ladder line)
                    <select id="db-feed-type">
                        <option value="450Ω">450Ω</option>
                        <option value="300Ω">300Ω</option>
                        <option value="600Ω">600Ω</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="db-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="db-compute" style="margin-top:1rem;">Compute Doublet</button>

            <div id="db-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("db-freq");
    const lengthInput = document.getElementById("db-length");
    const heightInput = document.getElementById("db-height");
    const todInput = document.getElementById("db-tod");
    const feedTypeInput = document.getElementById("db-feed-type");
    const feedLenInput = document.getElementById("db-feed-length");

    const summaryDiv = document.getElementById("db-summary");
    const button = document.getElementById("db-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Total length", errors);
        requirePositive(height, "Height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const baseGain = doubletBaseGain(freq, length);

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: false,
            groundScreen: false,
            elevatedRadials: false,
            nvisReflector: false,
            feedlineFamily: "ladder",
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

        const transformerHtml = TransformerEngine.getTransformerNote("doublet", "ladder");

        log("Doublet", {
            freq,
            length,
            height,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Total length:</strong> ${length.toFixed(1)} m</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m</p>
            <p><strong>Base Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>
            ${transformerHtml}
        `);
    });
}
