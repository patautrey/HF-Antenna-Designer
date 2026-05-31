/* ---------------------------------------------------------
   HF Workbench — Multi‑Section Random Wire
   (Segmented longwire with bends, slopes, or direction changes)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Up to 4 wire segments with independent lengths & angles
   - Feedline family + type + length
   - Transformer Requirements (9:1 unun recommended)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseMultiSectionGain(totalLength, frac) {
    const base =
        totalLength < 15 ? -1.0 :
        totalLength < 25 ? -0.3 :
        totalLength < 40 ? 0.2 :
        totalLength < 60 ? 0.5 : 0.8;

    const heightAdj =
        frac < 0.40 ? -0.2 :
        frac < 0.60 ? 0.0 :
        frac < 0.80 ? 0.2 : 0.3;

    return base + heightAdj;
}

export default function initRandomWireMultiSection(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Multi‑Section Random Wire</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="ms-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Section 1 length (m)
                    <input id="ms-l1" type="number" step="0.5" value="10">
                </label>

                <label>Section 2 length (m)
                    <input id="ms-l2" type="number" step="0.5" value="10">
                </label>

                <label>Section 3 length (m)
                    <input id="ms-l3" type="number" step="0.5" value="0">
                </label>

                <label>Section 4 length (m)
                    <input id="ms-l4" type="number" step="0.5" value="0">
                </label>

                <label>Average height (m)
                    <input id="ms-height" type="number" step="0.5" value="8">
                </label>

                <label>Counterpoise length (m)
                    <input id="ms-counter" type="number" step="0.5" value="5">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="ms-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="ms-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="ms-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="ms-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="ms-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="ms-feed-type">
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
                    <input id="ms-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="ms-compute" style="margin-top:1rem;">Compute Multi‑Section Wire</button>

            <div id="ms-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("ms-freq");
    const l1Input = document.getElementById("ms-l1");
    const l2Input = document.getElementById("ms-l2");
    const l3Input = document.getElementById("ms-l3");
    const l4Input = document.getElementById("ms-l4");
    const heightInput = document.getElementById("ms-height");
    const counterInput = document.getElementById("ms-counter");

    const todInput = document.getElementById("ms-tod");
    const seasideInput = document.getElementById("ms-seaside");
    const groundScreenInput = document.getElementById("ms-groundscreen");
    const elevatedInput = document.getElementById("ms-elevated");

    const feedFamilyInput = document.getElementById("ms-feed-family");
    const feedTypeInput = document.getElementById("ms-feed-type");
    const feedLenInput = document.getElementById("ms-feed-length");

    const summaryDiv = document.getElementById("ms-summary");
    const button = document.getElementById("ms-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const l1 = toNumber(l1Input.value);
        const l2 = toNumber(l2Input.value);
        const l3 = toNumber(l3Input.value);
        const l4 = toNumber(l4Input.value);
        const height = toNumber(heightInput.value);
        const counter = toNumber(counterInput.value);

        requireFrequency(freq, errors);
        requirePositive(l1, "Section 1 length", errors);
        requirePositive(l2, "Section 2 length", errors);
        if (l3 < 0 || l4 < 0) errors.push("Section lengths must be zero or positive.");
        requirePositive(height, "Average height", errors);
        requirePositive(counter, "Counterpoise length", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const totalLength = l1 + l2 + l3 + l4;
        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: totalLength
        });

        const baseGain = baseMultiSectionGain(totalLength, geom.frac);

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
        const finalToa = Math.max(22, Math.min(75, geom.toa + boost.toaShift));

        const geomLines = [
            `Section lengths: ${l1} m, ${l2} m, ${l3} m, ${l4} m`,
            `Total length: ${totalLength.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("multiSectionRandomWire", feedFamily);

        log("MultiSectionRandomWire", {
            freq,
            totalLength,
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

            <p><strong>Total wire length:</strong> ${totalLength.toFixed(1)} m</p>

            <p><strong>Base Multi‑Section Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
