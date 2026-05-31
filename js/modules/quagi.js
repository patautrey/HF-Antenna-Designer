/* ---------------------------------------------------------
   HF Workbench — Quagi (Quad + Yagi Hybrid)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Quad loop driven element + reflector
   - Optional Yagi-style directors
   - Feedline family + type + length
   - Transformer Requirements (1:1 current balun)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseQuagiGain(elementCount, frac) {
    const base =
        elementCount === 2 ? 5.2 :
        elementCount === 3 ? 6.4 :
        elementCount === 4 ? 7.2 :
        elementCount === 5 ? 7.8 : 8.1;

    const heightAdj =
        frac < 0.40 ? -0.3 :
        frac < 0.60 ? 0.0 :
        frac < 0.80 ? 0.2 : 0.3;

    return base + heightAdj;
}

export default function initQuagi(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Quagi (Quad + Yagi Hybrid)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="qg-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Element count (2–6)
                    <input id="qg-count" type="number" min="2" max="6" step="1" value="3">
                </label>

                <label>Quad driven loop perimeter (m)
                    <input id="qg-driven" type="number" step="0.1" value="11.2">
                </label>

                <label>Quad reflector loop perimeter (m)
                    <input id="qg-reflector" type="number" step="0.1" value="12.0">
                </label>

                <label>Director length (m)
                    <input id="qg-director" type="number" step="0.1" value="9.7">
                </label>

                <label>Element spacing (m)
                    <input id="qg-spacing" type="number" step="0.05" value="0.3">
                </label>

                <label>Height (m)
                    <input id="qg-height" type="number" step="0.5" value="10">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="qg-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="qg-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="qg-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="qg-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="qg-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="qg-feed-type">
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
                    <input id="qg-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="qg-compute" style="margin-top:1rem;">Compute Quagi</button>

            <div id="qg-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("qg-freq");
    const countInput = document.getElementById("qg-count");
    const drivenInput = document.getElementById("qg-driven");
    const reflInput = document.getElementById("qg-reflector");
    const dirInput = document.getElementById("qg-director");
    const spacingInput = document.getElementById("qg-spacing");
    const heightInput = document.getElementById("qg-height");

    const todInput = document.getElementById("qg-tod");
    const seasideInput = document.getElementById("qg-seaside");
    const groundScreenInput = document.getElementById("qg-groundscreen");
    const elevatedInput = document.getElementById("qg-elevated");

    const feedFamilyInput = document.getElementById("qg-feed-family");
    const feedTypeInput = document.getElementById("qg-feed-type");
    const feedLenInput = document.getElementById("qg-feed-length");

    const summaryDiv = document.getElementById("qg-summary");
    const button = document.getElementById("qg-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const count = toNumber(countInput.value);
        const driven = toNumber(drivenInput.value);
        const refl = toNumber(reflInput.value);
        const dir = toNumber(dirInput.value);
        const spacing = toNumber(spacingInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(driven, "Driven loop perimeter", errors);
        requirePositive(refl, "Reflector loop perimeter", errors);
        requirePositive(dir, "Director length", errors);
        requirePositive(spacing, "Element spacing", errors);
        requirePositive(height, "Height", errors);

        if (count < 2 || count > 6) {
            errors.push("Element count must be between 2 and 6.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: driven
        });

        const baseGain = baseQuagiGain(count, geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
            directorCount: count - 2,
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
        const finalToa = Math.max(10, Math.min(55, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven loop perimeter: ${driven.toFixed(2)} m`,
            `Reflector loop perimeter: ${refl.toFixed(2)} m`,
            `Director length: ${dir.toFixed(2)} m`,
            `Element spacing: ${spacing.toFixed(2)} m`,
            `Element count: ${count}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("quagi", feedFamily);

        log("Quagi", {
            freq,
            count,
            driven,
            refl,
            dir,
            spacing
