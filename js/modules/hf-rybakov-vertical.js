/* ---------------------------------------------------------
   HF Workbench — Rybakov Vertical
   (Long wire fed at the base through a 9:1 unun)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Wire length + vertical height + optional top support
   - Feedline family + type + length
   - Transformer Requirements (9:1 unun + choke)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseRybakovGain(frac) {
    // Rybakov behaves like a vertical with some longwire characteristics
    if (frac < 0.40) return 1.2;
    if (frac < 0.60) return 1.8;
    if (frac < 0.80) return 2.3;
    return 2.6;
}

export default function initRybakovVertical(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Rybakov Vertical (9:1 Unun)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="rv-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Total wire length (m)
                    <input id="rv-length" type="number" step="0.1" value="10">
                </label>

                <label>Vertical height (m)
                    <input id="rv-height" type="number" step="0.1" value="8">
                </label>

                <label>Top support height (m)
                    <input id="rv-top" type="number" step="0.1" value="10">
                </label>

                <label>Counterpoise length (m)
                    <input id="rv-counter" type="number" step="0.1" value="5">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="rv-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="rv-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="rv-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="rv-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="rv-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="rv-feed-type">
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
                    <input id="rv-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="rv-compute" style="margin-top:1rem;">Compute Rybakov Vertical</button>

            <div id="rv-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("rv-freq");
    const lengthInput = document.getElementById("rv-length");
    const heightInput = document.getElementById("rv-height");
    const topInput = document.getElementById("rv-top");
    const counterInput = document.getElementById("rv-counter");

    const todInput = document.getElementById("rv-tod");
    const seasideInput = document.getElementById("rv-seaside");
    const groundScreenInput = document.getElementById("rv-groundscreen");
    const elevatedInput = document.getElementById("rv-elevated");

    const feedFamilyInput = document.getElementById("rv-feed-family");
    const feedTypeInput = document.getElementById("rv-feed-type");
    const feedLenInput = document.getElementById("rv-feed-length");

    const summaryDiv = document.getElementById("rv-summary");
    const button = document.getElementById("rv-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const top = toNumber(topInput.value);
        const counter = toNumber(counterInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(height, "Vertical height", errors);
        requirePositive(top, "Top support height", errors);
        requirePositive(counter, "Counterpoise length", errors);

        if (top < height) {
            errors.push("Top support height must be >= vertical height.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = (height + top) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseRybakovGain(geom.frac);

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

        const finalToa = Math.max(8, Math.min(35, geom.toa + boost.toaShift));

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `Vertical height: ${height.toFixed(1)} m`,
            `Top support height: ${top.toFixed(1)} m`,
            `Counterpoise length: ${counter.toFixed(1)} m`,
            `Average height: ${avgHeight.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("rybakovVertical", feedFamily);

        log("RybakovVertical", {
            freq,
            length,
            height,
            top,
            counter,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Rybakov Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
