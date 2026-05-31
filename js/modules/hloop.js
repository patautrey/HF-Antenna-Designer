/* ---------------------------------------------------------
   HF Workbench — Horizontal Loop
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function loopBaseGain(freqMHz, perimeterM) {
    const lambda = 300 / freqMHz;
    const frac = perimeterM / lambda;
    if (frac < 0.8) return 1.5;
    if (frac < 1.2) return 2.0;
    return 2.4;
}

export default function initHLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Horizontal Loop</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="hl-freq" type="number" step="0.01" value="3.8">
                </label>
                <label>Perimeter (m)
                    <input id="hl-perim" type="number" step="1" value="130">
                </label>
                <label>Height (m)
                    <input id="hl-height" type="number" step="0.5" value="10">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Time of day
                    <select id="hl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label>Feedline type (ladder line)
                    <select id="hl-feed-type">
                        <option value="450Ω">450Ω</option>
                        <option value="300Ω">300Ω</option>
                        <option value="600Ω">600Ω</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="hl-feed-length" type="number" step="5" value="100">
                </label>
            </div>

            <button id="hl-compute" style="margin-top:1rem;">Compute Horizontal Loop</button>

            <div id="hl-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("hl-freq");
    const perimInput = document.getElementById("hl-perim");
    const heightInput = document.getElementById("hl-height");
    const todInput = document.getElementById("hl-tod");
    const feedTypeInput = document.getElementById("hl-feed-type");
    const feedLenInput = document.getElementById("hl-feed-length");

    const summaryDiv = document.getElementById("hl-summary");
    const button = document.getElementById("hl-compute");

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

        const baseGain = loopBaseGain(freq, perim);

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
        const finalToa = Math.max(30, Math.min(80, 90 - (height / (300 / freq)) * 120));

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("hLoop", "ladder");

        log("HLoop", {
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
