/* ---------------------------------------------------------
   HF Workbench — Half‑Wave Vertical (End‑Fed or Center‑Fed)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Feedpoint style (end‑fed / center‑fed)
   - Feedline family + type + length
   - Transformer Requirements (49:1/64:1 for EFHW, 1:1 choke for center‑fed)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseVHWGain(frac) {
    if (frac < 0.40) return 1.9;
    if (frac < 0.60) return 2.3;
    if (frac < 0.80) return 2.6;
    return 2.8;
}

export default function initVerticalHalfwave(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Half‑Wave Vertical</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="vh-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Radiator length (m)
                    <input id="vh-length" type="number" step="0.1" value="10.1">
                </label>

                <label>Base height (m)
                    <input id="vh-height" type="number" step="0.5" value="2">
                </label>

                <label>Feedpoint
                    <select id="vh-feedpoint">
                        <option value="end">End‑fed (EFHW)</option>
                        <option value="center">Center‑fed</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="vh-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vh-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vh-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vh-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="vh-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="vh-feed-type">
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
                    <input id="vh-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="vh-compute" style="margin-top:1rem;">Compute Half‑Wave Vertical</button>

            <div id="vh-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("vh-freq");
    const lengthInput = document.getElementById("vh-length");
    const heightInput = document.getElementById("vh-height");
    const feedpointInput = document.getElementById("vh-feedpoint");

    const todInput = document.getElementById("vh-tod");
    const seasideInput = document.getElementById("vh-seaside");
    const groundScreenInput = document.getElementById("vh-groundscreen");
    const elevatedInput = document.getElementById("vh-elevated");

    const feedFamilyInput = document.getElementById("vh-feed-family");
    const feedTypeInput = document.getElementById("vh-feed-type");
    const feedLenInput = document.getElementById("vh-feed-length");

    const summaryDiv = document.getElementById("vh-summary");
    const button = document.getElementById("vh-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const feedpoint = feedpointInput.value;

        requireFrequency(freq, errors);
        requirePositive(length, "Radiator length", errors);
        requirePositive(height, "Base height", errors);

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

        const baseGain = baseVHWGain(geom.frac);

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
        const finalToa = Math.max(10, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator length: ${length.toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
            `Feedpoint: ${feedpoint === "end" ? "End‑fed (EFHW)" : "Center‑fed"}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote(
            feedpoint === "end" ? "efhwVertical" : "verticalCenterFed",
            feedFamily
        );

        log("VerticalHalfwave", {
            freq,
            length,
            height,
            feedpoint,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
