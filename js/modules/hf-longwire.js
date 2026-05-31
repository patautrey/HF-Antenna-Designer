/* ---------------------------------------------------------
   HF Workbench — Longwire Antenna (Non‑Resonant / Random Wire)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Length + height + counterpoise
   - Feedline family + type + length
   - Transformer Requirements (9:1 unun + ground system notes)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseLongwireGain(frac) {
    if (frac < 0.40) return -0.5;
    if (frac < 0.60) return 0.0;
    if (frac < 0.80) return 0.3;
    return 0.5;
}

export default function initLongwire(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Longwire Antenna (Random Wire)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="lw-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Wire length (m)
                    <input id="lw-length" type="number" step="0.5" value="26">
                </label>

                <label>Average height (m)
                    <input id="lw-height" type="number" step="0.5" value="8">
                </label>

                <label>Counterpoise length (m)
                    <input id="lw-counter" type="number" step="0.5" value="8">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="lw-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="lw-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="lw-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="lw-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="lw-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="lw-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                        <option value="450Ω">450Ω window line</option>
                        <option value="300Ω">300Ω twin-lead</option>
                        <option value="600Ω">600Ω open wire</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="lw-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="lw-compute" style="margin-top:1rem;">Compute Longwire</button>

            <div id="lw-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("lw-freq");
    const lengthInput = document.getElementById("lw-length");
    const heightInput = document.getElementById("lw-height");
    const counterInput = document.getElementById("lw-counter");

    const todInput = document.getElementById("lw-tod");
    const seasideInput = document.getElementById("lw-seaside");
    const groundScreenInput = document.getElementById("lw-groundscreen");
    const elevatedInput = document.getElementById("lw-elevated");

    const feedFamilyInput = document.getElementById("lw-feed-family");
    const feedTypeInput = document.getElementById("lw-feed-type");
    const feedLenInput = document.getElementById("lw-feed-length");

    const summaryDiv = document.getElementById("lw-summary");
    const button = document.getElementById("lw-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const counter = toNumber(counterInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(height, "Average height", errors);
        requirePositive(counter, "Counterpoise length", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: length
        });

        const baseGain = baseLongwireGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: false,
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(25, Math.min(75, geom.toa + boost.toaShift));

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `Average height: ${height.toFixed(1)} m`,
            `Counterpoise: ${counter.toFixed(1)} m`,
            ...(geom.components.length ? geom.components.map(c => c.note ?? "") : [])
        ].join("<br>");

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("longwire", feedFamily);

        log("Longwire", {
            freq,
            length,
            height,
            counter,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Longwire Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
