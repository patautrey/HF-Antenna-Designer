/* ---------------------------------------------------------
   HF Workbench — Skyloop
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function skyloopBaseGain(freqMHz, perimeterM) {
    const lambda = 300 / freqMHz;
    const frac = perimeterM / lambda;
    if (frac < 0.8) return 1.8;
    if (frac < 1.2) return 2.3;
    return 2.7;
}

export default function initSkyloop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Skyloop</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="sl-freq" type="number" step="0.01" value="3.8">
                </label>
                <label>Perimeter (m)
                    <input id="sl-perim" type="number" step="1" value="130">
                </label>
                <label>Height (m)
                    <input id="sl-height" type="number" step="0.5" value="15">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Time of day
                    <select id="sl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label>Feedline type (ladder line)
                    <select id="sl-feed-type">
                        <option value="450Ω">450Ω</option>
                        <option value="300Ω">300Ω</option>
                        <option value="600Ω">600Ω</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="sl-feed-length" type="number" step="5" value="100">
                </label>
            </div>

            <button id="sl-compute" style="margin-top:1rem;">Compute Skyloop</button>

            <div id="sl-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("sl-freq");
    const perimInput = document.getElementById("sl-perim");
    const heightInput = document.getElementById("sl-height");
    const todInput = document.getElementById("sl-tod");
    const feedTypeInput = document.getElementById("sl-feed-type");
    const feedLenInput = document.getElementById("sl-feed-length");

    const summaryDiv = document.getElementById("sl-summary");
    const button = document.getElementById("sl-compute");

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

        const baseGain = skyloopBaseGain(freq, perim);

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

        const transformerHtml = TransformerEngine.getTransformerNote("skyloop", "ladder");

        log("Skyloop", {
            freq,
            perim,
            height,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Perimeter:</strong> ${perim.toFixed(1)} m</p>
            <p><strong>Height:</strong> ${height.toFixed(1)} m</p>
            <p><strong>Base Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>
            ${transformerHtml}
        `);
    });
}
