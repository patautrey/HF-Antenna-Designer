/* ---------------------------------------------------------
   HF Workbench — Random Wire
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function randomWireBaseGain(freqMHz, lengthM) {
    const lambda = 300 / freqMHz;
    const frac = lengthM / lambda;
    if (frac < 0.25) return 0.5;
    if (frac < 0.5) return 1.0;
    return 1.5;
}

export default function initRandomWire(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Random Wire</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="rw-freq" type="number" step="0.01" value="7.1">
                </label>
                <label>Wire length (m)
                    <input id="rw-length" type="number" step="0.5" value="20">
                </label>
                <label>Average height (m)
                    <input id="rw-height" type="number" step="0.5" value="6">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Time of day
                    <select id="rw-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label>Feedline type
                    <select id="rw-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="rw-feed-length" type="number" step="5" value="50">
                </label>
            </div>

            <button id="rw-compute" style="margin-top:1rem;">Compute Random Wire</button>

            <div id="rw-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("rw-freq");
    const lengthInput = document.getElementById("rw-length");
    const heightInput = document.getElementById("rw-height");
    const todInput = document.getElementById("rw-tod");
    const feedTypeInput = document.getElementById("rw-feed-type");
    const feedLenInput = document.getElementById("rw-feed-length");

    const summaryDiv = document.getElementById("rw-summary");
    const button = document.getElementById("rw-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(height, "Average height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const baseGain = randomWireBaseGain(freq, length);

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
        const finalToa = Math.max(25, Math.min(80, 90 - (height / (300 / freq)) * 120));

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("randomWire", "coax");

        log("RandomWire", {
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
            <p><strong>Wire length:</strong> ${length.toFixed(1)} m</p>
            <p><strong>Average height:</strong> ${height.toFixed(1)} m</p>
            <p><strong>Base Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>
            ${transformerHtml}
        `);
    });
}
